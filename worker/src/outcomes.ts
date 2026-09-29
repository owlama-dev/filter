import { q } from "./db";
import { markDeployerRug } from "./providers/deployer";
import { getPairs, pickPair } from "./providers/dexscreener";

const RUG_MULTIPLE = 0.3; // 60m price fell below 30% of entry -> treat as a rug for reputation purposes

export async function handleOutcome(payload: { address: string; evalId: number; horizonMin: number }) {
  const [ev] = await q<{ base: number | null }>(
    "select nullif(market->>'priceUsd', '')::numeric as base from evaluations where id = $1",
    [payload.evalId],
  );
  const pair = pickPair(payload.address, await getPairs(payload.address));
  const price = pair?.priceUsd ? Number(pair.priceUsd) : null;
  const base = ev?.base ?? null;
  // A vanished pair (rug / delisted) is a real outcome: record it as a 0x multiple.
  const multiple = base && base > 0 ? (price != null ? price / base : 0) : null;
  await q(
    `insert into outcomes (token_address, horizon_min, price_usd, mcap_usd, multiple)
     values ($1, $2, $3, $4, $5)
     on conflict (token_address, horizon_min) do update set price_usd = excluded.price_usd,
       mcap_usd = excluded.mcap_usd, multiple = excluded.multiple, checked_at = now()`,
    [payload.address, payload.horizonMin, price, pair?.marketCap ?? pair?.fdv ?? null, multiple],
  );
  if (payload.horizonMin === 60 && multiple != null && multiple <= RUG_MULTIPLE) {
    await markDeployerRug(payload.address).catch(() => undefined);
  }
}
