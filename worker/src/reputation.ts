import { notify, q } from "./db";

/**
 * Recomputes each source's reputation weight from real outcomes: the average
 * 60-minute price multiple of tokens that source's calls led to a passed
 * evaluation for. Weight is a display/priority signal (shown in the admin
 * panel, used to bias alert ordering) — it never changes the score itself,
 * so a bad source can't quietly suppress an otherwise-correct evaluation.
 */
export async function recomputeReputation() {
  const rows = await q<{ id: string; n: number; avg_multiple: number | null }>(
    `select s.id,
            count(o.multiple)::int as n,
            avg(o.multiple) as avg_multiple
       from sources s
       join tokens t on t.first_source_id = s.id
       join evaluations e on e.token_address = t.address and e.passed
       join outcomes o on o.token_address = t.address and o.horizon_min = 60
      where s.kind in ('telegram_channel', 'telegram_bot', 'onchain_feed')
      group by s.id`,
  );
  for (const r of rows) {
    // Fewer than 5 outcomes: not enough signal, keep weight at neutral 1.0.
    const weight = r.n < 5 ? 1 : Math.min(2, Math.max(0.2, (r.avg_multiple ?? 1) / 1.3));
    await q(
      `update sources set weight = $2, reputation_sample = $3, avg_multiple_60m = $4, reputation_updated_at = now()
         where id = $1`,
      [r.id, Number(weight.toFixed(2)), r.n, r.avg_multiple],
    );
  }
  await notify("alpha_events", { type: "reputation" });
}
