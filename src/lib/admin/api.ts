import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { scoreToken } from "@/lib/alpha/scoring";
import type { KillRules, OnchainFacts, MarketMetrics, Weights } from "@/lib/alpha/types";

/**
 * Admin control plane. Every function: authenticated -> role-checked on the
 * server -> validated -> (for writes) audited. The browser never decides anything.
 */
// JSON-safe row shape so results can cross the server-function boundary.
// biome-ignore lint/suspicious/noExplicitAny: DB rows are serialised as JSON
type Row = Record<string, any>;

const guard = () => import("./guard.server");

const weightsSchema = z.object({
  deployer: z.number().int().min(0).max(40),
  freshWallets: z.number().int().min(0).max(40),
  concentration: z.number().int().min(0).max(40),
  bundles: z.number().int().min(0).max(40),
  lpLock: z.number().int().min(0).max(40),
  authorities: z.number().int().min(0).max(40),
  liquidity: z.number().int().min(0).max(40),
  organic: z.number().int().min(0).max(40),
});

const killRulesSchema = z.object({
  requireAuthoritiesRevoked: z.boolean(),
  minLiquidityUsd: z.number().min(0).max(20000),
  maxTopHolderPct: z.number().min(5).max(90),
  maxDeployerPriorRugs: z.number().int().min(0).max(10),
  maxSameSlotBundlePct: z.number().min(10).max(100),
});

export const whoami = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getRole } = await guard();
    return { userId: context.userId, role: await getRole(context.userId) };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { requireRole } = await guard();
    await requireRole(context.userId, "analyst");
    const sql = await getSql();
    const [byStatus, queue, providers, engine, sources] = await Promise.all([
      sql<Row>`select status, count(*)::int as n from evaluations where created_at > now() - interval '24 hours' group by status`,
      sql<Row>`select count(*) filter (where done_at is null and run_at <= now())::int as ready,
                 count(*) filter (where done_at is not null and last_error is not null)::int as failed
            from jobs`,
      sql<Row>`select provider, ok, p50_ms, error_rate, last_error, circuit_open_until, updated_at from provider_health order by provider`,
      sql<Row>`select value from system_settings where key = 'engine'`,
      sql<Row>`select id, kind, handle, title, enabled, weight, reputation_sample, avg_multiple_60m,
                 reputation_updated_at, last_seen_at, error_count, last_error from sources order by title`,
    ]);
    return { byStatus, queue: queue[0], providers, engine: engine[0]?.value, sources };
  });

export const saveSource = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().min(1).max(60).optional(),
      kind: z.enum(["telegram_channel", "telegram_bot", "onchain_feed", "manual"]),
      handle: z.string().min(1).max(120),
      title: z.string().min(1).max(80),
      weight: z.number().min(0).max(3).default(1),
      enabled: z.boolean().default(true),
    }),
  )
  .handler(async ({ context, data }) => {
    const { requireRole, audit } = await guard();
    await requireRole(context.userId, "admin");
    const sql = await getSql();
    const handle = data.handle.trim().replace(/^https?:\/\/t\.me\//, "").replace(/^@/, "").toLowerCase();
    const id = data.id ?? `${data.kind}:${handle}`;
    const before = await sql<Row>`select * from sources where id = ${id}`;
    await sql`insert into sources (id, kind, handle, title, weight, enabled)
              values (${id}, ${data.kind}, ${handle}, ${data.title}, ${data.weight}, ${data.enabled})
              on conflict (id) do update set title = excluded.title, weight = excluded.weight,
                enabled = excluded.enabled, handle = excluded.handle`;
    await audit(context.userId, before.length ? "source.update" : "source.create", id, before[0], data);
    return { id };
  });

export const deleteSource = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const { requireRole, audit } = await guard();
    await requireRole(context.userId, "admin");
    const sql = await getSql();
    const before = await sql<Row>`select * from sources where id = ${data.id}`;
    await sql`delete from sources where id = ${data.id}`;
    await audit(context.userId, "source.delete", data.id, before[0], null);
    return { ok: true };
  });

export const getScoringState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { requireRole } = await guard();
    await requireRole(context.userId, "analyst");
    const sql = await getSql();
    return {
      versions: await sql<Row>`select version, weights, threshold, kill_rules, is_active, note, created_at
                            from scoring_configs order by version desc limit 25`,
    };
  });

export const publishConfig = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      weights: weightsSchema,
      threshold: z.number().int().min(40).max(95),
      killRules: killRulesSchema,
      note: z.string().max(200).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { requireRole, audit } = await guard();
    await requireRole(context.userId, "admin");
    const sql = await getSql();
    const before = await sql<Row>`select version, weights, threshold, kill_rules from scoring_configs where is_active`;
    const rows = await sql<{ v: number }>`
      select publish_scoring_config(${JSON.stringify(data.weights)}::jsonb, ${data.threshold},
                                    ${JSON.stringify(data.killRules)}::jsonb,
                                    ${data.note ?? null}, ${context.userId}) as v`;
    await audit(context.userId, "config.publish", String(rows[0]?.v), before[0], data);
    return { version: rows[0]?.v };
  });

/**
 * "What-if": re-scores recent stored evaluations (their raw market/onchain
 * snapshots — no refetching) under a candidate config, and reports how the
 * pass rate and average 60m outcome would have compared to the currently
 * active config on the same tokens. Read-only, no role write, so analysts can
 * explore freely before an admin publishes.
 */
