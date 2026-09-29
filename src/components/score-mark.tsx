import { formatScore } from "@/lib/alpha/format";
import { cn } from "@/lib/utils";

export function ScoreMark({
  value,
  passed,
  size = 56,
}: {
  value: number | null | undefined;
  passed?: boolean;
  size?: number;
}) {
  const stroke = 3.5;
  const r = 16 - stroke;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const color = passed ? "var(--color-pass)" : value == null ? "var(--color-muted)" : pct >= 72 ? "var(--color-warn)" : "var(--color-fail)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" className="size-full -rotate-90">
        <circle cx="16" cy="16" r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("absolute font-mono text-sm tabular", passed ? "text-pass" : "text-fg")}>
        {formatScore(value)}
      </span>
    </div>
  );
}
