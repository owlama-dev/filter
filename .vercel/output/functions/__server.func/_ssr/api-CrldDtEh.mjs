import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CaDBtn9g.mjs";
import { cn as _enum, dn as boolean, gn as object, hn as number, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { g as scoreToken } from "./scoring-DilwZFet.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as getSql } from "./db-CawrWp_T.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CrldDtEh.js
var guard = () => import("./guard.server-D69DIv8I.mjs");
var weightsSchema = object({
	deployer: number().int().min(0).max(40),
	freshWallets: number().int().min(0).max(40),
	concentration: number().int().min(0).max(40),
	bundles: number().int().min(0).max(40),
	lpLock: number().int().min(0).max(40),
	authorities: number().int().min(0).max(40),
	liquidity: number().int().min(0).max(40),
	organic: number().int().min(0).max(40)
});
var killRulesSchema = object({
	requireAuthoritiesRevoked: boolean(),
	minLiquidityUsd: number().min(0).max(2e4),
	maxTopHolderPct: number().min(5).max(90),
	maxDeployerPriorRugs: number().int().min(0).max(10),
	maxSameSlotBundlePct: number().min(10).max(100)
});
var whoami_createServerFn_handler = createServerRpc({
	id: "67d2eb5cab7ccac528688007a68458a16b6b10b96efc992882be95890e9041b3",
	name: "whoami",
	filename: "src/lib/admin/api.ts"
}, (opts) => whoami.__executeServer(opts));
var whoami = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(whoami_createServerFn_handler, async ({ context }) => {
	const { getRole } = await guard();
	return {
		userId: context.userId,
		role: await getRole(context.userId)
	};
});
var adminOverview_createServerFn_handler = createServerRpc({
	id: "382ddb98bd4bd09800536b23de97dd37611b548d850e81bdc20d8b68e22bddd2",
	name: "adminOverview",
	filename: "src/lib/admin/api.ts"
}, (opts) => adminOverview.__executeServer(opts));
var adminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminOverview_createServerFn_handler, async ({ context }) => {
	const { requireRole } = await guard();
	await requireRole(context.userId, "analyst");
	const sql = await getSql();
	const [byStatus, queue, providers, engine, sources] = await Promise.all([
		sql`select status, count(*)::int as n from evaluations where created_at > now() - interval '24 hours' group by status`,
		sql`select count(*) filter (where done_at is null and run_at <= now())::int as ready,
                 count(*) filter (where done_at is not null and last_error is not null)::int as failed
            from jobs`,
		sql`select provider, ok, p50_ms, error_rate, last_error, circuit_open_until, updated_at from provider_health order by provider`,
		sql`select value from system_settings where key = 'engine'`,
		sql`select s.id, s.kind, s.handle, s.title, s.enabled, s.weight, s.reputation_sample, s.avg_multiple_60m,
             s.reputation_updated_at, s.last_seen_at, s.error_count, s.last_error,
             (select count(*)::int from messages m where m.source_id = s.id) as ingested_calls
        from sources s order by s.title`
	]);
	return {
		byStatus,
		queue: queue[0],
		providers,
		engine: engine[0]?.value,
		sources
	};
});
var saveSource_createServerFn_handler = createServerRpc({
	id: "38cb34e66149d66f14df7b9b9646a08cc3ea7977607158814452c4ee8416e41e",
	name: "saveSource",
	filename: "src/lib/admin/api.ts"
}, (opts) => saveSource.__executeServer(opts));
var saveSource = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string().min(1).max(60).optional(),
	kind: _enum([
		"telegram_channel",
		"telegram_bot",
		"onchain_feed",
		"manual"
	]),
	handle: string().min(1).max(120),
	title: string().min(1).max(80),
	weight: number().min(0).max(3).default(1),
	enabled: boolean().default(true)
})).handler(saveSource_createServerFn_handler, async ({ context, data }) => {
	const { requireRole, audit } = await guard();
	await requireRole(context.userId, "admin");
	const sql = await getSql();
	const handle = data.handle.trim().replace(/^https?:\/\/t\.me\//, "").replace(/^@/, "").toLowerCase();
	const id = data.id ?? `${data.kind}:${handle}`;
	const before = await sql`select * from sources where id = ${id}`;
	await sql`insert into sources (id, kind, handle, title, weight, enabled)
              values (${id}, ${data.kind}, ${handle}, ${data.title}, ${data.weight}, ${data.enabled})
              on conflict (id) do update set title = excluded.title, weight = excluded.weight,
                enabled = excluded.enabled, handle = excluded.handle`;
	await audit(context.userId, before.length ? "source.update" : "source.create", id, before[0], data);
	return { id };
});
var deleteSource_createServerFn_handler = createServerRpc({
	id: "5af921869e8567ca51dea488457b1550c6a7a7628e332da6d9f760fc09663540",
	name: "deleteSource",
	filename: "src/lib/admin/api.ts"
}, (opts) => deleteSource.__executeServer(opts));
var deleteSource = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string().min(1) })).handler(deleteSource_createServerFn_handler, async ({ context, data }) => {
	const { requireRole, audit } = await guard();
	await requireRole(context.userId, "admin");
	const sql = await getSql();
	const before = await sql`select * from sources where id = ${data.id}`;
	await sql`delete from sources where id = ${data.id}`;
	await audit(context.userId, "source.delete", data.id, before[0], null);
	return { ok: true };
});
var getScoringState_createServerFn_handler = createServerRpc({
	id: "d688bab8ccb43c0680e11f979f0f19161eae823b02abbef36f717b7e7e883833",
	name: "getScoringState",
	filename: "src/lib/admin/api.ts"
}, (opts) => getScoringState.__executeServer(opts));
var getScoringState = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getScoringState_createServerFn_handler, async ({ context }) => {
	const { requireRole } = await guard();
	await requireRole(context.userId, "analyst");
	return { versions: await (await getSql())`select version, weights, threshold, kill_rules, is_active, note, created_at
                            from scoring_configs order by version desc limit 25` };
});
var publishConfig_createServerFn_handler = createServerRpc({
	id: "44e70c13de07ac561ea067f6cd729ecac9ab7b23d0c1872dbf14c358120dd407",
	name: "publishConfig",
	filename: "src/lib/admin/api.ts"
}, (opts) => publishConfig.__executeServer(opts));
var publishConfig = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	weights: weightsSchema,
	threshold: number().int().min(40).max(95),
	killRules: killRulesSchema,
	note: string().max(200).optional()
})).handler(publishConfig_createServerFn_handler, async ({ context, data }) => {
	const { requireRole, audit } = await guard();
	await requireRole(context.userId, "admin");
	const sql = await getSql();
	const before = await sql`select version, weights, threshold, kill_rules from scoring_configs where is_active`;
	const rows = await sql`
      select publish_scoring_config(${JSON.stringify(data.weights)}::jsonb, ${data.threshold},
                                    ${JSON.stringify(data.killRules)}::jsonb,
                                    ${data.note ?? null}, ${context.userId}) as v`;
	await audit(context.userId, "config.publish", String(rows[0]?.v), before[0], data);
	return { version: rows[0]?.v };
});
var runBacktest_createServerFn_handler = createServerRpc({
	id: "f957bf6d76f46788d48d9dc2c51eb68d243d498e901ec500b61edfce4f11dc18",
	name: "runBacktest",
	filename: "src/lib/admin/api.ts"
}, (opts) => runBacktest.__executeServer(opts));
var runBacktest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	weights: weightsSchema,
	threshold: number().int().min(40).max(95),
	killRules: killRulesSchema,
	sampleSize: number().int().min(50).max(2e3).default(500)
})).handler(runBacktest_createServerFn_handler, async ({ context, data }) => {
	const { requireRole } = await guard();
	await requireRole(context.userId, "analyst");
	const rows = await (await getSql())`
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
		const market = row.market;
		const onchain = row.onchain;
		const analysis = scoreToken({
			market,
			onchain,
			status: "scored"
		}, data.weights, data.threshold, data.killRules);
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
		originalAvgMultiple60m: originalMultipleN ? originalSumMultiple / originalMultipleN : null
	};
});
var rollbackConfig_createServerFn_handler = createServerRpc({
	id: "0d5fc25b64fb22103a8f3a53ff50ebf7ed33577c828242246c5fd7f5a5601e3c",
	name: "rollbackConfig",
	filename: "src/lib/admin/api.ts"
}, (opts) => rollbackConfig.__executeServer(opts));
var rollbackConfig = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ version: number().int().positive() })).handler(rollbackConfig_createServerFn_handler, async ({ context, data }) => {
	const { requireRole, audit } = await guard();
	await requireRole(context.userId, "admin");
	const sql = await getSql();
	const before = await sql`select version from scoring_configs where is_active`;
	await sql`select activate_scoring_config(${data.version})`;
	await audit(context.userId, "config.rollback", String(data.version), before[0], { version: data.version });
	return { version: data.version };
});
var setEngine_createServerFn_handler = createServerRpc({
	id: "4fc72da5afa0de7b34cd6a23f5cd2e89fcf5df9a727a00280b94ad83d87f058c",
	name: "setEngine",
	filename: "src/lib/admin/api.ts"
}, (opts) => setEngine.__executeServer(opts));
var setEngine = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	paused: boolean(),
	safe_mode: boolean(),
	max_inflight: number().int().min(1).max(32)
})).handler(setEngine_createServerFn_handler, async ({ context, data }) => {
	const { requireRole, audit } = await guard();
	await requireRole(context.userId, "admin");
	const sql = await getSql();
	const before = await sql`select value from system_settings where key = 'engine'`;
	await sql`insert into system_settings (key, value, updated_by) values ('engine', ${JSON.stringify(data)}::jsonb, ${context.userId})
              on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`;
	await audit(context.userId, data.paused ? "engine.pause" : "engine.update", "engine", before[0]?.value, data);
	return { ok: true };
});
var listMembers_createServerFn_handler = createServerRpc({
	id: "de2e94d5111c0d6d7576cc2fb1a00b0ef865aee7245d60a98a3199b2e23ba259",
	name: "listMembers",
	filename: "src/lib/admin/api.ts"
}, (opts) => listMembers.__executeServer(opts));
var listMembers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMembers_createServerFn_handler, async ({ context }) => {
	const { requireRole } = await guard();
	await requireRole(context.userId, "admin");
	return (await getSql())`select m.user_id, m.role, m.created_at, u.email, u.name
                 from admin_members m join "user" u on u.id = m.user_id order by m.created_at`;
});
var setMember_createServerFn_handler = createServerRpc({
	id: "0fd3d930f8cd2e41e06766693a417ed839267a374f5a735818d934cbee2931ef",
	name: "setMember",
	filename: "src/lib/admin/api.ts"
}, (opts) => setMember.__executeServer(opts));
var setMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	email: string().email(),
	role: _enum([
		"owner",
		"admin",
		"analyst"
	])
})).handler(setMember_createServerFn_handler, async ({ context, data }) => {
	const { requireRole, audit } = await guard();
	await requireRole(context.userId, "owner");
	const sql = await getSql();
	const target = (await sql`select id from "user" where lower(email) = ${data.email.toLowerCase()}`)[0];
	if (!target) throw new Error("No account with that email. Ask them to sign up first.");
	await sql`insert into admin_members (user_id, role, created_by) values (${target.id}, ${data.role}, ${context.userId})
              on conflict (user_id) do update set role = excluded.role`;
	await audit(context.userId, "member.set", target.id, null, data);
	return { ok: true };
});
var removeMember_createServerFn_handler = createServerRpc({
	id: "9e6277543db7743cc032dab92795e3eda7b52d589fae592f5d981fc559cfaa18",
	name: "removeMember",
	filename: "src/lib/admin/api.ts"
}, (opts) => removeMember.__executeServer(opts));
var removeMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ userId: string().min(1) })).handler(removeMember_createServerFn_handler, async ({ context, data }) => {
	const { requireRole, audit } = await guard();
	await requireRole(context.userId, "owner");
	if (data.userId === context.userId) throw new Error("You cannot remove yourself.");
	await (await getSql())`delete from admin_members where user_id = ${data.userId}`;
	await audit(context.userId, "member.remove", data.userId, null, null);
	return { ok: true };
});
var listAudit_createServerFn_handler = createServerRpc({
	id: "bd0f82b988405fc8b7fb531fe34af335227873524854f31495e5f8cb2a8e32bc",
	name: "listAudit",
	filename: "src/lib/admin/api.ts"
}, (opts) => listAudit.__executeServer(opts));
var listAudit = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAudit_createServerFn_handler, async ({ context }) => {
	const { requireRole } = await guard();
	await requireRole(context.userId, "admin");
	return (await getSql())`select a.id, a.action, a.target, a.before, a.after, a.at, u.email as actor
                 from audit_log a left join "user" u on u.id = a.actor_id order by a.at desc limit 100`;
});
//#endregion
export { adminOverview_createServerFn_handler, deleteSource_createServerFn_handler, getScoringState_createServerFn_handler, listAudit_createServerFn_handler, listMembers_createServerFn_handler, publishConfig_createServerFn_handler, removeMember_createServerFn_handler, rollbackConfig_createServerFn_handler, runBacktest_createServerFn_handler, saveSource_createServerFn_handler, setEngine_createServerFn_handler, setMember_createServerFn_handler, whoami_createServerFn_handler };