export const runBacktest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      weights: weightsSchema,
      threshold: z.number().int().min(40).max(95),
      killRules: killRulesSchema,
      sampleSize: z.number().int().min(50).max(2000).default(500),
    }),
  )
  .handler(async ({ context, data }) => {
    const { requireRole } = await guard();
    await requireRole(context.userId, "analyst");
    const sql = await getSql();
    const rows = await sql<Row>`
      select e.token_address, e.market, e.onchain, e.passed as was_passed, e.score as was_score,
             o.multiple as multiple_60m
        from evaluations e
        left join outcomes o on o.token_address = e.token_address and o.horizon_min = 60
       where e.status in ('passed', 'rejected') and e.market is not null
       order by e.created_at desc
       limit ${data.sampleSize}`;

    let candidatePassed = 0;
    let bothPassed = 0;
    let onlyCandidatePassed = 0;
    let onlyOriginalPassed = 0;
    let candidateSumMultiple = 0;
    let candidateMultipleN = 0;
    let originalSumMultiple = 0;
    let originalMultipleN = 0;

    for (const row of rows) {
      const market = row.market as MarketMetrics;
      const onchain = row.onchain as OnchainFacts;
      const analysis = scoreToken(
        { market, onchain, status: "scored" },
        data.weights as Weights,
        data.threshold,
        data.killRules as KillRules,
      );
      const multiple = row.multiple_60m == null ? null : Number(row.multiple_60m);
      if (analysis.passed) {
        candidatePassed += 1;
        if (multiple != null) {
          candidateSumMultiple += multiple;
          candidateMultipleN += 1;
        }
      }
      if (row.was_passed && multiple != null) {
        originalSumMultiple += multiple;
        originalMultipleN += 1;
      }
      if (analysis.passed && row.was_passed) bothPassed += 1;
      else if (analysis.passed && !row.was_passed) onlyCandidatePassed += 1;
      else if (!analysis.passed && row.was_passed) onlyOriginalPassed += 1;
    }

    return {
      sampled: rows.length,
      originalPassed: rows.filter((r) => r.was_passed).length,
      candidatePassed,
      bothPassed,
      onlyCandidatePassed,
      onlyOriginalPassed,
      candidateAvgMultiple60m: candidateMultipleN ? candidateSumMultiple / candidateMultipleN : null,
      originalAvgMultiple60m: originalMultipleN ? originalSumMultiple / originalMultipleN : null,
    };
  });

export const rollbackConfig = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ version: z.number().int().positive() }))
  .handler(async ({ context, data }) => {
    const { requireRole, audit } = await guard();
    await requireRole(context.userId, "admin");
    const sql = await getSql();
    const before = await sql<Row>`select version from scoring_configs where is_active`;
    await sql<Row>`select activate_scoring_config(${data.version})`;
    await audit(context.userId, "config.rollback", String(data.version), before[0], { version: data.version });
    return { version: data.version };
  });

export const setEngine = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      paused: z.boolean(),
      safe_mode: z.boolean(),
      max_inflight: z.number().int().min(1).max(32),
    }),
  )
  .handler(async ({ context, data }) => {
    const { requireRole, audit } = await guard();
    await requireRole(context.userId, "admin");
    const sql = await getSql();
    const before = await sql<Row>`select value from system_settings where key = 'engine'`;
    await sql`insert into system_settings (key, value, updated_by) values ('engine', ${JSON.stringify(data)}::jsonb, ${context.userId})
              on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`;
    await audit(context.userId, data.paused ? "engine.pause" : "engine.update", "engine", before[0]?.value, data);
    return { ok: true };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { requireRole } = await guard();
    await requireRole(context.userId, "admin");
    const sql = await getSql();
    return sql<Row>`select m.user_id, m.role, m.created_at, u.email, u.name
                 from admin_members m join "user" u on u.id = m.user_id order by m.created_at`;
  });

/** Owner-only. The person must have signed up once so their account exists. */
export const setMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ email: z.string().email(), role: z.enum(["owner", "admin", "analyst"]) }))
  .handler(async ({ context, data }) => {
    const { requireRole, audit } = await guard();
    await requireRole(context.userId, "owner");
    const sql = await getSql();
    const users = await sql<{ id: string }>`select id from "user" where lower(email) = ${data.email.toLowerCase()}`;
    const target = users[0];
    if (!target) throw new Error("No account with that email. Ask them to sign up first.");
    await sql`insert into admin_members (user_id, role, created_by) values (${target.id}, ${data.role}, ${context.userId})
              on conflict (user_id) do update set role = excluded.role`;
    await audit(context.userId, "member.set", target.id, null, data);
    return { ok: true };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const { requireRole, audit } = await guard();
    await requireRole(context.userId, "owner");
    if (data.userId === context.userId) throw new Error("You cannot remove yourself.");
    const sql = await getSql();
    await sql`delete from admin_members where user_id = ${data.userId}`;
    await audit(context.userId, "member.remove", data.userId, null, null);
    return { ok: true };
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { requireRole } = await guard();
    await requireRole(context.userId, "admin");
    const sql = await getSql();
    return sql<Row>`select a.id, a.action, a.target, a.before, a.after, a.at, u.email as actor
                 from audit_log a left join "user" u on u.id = a.actor_id order by a.at desc limit 100`;
  });
