export function shortMint(address: string, left = 4, right = 4) {
  if (address.length <= left + right + 1) return address;
  return `${address.slice(0, left)}…${address.slice(-right)}`;
}

export function formatUsd(value: number | null | undefined, compact = true) {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (!compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: abs < 1 ? 4 : 0,
    }).format(value);
  }
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  if (abs >= 1) return `$${value.toFixed(0)}`;
  if (abs >= 0.0001) return `$${value.toFixed(4)}`;
  return `$${value.toExponential(1)}`;
}

export function formatPct(value: number | null | undefined, digits = 0) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatScore(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return Math.round(value).toString().padStart(2, "0");
}

export function formatAge(min: number | null | undefined) {
  if (min == null || Number.isNaN(min)) return "—";
  if (min < 1) return `${Math.max(1, Math.round(min * 60))}s`;
  if (min < 60) return `${Math.round(min)}m`;
  if (min < 60 * 24) return `${(min / 60).toFixed(min < 600 ? 1 : 0)}h`;
  return `${(min / 60 / 24).toFixed(1)}d`;
}

export function formatClock(ts: number) {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function relativeTime(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 5) return "now";
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  return `${h}h`;
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}
