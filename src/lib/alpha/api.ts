import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { QUOTE_MINTS } from "./defaults";
import { isSolanaMint } from "./extract";
import { emptyMetrics } from "./scoring";
import type { HolderRow, LaunchCandidate, MarketMetrics, OnchainFacts } from "./types";

const RPCS = [
  "https://solana-rpc.publicnode.com",
  "https://api.mainnet-beta.solana.com",
];

async function fetchJson<T>(url: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return (await res.json()) as T;
}

type GeckoPool = {
  id: string;
  attributes: {
    address: string;
    name: string;
    pool_created_at: string | null;
    fdv_usd: string | null;
    market_cap_usd: string | null;
    reserve_in_usd: string | null;
    volume_usd?: { h24?: string; h1?: string };
  };
  relationships?: {
    base_token?: { data?: { id: string } };
    quote_token?: { data?: { id: string } };
    dex?: { data?: { id: string } };
  };
};

type GeckoToken = {
  id: string;
  type: string;
  attributes: {
    address: string;
    name: string;
    symbol: string;
    image_url: string | null;
  };
};

type GeckoResponse = {
  data?: GeckoPool[];
  included?: GeckoToken[];
};

function ageMin(createdAt: string | null | number | undefined) {
  if (createdAt == null) return null;
  const ts = typeof createdAt === "number" ? createdAt : Date.parse(createdAt);
  if (!Number.isFinite(ts)) return null;
  return Math.max(0, (Date.now() - ts) / 60000);
}

function num(v: string | number | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function tokenAddr(id: string | undefined) {
  if (!id) return null;
  return id.startsWith("solana_") ? id.slice("solana_".length) : id;
}

function fromGecko(res: GeckoResponse): LaunchCandidate[] {
  const tokens = new Map<string, GeckoToken>();
  for (const row of res.included ?? []) {
    if (row.type === "token") tokens.set(row.id, row);
  }
  const out: LaunchCandidate[] = [];
  for (const pool of res.data ?? []) {
    const baseId = pool.relationships?.base_token?.data?.id;
    const quoteId = pool.relationships?.quote_token?.data?.id;
    const base = tokens.get(baseId ?? "");
    const quote = tokens.get(quoteId ?? "");
    let mint = base?.attributes.address ?? tokenAddr(baseId);
    let name = base?.attributes.name ?? pool.attributes.name;
    let symbol = base?.attributes.symbol ?? pool.attributes.name.split("/")[0] ?? "???";
    const quoteMint = quote?.attributes.address ?? tokenAddr(quoteId);
    if (mint && QUOTE_MINTS.has(mint) && quoteMint && !QUOTE_MINTS.has(quoteMint)) {
      mint = quoteMint;
      name = quote?.attributes.name ?? name;
      symbol = quote?.attributes.symbol ?? symbol;
    }
    if (!mint || !isSolanaMint(mint)) continue;
    out.push({
      address: mint,
      name: name || symbol || "Unknown",
      symbol: (symbol || "???").slice(0, 12),
      dexId: pool.relationships?.dex?.data?.id ?? null,
      pairAddress: pool.attributes.address,
      imageUrl: base?.attributes.image_url ?? null,
      liquidityUsd: num(pool.attributes.reserve_in_usd),
      mcapUsd: num(pool.attributes.market_cap_usd) ?? num(pool.attributes.fdv_usd),
      volume24h: num(pool.attributes.volume_usd?.h24),
      pairAgeMin: ageMin(pool.attributes.pool_created_at),
      createdAt: pool.attributes.pool_created_at,
    });
  }
  return out;
}

async function gecko(path: string) {
  return fetchJson<GeckoResponse>(
    `https://api.geckoterminal.com/api/v2/networks/solana/${path}?include=base_token,quote_token,dex&page=1`,
    { headers: { accept: "application/json;version=20230302" } },
  );
}

export const listLaunchTape = createServerFn({ method: "GET" }).handler(async () => {
  // This app is source-driven: real launch data arrives from the configured
  // source feed and should not be hard-wired to a third-party vendor endpoint.
  // If no valid source is configured, the tape stays empty until the user adds one.
  const launches: LaunchCandidate[] = [];
  return { launches, fetchedAt: Date.now(), source: "source-driven-empty" };
});

type DexPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  fdv?: number;
  marketCap?: number;
  liquidity?: { usd?: number };
  volume?: { h24?: number; h1?: number; m5?: number };
  txns?: {
    h24?: { buys?: number; sells?: number };
    h1?: { buys?: number; sells?: number };
  };
  priceChange?: { h24?: number };
  pairCreatedAt?: number;
};

function pickPair(address: string, pairs: DexPair[] | undefined): DexPair | null {
  const sol = (pairs ?? []).filter((p) => p.chainId === "solana");
  const ranked = (sol.length ? sol : (pairs ?? [])).slice().sort((a, b) => {
    const al = a.liquidity?.usd ?? 0;
    const bl = b.liquidity?.usd ?? 0;
    return bl - al;
  });
  return (
    ranked.find(
      (p) => p.baseToken.address === address || p.quoteToken.address === address,
    ) ??
    ranked[0] ??
    null
  );
}

