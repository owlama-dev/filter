import { emptyMetrics } from "../../../src/lib/alpha/scoring";
import type { MarketMetrics } from "../../../src/lib/alpha/types";
import { Limiter, callProvider, fetchJson } from "./http";

export type DexPair = {
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
  txns?: { h24?: { buys?: number; sells?: number }; h1?: { buys?: number; sells?: number } };
  priceChange?: { h24?: number };
  pairCreatedAt?: number;
};

const limiter = new Limiter(4); // 4 req/s
const TTL_MS = 20_000;
const cache = new Map<string, { at: number; pairs: DexPair[] }>();

type Waiter = { address: string; resolve: (p: DexPair[]) => void; reject: (e: unknown) => void };
let waiting: Waiter[] = [];
let timer: NodeJS.Timeout | null = null;

/**
 * Coalesces lookups made within 60ms into one batched request of up to 30
 * mints, so the worker can evaluate dozens of tokens a minute within limits.
 */
export function getPairs(address: string): Promise<DexPair[]> {
  const hit = cache.get(address);
  if (hit && Date.now() - hit.at < TTL_MS) return Promise.resolve(hit.pairs);
  return new Promise((resolve, reject) => {
    waiting.push({ address, resolve, reject });
    if (waiting.length >= 30) void flush();
    else if (!timer) timer = setTimeout(() => void flush(), 60);
  });
}

async function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  const batch = waiting.splice(0, 30);
  if (!batch.length) return;
  if (waiting.length) timer = setTimeout(() => void flush(), 0);
  const unique = [...new Set(batch.map((b) => b.address))];
  try {
    const pairs = await callProvider("dexscreener", limiter, () =>
      fetchJson<DexPair[]>(`https://api.dexscreener.com/tokens/v1/solana/${unique.join(",")}`, undefined, 10_000),
    );
    for (const address of unique) {
      const mine = (Array.isArray(pairs) ? pairs : []).filter(
        (p) => p.baseToken.address === address || p.quoteToken.address === address,
      );
      cache.set(address, { at: Date.now(), pairs: mine });
    }
    for (const b of batch) b.resolve(cache.get(b.address)?.pairs ?? []);
  } catch (err) {
    for (const b of batch) b.reject(err);
  }
}

const ageMin = (ts?: number) => (ts ? Math.max(0, (Date.now() - ts) / 60000) : null);
const num = (v: string | undefined) => {
  const n = v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : null;
};

export function pickPair(address: string, pairs: DexPair[]): DexPair | null {
  const sol = pairs.filter((p) => p.chainId === "solana");
  const ranked = (sol.length ? sol : pairs)
    .slice()
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
  return (
    ranked.find((p) => p.baseToken.address === address || p.quoteToken.address === address) ?? ranked[0] ?? null
  );
}

export function metricsFromPair(pair: DexPair | null): MarketMetrics {
  const m = emptyMetrics();
  if (!pair) return m;
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
  return m;
}
