import { Check, Circle } from "lucide-react";
import { formatPct } from "@/lib/alpha/format";
import type { Analysis, ScorePart } from "@/lib/alpha/types";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const sourceLabel = {
  onchain: "on-chain",
  market: "market",
  modeled: "modeled",
} as const;

function toneBar(tone: ScorePart["tone"]) {
  if (tone === "good") return "bg-pass";
  if (tone === "warn") return "bg-warn";
  if (tone === "bad") return "bg-fail";
  return "bg-muted";
}

export function AnalysisPanel({ analysis }: { analysis: Analysis | null }) {
  if (!analysis) {
    return (
      <p className="text-sm text-muted">Analysis has not started. The mint is still in the first stages of the pipe.</p>
    );
  }

  return (
    <div className="space-y-6">
      {analysis.killFlags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium tracking-wide text-fail uppercase">Kill flags</h3>
          {analysis.killFlags.map((flag) => (
            <div key={flag.code} className="rounded-xl bg-fail/10 p-3">
              <p className="text-sm font-medium text-fail">{flag.label}</p>
              <p className="mt-1 text-xs text-muted">{flag.detail}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">Pipeline checks</h3>
        <ul className="space-y-2">
          {analysis.checklist.map((item) => (
            <li key={item.id} className="flex gap-3 rounded-lg bg-surface p-3">
              <span className={cn("mt-0.5", item.done ? "text-pass" : "text-subtle")}>
                {item.done ? <Check className="size-4" /> : <Circle className="size-4" />}
              </span>
              <div>
                <p className="text-sm">{item.label}</p>
                {item.detail && <p className="text-xs text-muted">{item.detail}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">Score breakdown</h3>
        <div className="space-y-3">
          {analysis.parts.map((part) => (
            <div key={part.key} className="rounded-xl bg-surface p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="text-sm font-medium">{part.label}</p>
                  <Badge variant="outline">{sourceLabel[part.source]}</Badge>
                </div>
                <span className="font-mono text-xs tabular text-muted">
                  {part.points.toFixed(1)} / {part.weight.toFixed(0)}
                </span>
              </div>
              <Progress value={part.signal} barClassName={toneBar(part.tone)} />
              <p className="mt-2 text-xs leading-relaxed text-muted">{part.reason}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-subtle">
        Threshold {formatPct(analysis.threshold, 0).replace("%", "")} · total {Math.round(analysis.total)}. Kill flags override a high score.
      </p>
    </div>
  );
}