function metricsFromPair(address: string, pair: DexPair | null): MarketMetrics {
  const m = emptyMetrics();
  if (!pair) return m;
  const baseIsMint = pair.baseToken.address === address;
  m.priceUsd = num(pair.priceUsd);
  m.liquidityUsd = pair.liquidity?.usd ?? null;
  m.volume24h = pair.volume?.h24 ?? null;
  m.volume1h = pair.volume?.h1 ?? null;
  m.volume5m = pair.volume?.m5 ?? null;
  m.mcapUsd = pair.marketCap ?? pair.fdv ?? null;
  m.fdvUsd = pair.fdv ?? null;
  m.buys24h = pair.txns?.h24?.buys ?? null;
  m.sells24h = pair.txns?.h24?.sells ?? null;
  m.buys1h = pair.txns?.h1?.buys ?? null;
  m.sells1h = pair.txns?.h1?.sells ?? null;
  m.pairAgeMin = ageMin(pair.pairCreatedAt);
  m.dexId = pair.dexId ?? null;
  m.pairAddress = pair.pairAddress ?? null;
  m.pairUrl = pair.url ?? null;
  m.priceChange24h = pair.priceChange?.h24 ?? null;
  if (!baseIsMint && pair.quoteToken.address === address) {
    m.dexId = pair.dexId;
  }
  return m;
}

async function rpc(method: string, params: unknown[]) {
  let lastErr: unknown;
  for (const url of RPCS) {
    try {
      const json = await fetchJson<{ result?: { value?: unknown }; error?: { message?: string } }>(
        url,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        },
        7000,
      );
      if (json.error) throw new Error(json.error.message ?? "rpc error");
      return json.result?.value;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("rpc failed");
}

async function readMint(address: string): Promise<OnchainFacts> {
  const facts: OnchainFacts = {
    mintAuthority: undefined,
    freezeAuthority: undefined,
    decimals: null,
    supply: null,
    tokenProgram: null,
    topHolders: [],
    holderCoveragePct: null,
    queriedAt: null,
  };
  try {
    const value = (await rpc("getAccountInfo", [
      address,
      { encoding: "jsonParsed" },
    ])) as {
      owner?: string;
      data?: {
        parsed?: {
          info?: {
            mintAuthority?: string | null;
            freezeAuthority?: string | null;
            decimals?: number;
            supply?: string;
          };
        };
      };
    } | null;
    if (!value) return facts;
    const info = value.data?.parsed?.info;
    facts.tokenProgram = value.owner ?? null;
    facts.mintAuthority = info?.mintAuthority ?? null;
    facts.freezeAuthority = info?.freezeAuthority ?? null;
    facts.decimals = info?.decimals ?? null;
    facts.supply = info?.supply ?? null;
    facts.queriedAt = Date.now();
  } catch {
    return facts;
  }

  try {
    const largest = (await rpc("getTokenLargestAccounts", [address])) as {
      amount?: string;
      uiAmount?: number;
      address?: string;
    }[];
    const supply = facts.supply ? Number(facts.supply) : 0;
    const decimals = facts.decimals ?? 0;
    const rows: HolderRow[] = [];
    let covered = 0;
    for (const row of largest ?? []) {
      const ui = row.uiAmount ?? (row.amount ? Number(row.amount) / 10 ** decimals : 0);
      const raw = row.amount ? Number(row.amount) : ui * 10 ** decimals;
      const pct = supply > 0 ? (raw / supply) * 100 : 0;
      covered += pct;
      rows.push({ address: row.address ?? "", pct, uiAmount: ui });
    }
    facts.topHolders = rows;
    facts.holderCoveragePct = covered;
  } catch {
    // rate-limit is common; scoring still works off market tape
  }
  return facts;
}

export const inspectMint = createServerFn({ method: "POST" })
  .validator(z.object({ address: z.string().min(32).max(44) }))
  .handler(async ({ data }) => {
    const address = data.address.trim();
    if (!isSolanaMint(address)) {
      throw new Error("Not a Solana mint");
    }
    const [dex, onchain] = await Promise.allSettled([
      fetchJson<{ pairs?: DexPair[] }>(
        `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      ),
      readMint(address),
    ]);

    const pairs = dex.status === "fulfilled" ? dex.value.pairs : [];
    const pair = pickPair(address, pairs);
    const market = metricsFromPair(address, pair);
    const base = pair?.baseToken.address === address ? pair.baseToken : pair?.quoteToken.address === address ? pair.quoteToken : pair?.baseToken;

    return {
      address,
      name: base?.name ?? shortUnknown(address),
      symbol: (base?.symbol ?? "???").slice(0, 14),
      market,
      onchain: onchain.status === "fulfilled" ? onchain.value : {
        mintAuthority: undefined,
        freezeAuthority: undefined,
        decimals: null,
        supply: null,
        tokenProgram: null,
        topHolders: [],
        holderCoveragePct: null,
        queriedAt: null,
      },
      imageUrl: null as string | null,
    };
  });

function shortUnknown(address: string) {
  return `token ${address.slice(0, 4)}`;
}
