import { r as getSql } from "./db-CawrWp_T.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guard.server-D69DIv8I.js
var RANK = {
	analyst: 1,
	admin: 2,
	owner: 3
};
var ForbiddenError = class extends Error {
	status = 403;
	constructor() {
		super("Forbidden");
		this.name = "ForbiddenError";
	}
};
async function getRole(userId) {
	const sql = await getSql();
	const rows = await sql`select role from admin_members where user_id = ${userId}`;
	if (rows[0]) return rows[0].role;
	const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
	if (!ownerEmail) return null;
	if (((await sql`select count(*)::int as n from admin_members`)[0]?.n ?? 0) > 0) return null;
	const me = await sql`
    select email, "emailVerified" from "user" where id = ${userId}`;
	if (me[0]?.emailVerified && me[0].email.toLowerCase() === ownerEmail) {
		await sql`insert into admin_members (user_id, role) values (${userId}, 'owner') on conflict do nothing`;
		return "owner";
	}
	return null;
}
async function requireRole(userId, min) {
	const role = await getRole(userId);
	if (!role || RANK[role] < RANK[min]) throw new ForbiddenError();
	return role;
}
async function audit(actorId, action, target, before, after) {
	await (await getSql())`insert into audit_log (actor_id, action, target, before, after)
            values (${actorId}, ${action}, ${target}, ${JSON.stringify(before ?? null)}::jsonb, ${JSON.stringify(after ?? null)}::jsonb)`;
}
//#endregion
export { ForbiddenError, audit, getRole, requireRole };
