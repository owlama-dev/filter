import { q } from "../db";

export async function fetchJson<T>(url: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: { accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`);
  return (await res.json()) as T;
}

/** Smooth rate limiter: spaces calls so we never exceed perSec. */
export class Limiter {
  private next = 0;
  constructor(private perSec: number) {}
  async take() {
    const now = Date.now();
    const slot = Math.max(now, this.next);
    this.next = slot + 1000 / this.perSec;
    if (slot > now) await new Promise((r) => setTimeout(r, slot - now));
  }
}

interface Stat {
  calls: number;
  errors: number;
  fails: number; // consecutive
  openUntil: number;
  lat: number[];
  lastError: string | null;
}
const stats = new Map<string, Stat>();
const stat = (name: string): Stat => {
  let s = stats.get(name);
  if (!s) stats.set(name, (s = { calls: 0, errors: 0, fails: 0, openUntil: 0, lat: [], lastError: null }));
  return s;
};

/** Rate limit + circuit breaker + health accounting for one provider. */
export async function callProvider<T>(name: string, limiter: Limiter, fn: () => Promise<T>): Promise<T> {
  const s = stat(name);
  if (Date.now() < s.openUntil) throw new Error(`${name} circuit open`);
  await limiter.take();
  const t0 = Date.now();
  try {
    const out = await fn();
    s.calls += 1;
    s.fails = 0;
    s.lat.push(Date.now() - t0);
    if (s.lat.length > 50) s.lat.shift();
    return out;
  } catch (err) {
    s.calls += 1;
    s.errors += 1;
    s.fails += 1;
    s.lastError = err instanceof Error ? err.message : String(err);
    if (s.fails >= 5) s.openUntil = Date.now() + Math.min(120_000, 15_000 * (s.fails - 4));
    throw err;
  }
}

export async function flushHealth() {
  for (const [provider, s] of stats) {
    const sorted = [...s.lat].sort((a, b) => a - b);
    const p50 = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
    await q(
      `insert into provider_health (provider, ok, p50_ms, error_rate, last_error, circuit_open_until, updated_at)
       values ($1, $2, $3, $4, $5, $6, now())
       on conflict (provider) do update set ok = excluded.ok, p50_ms = excluded.p50_ms,
         error_rate = excluded.error_rate, last_error = excluded.last_error,
         circuit_open_until = excluded.circuit_open_until, updated_at = now()`,
      [
        provider,
        Date.now() >= s.openUntil,
        p50,
        s.calls ? s.errors / s.calls : 0,
        s.lastError,
        s.openUntil > Date.now() ? new Date(s.openUntil) : null,
      ],
    );
  }
}
