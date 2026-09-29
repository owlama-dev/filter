import pg from "pg";
import { env } from "./env";

pg.types.setTypeParser(20, (v) => Number(v)); // int8 -> number
pg.types.setTypeParser(1700, (v) => Number(v)); // numeric -> number

export const pool = new pg.Pool({ connectionString: env.DATABASE_URL, max: 10 });

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export async function notify(channel: string, payload: unknown) {
  await pool.query("select pg_notify($1, $2)", [channel, JSON.stringify(payload)]);
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
