import { QUOTE_MINTS } from "../../../src/lib/alpha/defaults";
import { isSolanaMint } from "../../../src/lib/alpha/extract";
import type { LaunchCandidate } from "../../../src/lib/alpha/types";
import { Limiter, callProvider, fetchJson } from "./http";

const limiter = new Limiter(0.4); // free tier is ~30/min; stay well under

type Pool = {
  attributes: {
    address: string;
    name: string;
    pool_created_at: string | null;
    fdv_usd: string | null;
    market_cap_usd: string | null;
    reserve_in_usd: string | null;
    volume_usd?: { h24?: string };
  };
  relationships?: {
    base_token?: { data?: { id: string } };
    quote_token?: { data?: { id: string } };
    dex?: { data?: { id: string } };
  };
};
type Tok = { id: string; type: string; attributes: { address: string; name: string; symbol: string; image_url: string | null } };
type Res = { data?: Pool[]; included?: Tok[] };

const num = (v: string | null | undefined) => {
  const n = v == null || v === "" ? NaN : Number(v);
  return Number.isFinite(n) ? n : null;
};
const tokenAddr = (id?: string) => (id ? (id.startsWith("solana_") ? id.slice(7) : id) : null);

export async function fetchPools(kind: "new_pools" | "trending_pools"): Promise<LaunchCandidate[]> {
  const res = await callProvider("geckoterminal", limiter, () =>
    fetchJson<Res>(
      `https://api.geckoterminal.com/api/v2/networks/solana/${kind}?include=base_token,quote_token,dex&page=1`,
      { headers: { accept: "application/json;version=20230302" } },
    ),
  );
  const toks = new Map<string, Tok>();
  for (const t of res.included ?? []) if (t.type === "token") toks.set(t.id, t);
  const out: LaunchCandidate[] = [];
  for (const pool of res.data ?? []) {
    const baseId = pool.relationships?.base_token?.data?.id;
    const quoteId = pool.relationships?.quote_token?.data?.id;
    const base = toks.get(baseId ?? "");
    const quote = toks.get(quoteId ?? "");
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
    const created = pool.attributes.pool_created_at;
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
      pairAgeMin: created ? Math.max(0, (Date.now() - Date.parse(created)) / 60000) : null,
      createdAt: created,
    });
  }
  return out;
}
