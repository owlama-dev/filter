import { q } from "./db";

export interface EngineSettings {
  paused: boolean;
  safe_mode: boolean; // evaluate and store, but send no alerts
  max_inflight: number;
}

let cache: { at: number; value: EngineSettings } | null = null;

/** Admin changes take effect within ~3s without hammering the DB. */
export async function getEngine(): Promise<EngineSettings> {
  if (cache && Date.now() - cache.at < 3000) return cache.value;
  const rows = await q<{ value: Partial<EngineSettings> }>(
    "select value from system_settings where key = 'engine'",
  );
  const v = rows[0]?.value ?? {};
  const value: EngineSettings = {
    paused: v.paused ?? false,
    safe_mode: v.safe_mode ?? false,
    max_inflight: Math.min(32, Math.max(1, v.max_inflight ?? 8)),
  };
  cache = { at: Date.now(), value };
  return value;
}
