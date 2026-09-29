import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isSolanaMint } from "./extract";
import { emptyMetrics } from "./scoring";
import type {
  BundleTrail,
  DeployerTrail,
  FreshWalletTrail,
  HolderRow,
  LaunchCandidate,
  LpTrail,
  MarketMetrics,
  OnchainFacts,
} from "./types";
import { getSql } from "@/lib/db";

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

export const listLaunchTape = createServerFn({ method: "GET" }).handler(async () => {
  const boosts = await fetchJson<{ tokenAddress?: string; chainId?: string }[]>(
    "https://api.dexscreener.com/token-boosts/latest/v1",
  );
  const addresses = (boosts ?? [])
    .filter((row) => row.chainId === "solana" && row.tokenAddress && isSolanaMint(row.tokenAddress))
    .slice(0, 30)
    .map((row) => row.tokenAddress!);
  const pairs = await fetchJson<DexPair[]>(
    `https://api.dexscreener.com/tokens/v1/solana/${addresses.join(",")}`,
  );
  const launches = addresses.flatMap((address) => {
    const pair = pickPair(address, pairs);
    if (!pair) return [];
    const market = metricsFromPair(address, pair);
    const base = pair.baseToken.address === address ? pair.baseToken : pair.quoteToken;
    return [{
      address,
      name: base.name,
      symbol: base.symbol.slice(0, 12),
      dexId: pair.dexId ?? null,
      pairAddress: pair.pairAddress ?? null,
      imageUrl: null,
      liquidityUsd: market.liquidityUsd,
      mcapUsd: market.mcapUsd,
      volume24h: market.volume24h,
      pairAgeMin: market.pairAgeMin,
      createdAt: pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : null,
    } satisfies LaunchCandidate];
  });
  return { launches, fetchedAt: Date.now(), source: "dexscreener" };
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
      return json.result?.value ?? json.result;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("rpc failed");
}

type Sig = { signature: string; slot: number; blockTime: number | null; err: unknown };

async function getSignatures(address: string, limit: number) {
  const out: Sig[] = [];
  let before: string | undefined;
  while (out.length < limit) {
    const page = (await rpc("getSignaturesForAddress", [
      address,
      { limit: Math.min(1000, limit - out.length), ...(before ? { before } : {}) },
    ])) as Sig[];
    if (!page?.length) break;
    out.push(...page);
    before = page[page.length - 1]?.signature;
    if (page.length < 1000) break;
  }
  return out;
}

type Transaction = {
  blockTime?: number | null;
  transaction?: {
    message?: {
      accountKeys?: (string | { pubkey?: string; signer?: boolean })[];
    };
  };
};

function signersOf(tx: Transaction | null) {
  return (tx?.transaction?.message?.accountKeys ?? [])
    .filter((key) => typeof key === "string" || key.signer)
    .map((key) => (typeof key === "string" ? key : key.pubkey))
    .filter((key): key is string => Boolean(key));
}

async function traceBundle(address: string): Promise<BundleTrail | null> {
  try {
    const signatures = await getSignatures(address, 60);
    if (!signatures.length) return null;
    const chronological = signatures.slice().reverse();
    const creationSlot = chronological[0]!.slot;
    const early = chronological.slice(0, 40);
    const sameSlotTxCount = early.filter((row) => row.slot === creationSlot).length;
    return {
      creationSlot,
      earlyTxCount: early.length,
      sameSlotTxCount,
      sameSlotPct: early.length ? (sameSlotTxCount / early.length) * 100 : null,
      tracedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

async function traceDeployer(address: string): Promise<DeployerTrail | null> {
  try {
    const signatures = await getSignatures(address, 1000);
    const earliest = signatures[signatures.length - 1];
    if (!earliest) return null;
    const tx = (await rpc("getTransaction", [
      earliest.signature,
      { maxSupportedTransactionVersion: 0, encoding: "json" },
    ])) as Transaction | null;
    const wallet = signersOf(tx)[0];
    if (!wallet) return null;

    let walletTxCount: number | null = null;
    let walletAgeDays: number | null = null;
    try {
      const walletSignatures = await getSignatures(wallet, 100);
      walletTxCount = walletSignatures.length;
      const oldest = walletSignatures[walletSignatures.length - 1];
      if (oldest?.blockTime) walletAgeDays = (Date.now() / 1000 - oldest.blockTime) / 86400;
    } catch {
      // The ledger still records the wallet when its history is rate-limited.
    }

    let priorMintCount = 0;
    let priorRugCount = 0;
    try {
      const sql = await getSql();
      const [row] = await sql.query<{ mint_count: number; rug_count: number }>(
        "select mint_count, rug_count from dev_wallets where wallet = $1",
        [wallet],
      );
      priorMintCount = row?.mint_count ?? 0;
      priorRugCount = row?.rug_count ?? 0;
      await sql.query(
        `insert into dev_wallets (wallet, tx_count, mint_count) values ($1, $2, 1)
         on conflict (wallet) do update set tx_count = coalesce(excluded.tx_count, dev_wallets.tx_count),
           mint_count = dev_wallets.mint_count + 1, updated_at = now()`,
        [wallet, walletTxCount],
      );
    } catch {
      // Public RPC tracing remains useful even when the optional ledger is unavailable.
    }

    return { wallet, walletAgeDays, walletTxCount, priorMintCount, priorRugCount, tracedAt: Date.now() };
  } catch {
    return null;
  }
}

async function traceFreshWallets(address: string): Promise<FreshWalletTrail | null> {
  try {
    const signatures = (await getSignatures(address, 40)).slice().reverse();
    const signers = new Set<string>();
    for (const row of signatures) {
      const tx = (await rpc("getTransaction", [
        row.signature,
        { maxSupportedTransactionVersion: 0, encoding: "json" },
      ])) as Transaction | null;
      for (const signer of signersOf(tx)) signers.add(signer);
      if (signers.size >= 40) break;
    }
    const buyers = [...signers].slice(0, 12);
    if (!buyers.length) return null;
    const ages: number[] = [];
    for (const wallet of buyers) {
      try {
        const history = await getSignatures(wallet, 100);
        const oldest = history[history.length - 1];
        if (oldest?.blockTime) ages.push((Date.now() / 1000 - oldest.blockTime) / 86400);
      } catch {
        // One wallet's history must not erase the rest of the sample.
      }
    }
    ages.sort((a, b) => a - b);
    const median = ages.length ? ages[Math.floor(ages.length / 2)]! : null;
    const freshBuyerCount = ages.filter((age) => age <= 7).length;
    return {
      earlyBuyerCount: buyers.length,
      freshBuyerCount,
      freshRatioPct: ages.length ? (freshBuyerCount / ages.length) * 100 : null,
      fundedAgeDaysMedian: median,
      tracedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

async function traceLp(pairAddress: string | null, dexId: string | null): Promise<LpTrail | null> {
  if (!pairAddress) return null;
  try {
    const account = (await rpc("getAccountInfo", [pairAddress, { encoding: "jsonParsed" }])) as {
      owner?: string;
      value?: { owner?: string } | null;
    } | null;
    const poolAccountOwner = account?.owner ?? account?.value?.owner ?? null;
    const reserves = (await rpc("getTokenAccountsByOwner", [
      pairAddress,
      { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
      { encoding: "jsonParsed" },
    ])) as { value?: unknown[] } | unknown[];
    const reserveTokenAccounts = Array.isArray(reserves) ? reserves.length : reserves?.value?.length ?? 0;
    return {
      poolAddress: pairAddress,
      dexId,
      poolAccountOwner,
      poolAccountReadable: Boolean(account),
      reserveTokenAccounts,
      lpMint: null,
      burnedOrLockedPct: null,
      tracedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

async function readMint(address: string, pairAddress: string | null, dexId: string | null): Promise<OnchainFacts> {
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
    const accounts = rows.map((row) => row.address).filter(Boolean);
    if (accounts.length) {
      try {
        const details = (await rpc("getMultipleAccounts", [accounts, { encoding: "jsonParsed" }])) as {
          value?: { data?: { parsed?: { info?: { owner?: string } } } }[];
        };
        const owners = details.value ?? [];
        const totals = new Map<string, number>();
        rows.forEach((row, index) => {
          const owner = owners[index]?.data?.parsed?.info?.owner ?? null;
          row.owner = owner;
          if (owner) totals.set(owner, (totals.get(owner) ?? 0) + row.pct);
        });
        rows.forEach((row) => {
          row.clusterPct = row.owner ? totals.get(row.owner) : row.pct;
        });
      } catch {
        // The largest-account result remains usable without owner metadata.
      }
    }
    facts.topHolders = rows;
    facts.holderCoveragePct = covered;
  } catch {
    // rate-limit is common; scoring still works off market tape
  }
  facts.lp = await traceLp(pairAddress, dexId);
  const [deployer, bundle, freshWallets] = await Promise.all([
    traceDeployer(address),
    traceBundle(address),
    traceFreshWallets(address),
  ]);
  facts.deployer = deployer;
  facts.bundle = bundle;
  facts.freshWallets = freshWallets;
  return facts;
}

export const inspectMint = createServerFn({ method: "POST" })
  .validator(z.object({ address: z.string().min(32).max(44) }))
  .handler(async ({ data }) => {
    const address = data.address.trim();
    if (!isSolanaMint(address)) {
      throw new Error("Not a Solana mint");
    }
    const dex = await Promise.allSettled([
      fetchJson<{ pairs?: DexPair[] }>(
        `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      ),
    ]);
    const pairs = dex[0].status === "fulfilled" ? dex[0].value.pairs : [];
    const pair = pickPair(address, pairs);
    const market = metricsFromPair(address, pair);
    const base = pair?.baseToken.address === address ? pair.baseToken : pair?.quoteToken.address === address ? pair.quoteToken : pair?.baseToken;
    const onchain = await readMint(address, pair?.pairAddress ?? null, pair?.dexId ?? null);

    return {
      address,
      name: base?.name ?? shortUnknown(address),
      symbol: (base?.symbol ?? "???").slice(0, 14),
      market,
      onchain,
      imageUrl: null as string | null,
    };
  });

function shortUnknown(address: string) {
  return `token ${address.slice(0, 4)}`;
}
