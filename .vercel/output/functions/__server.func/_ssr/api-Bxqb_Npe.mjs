import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CaDBtn9g.mjs";
import { cn as _enum, dn as boolean, gn as object, hn as number, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { s as createSsrRpc } from "./router-CG39ymgt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-Bxqb_Npe.js
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
var whoami = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("67d2eb5cab7ccac528688007a68458a16b6b10b96efc992882be95890e9041b3"));
var adminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("382ddb98bd4bd09800536b23de97dd37611b548d850e81bdc20d8b68e22bddd2"));
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
})).handler(createSsrRpc("38cb34e66149d66f14df7b9b9646a08cc3ea7977607158814452c4ee8416e41e"));
var deleteSource = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string().min(1) })).handler(createSsrRpc("5af921869e8567ca51dea488457b1550c6a7a7628e332da6d9f760fc09663540"));
var getScoringState = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d688bab8ccb43c0680e11f979f0f19161eae823b02abbef36f717b7e7e883833"));
var publishConfig = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	weights: weightsSchema,
	threshold: number().int().min(40).max(95),
	killRules: killRulesSchema,
	note: string().max(200).optional()
})).handler(createSsrRpc("44e70c13de07ac561ea067f6cd729ecac9ab7b23d0c1872dbf14c358120dd407"));
/**
* "What-if": re-scores recent stored evaluations (their raw market/onchain
* snapshots — no refetching) under a candidate config, and reports how the
* pass rate and average 60m outcome would have compared to the currently
* active config on the same tokens. Read-only, no role write, so analysts can
* explore freely before an admin publishes.
*/
var runBacktest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	weights: weightsSchema,
	threshold: number().int().min(40).max(95),
	killRules: killRulesSchema,
	sampleSize: number().int().min(50).max(2e3).default(500)
})).handler(createSsrRpc("f957bf6d76f46788d48d9dc2c51eb68d243d498e901ec500b61edfce4f11dc18"));
var rollbackConfig = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ version: number().int().positive() })).handler(createSsrRpc("0d5fc25b64fb22103a8f3a53ff50ebf7ed33577c828242246c5fd7f5a5601e3c"));
var setEngine = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	paused: boolean(),
	safe_mode: boolean(),
	max_inflight: number().int().min(1).max(32)
})).handler(createSsrRpc("4fc72da5afa0de7b34cd6a23f5cd2e89fcf5df9a727a00280b94ad83d87f058c"));
var listMembers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("de2e94d5111c0d6d7576cc2fb1a00b0ef865aee7245d60a98a3199b2e23ba259"));
/** Owner-only. The person must have signed up once so their account exists. */
var setMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	email: string().email(),
	role: _enum([
		"owner",
		"admin",
		"analyst"
	])
})).handler(createSsrRpc("0fd3d930f8cd2e41e06766693a417ed839267a374f5a735818d934cbee2931ef"));
var removeMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ userId: string().min(1) })).handler(createSsrRpc("9e6277543db7743cc032dab92795e3eda7b52d589fae592f5d981fc559cfaa18"));
var listAudit = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("bd0f82b988405fc8b7fb531fe34af335227873524854f31495e5f8cb2a8e32bc"));
//#endregion
export { listMembers as a, rollbackConfig as c, setEngine as d, setMember as f, listAudit as i, runBacktest as l, deleteSource as n, publishConfig as o, whoami as p, getScoringState as r, removeMember as s, adminOverview as t, saveSource as u };
