import { getSql } from "@/lib/db";

export type Role = "owner" | "admin" | "analyst";
const RANK: Record<Role, number> = { analyst: 1, admin: 2, owner: 3 };

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

export async function getRole(userId: string): Promise<Role | null> {
  const sql = await getSql();
  const rows = await sql<{ role: Role }>`select role from admin_members where user_id = ${userId}`;
  if (rows[0]) return rows[0].role;

  // Bootstrap: while nobody is an admin, the verified account whose email matches
  // OWNER_EMAIL becomes owner. Requires emailVerified so nobody can claim the
  // owner seat by signing up with your address first.
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail) return null;
  const existing = await sql<{ n: number }>`select count(*)::int as n from admin_members`;
  if ((existing[0]?.n ?? 0) > 0) return null;
  const me = await sql<{ email: string; emailVerified: boolean }>`
    select email, "emailVerified" from "user" where id = ${userId}`;
  if (me[0]?.emailVerified && me[0].email.toLowerCase() === ownerEmail) {
    await sql`insert into admin_members (user_id, role) values (${userId}, 'owner') on conflict do nothing`;
    return "owner";
  }
  return null;
}

export async function requireRole(userId: string, min: Role): Promise<Role> {
  const role = await getRole(userId);
  if (!role || RANK[role] < RANK[min]) throw new ForbiddenError();
  return role;
}

export async function audit(actorId: string, action: string, target: string | null, before: unknown, after: unknown) {
  const sql = await getSql();
  await sql`insert into audit_log (actor_id, action, target, before, after)
            values (${actorId}, ${action}, ${target}, ${JSON.stringify(before ?? null)}::jsonb, ${JSON.stringify(after ?? null)}::jsonb)`;
}
