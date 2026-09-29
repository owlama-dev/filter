import { q } from "./db";

export type JobKind = "evaluate" | "outcome";
export interface Job {
  id: number;
  kind: JobKind;
  payload: Record<string, unknown>;
  attempts: number;
}

export async function enqueue(kind: JobKind, payload: Record<string, unknown>, delaySec = 0) {
  await q("insert into jobs (kind, payload, run_at) values ($1, $2::jsonb, now() + make_interval(secs => $3))", [
    kind,
    JSON.stringify(payload),
    delaySec,
  ]);
}

/** Atomically claim ready jobs. SKIP LOCKED lets several workers run safely. */
export async function claim(kinds: JobKind[], limit: number): Promise<Job[]> {
  return q<Job>(
    `update jobs set locked_at = now(), attempts = attempts + 1
      where id in (
        select id from jobs
         where done_at is null and locked_at is null and run_at <= now() and kind = any($1)
         order by run_at
         limit $2
         for update skip locked)
      returning id, kind, payload, attempts`,
    [kinds, limit],
  );
}

export async function complete(id: number) {
  await q("update jobs set done_at = now(), last_error = null where id = $1", [id]);
}

/** Retry with quadratic backoff; give up after 5 attempts. */
export async function fail(job: Job, err: unknown) {
  const msg = (err instanceof Error ? err.message : String(err)).slice(0, 500);
  if (job.attempts >= 5) {
    await q("update jobs set done_at = now(), last_error = $2 where id = $1", [job.id, msg]);
    return;
  }
  await q(
    "update jobs set locked_at = null, last_error = $2, run_at = now() + make_interval(secs => $3) where id = $1",
    [job.id, msg, job.attempts * job.attempts * 10],
  );
}

/** Recover jobs whose worker died mid-flight, and prune old finished rows. */
export async function maintain() {
  await q("update jobs set locked_at = null where done_at is null and locked_at < now() - interval '2 minutes'");
  await q("delete from jobs where done_at < now() - interval '3 days'");
}

export async function depth(): Promise<number> {
  const r = await q<{ n: number }>(
    "select count(*)::int as n from jobs where done_at is null and run_at <= now()",
  );
  return r[0]?.n ?? 0;
}
