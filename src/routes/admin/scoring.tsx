import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getScoringState, publishConfig, rollbackConfig, runBacktest } from "@/lib/admin/api";
import { usePolling } from "@/lib/admin/use-polling";
import { KILL_RULE_META, WEIGHT_META } from "@/lib/alpha/defaults";
import type { KillRules, Weights } from "@/lib/alpha/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/scoring")({ component: ScoringPage });

interface ConfigVersion {
  version: number;
  weights: Weights;
  threshold: number;
  kill_rules: KillRules;
  is_active: boolean;
  note: string | null;
  created_at: string;
}

interface Backtest {
  sampled: number;
  originalPassed: number;
  candidatePassed: number;
  bothPassed: number;
  onlyCandidatePassed: number;
  onlyOriginalPassed: number;
  candidateAvgMultiple60m: number | null;
  originalAvgMultiple60m: number | null;
}

const WEIGHT_KEYS = Object.keys(WEIGHT_META) as (keyof Weights)[];
const KILL_KEYS = Object.keys(KILL_RULE_META) as (keyof KillRules)[];

function ScoringPage() {
  const { data, refresh } = usePolling(() => getScoringState(), 15000);
  const versions = (data?.versions as ConfigVersion[] | undefined) ?? [];
  const active = versions.find((v) => v.is_active) ?? versions[0];

  const [weights, setWeights] = useState<Weights | null>(null);
  const [threshold, setThreshold] = useState<number | null>(null);
  const [killRules, setKillRules] = useState<KillRules | null>(null);
  const [note, setNote] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [backtest, setBacktest] = useState<Backtest | null>(null);
  const [backtesting, setBacktesting] = useState(false);

  useEffect(() => {
    if (active && !weights) {
      setWeights(active.weights);
      setThreshold(active.threshold);
      setKillRules(active.kill_rules);
    }
  }, [active, weights]);

  if (!weights || threshold == null || !killRules) {
    return <p className="text-sm text-muted">Loading scoring configuration…</p>;
  }

  const total = WEIGHT_KEYS.reduce((sum, k) => sum + weights[k], 0);

  async function runWhatIf() {
    setBacktesting(true);
    setBacktest(null);
    try {
      const result = await runBacktest({ data: { weights: weights!, threshold: threshold!, killRules: killRules!, sampleSize: 500 } });
      setBacktest(result as Backtest);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Backtest failed");
    } finally {
      setBacktesting(false);
    }
  }

  async function publish() {
    setPublishing(true);
    try {
      const res = await publishConfig({ data: { weights: weights!, threshold: threshold!, killRules: killRules!, note: note || undefined } });
      toast.success(`Published as version ${res.version}`);
      setNote("");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  async function rollback(version: number) {
    if (!confirm(`Roll back to version ${version}? This makes it the active config immediately.`)) return;
    try {
      await rollbackConfig({ data: { version } });
      toast.success(`Rolled back to version ${version}`);
      setWeights(null); // reload from the newly-active version
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Rollback failed");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Weights</h2>
            <span className={`text-sm tabular-nums ${total > 100 ? "text-red-400" : "text-muted"}`}>{total}/100</span>
          </div>
          <div className="mt-4 space-y-4">
            {WEIGHT_KEYS.map((key) => (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span>{WEIGHT_META[key].label}</span>
                  <span className="tabular-nums text-muted">{weights[key]}</span>
                </div>
                <p className="text-xs text-muted">{WEIGHT_META[key].blurb}</p>
                <Slider
                  className="mt-2"
                  min={0}
                  max={40}
                  step={1}
                  value={[weights[key]]}
                  onValueChange={([v]) => setWeights((w) => (w ? { ...w, [key]: v } : w))}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-medium">Pass threshold</h2>
          <p className="text-xs text-muted">Minimum total score (of 100) to mark a token "passed" and alert.</p>
          <div className="mt-3 flex items-center gap-4">
            <Slider className="flex-1" min={40} max={95} step={1} value={[threshold]} onValueChange={([v]) => setThreshold(v)} />
            <span className="w-10 text-right text-sm tabular-nums">{threshold}</span>
          </div>
        </section>

        <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-medium">Kill rules</h2>
          <p className="text-xs text-muted">Any one of these auto-rejects a token regardless of its score.</p>
          <div className="mt-4 space-y-4">
            {KILL_KEYS.map((key) => {
              const meta = KILL_RULE_META[key];
              if (meta.kind === "bool") {
                return (
                  <label key={key} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3">
                    <div>
                      <p className="text-sm">{meta.label}</p>
                      <p className="text-xs text-muted">{meta.blurb}</p>
                    </div>
                    <Switch
                      checked={Boolean(killRules[key])}
                      onCheckedChange={(v) => setKillRules((r) => (r ? { ...r, [key]: v } : r))}
                    />
                  </label>
                );
              }
              const value = Number(killRules[key]);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{meta.label}</span>
                    <span className="tabular-nums text-muted">{value}</span>
                  </div>
                  <p className="text-xs text-muted">{meta.blurb}</p>
                  <Slider
                    className="mt-2"
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={[value]}
                    onValueChange={([v]) => setKillRules((r) => (r ? { ...r, [key]: v } : r))}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">What-if backtest</h2>
            <Button variant="outline" size="sm" onClick={runWhatIf} disabled={backtesting}>
              {backtesting ? "Running…" : "Run against last 500 evaluations"}
            </Button>
          </div>
          {backtest && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Stat label="Sampled" value={backtest.sampled} />
              <Stat label="Currently passed" value={backtest.originalPassed} />
              <Stat label="Would pass" value={backtest.candidatePassed} highlight />
              <Stat label="Newly passing" value={backtest.onlyCandidatePassed} />
              <Stat label="Newly rejected" value={backtest.onlyOriginalPassed} />
              <Stat
                label="Avg 60m mult. (would-pass)"
                value={backtest.candidateAvgMultiple60m != null ? `${backtest.candidateAvgMultiple60m.toFixed(2)}×` : "—"}
                highlight
              />
              <Stat
                label="Avg 60m mult. (current)"
                value={backtest.originalAvgMultiple60m != null ? `${backtest.originalAvgMultiple60m.toFixed(2)}×` : "—"}
              />
            </div>
          )}
          {!backtest && <p className="mt-2 text-sm text-muted">Re-scores stored snapshots — no live refetching, no risk.</p>}
        </section>

        <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <Label>Publish note (optional)</Label>
          <Input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this change" />
          <Button className="mt-3" onClick={publish} disabled={publishing || total > 100}>
            {publishing ? "Publishing…" : "Publish new version"}
          </Button>
          {total > 100 && <p className="mt-2 text-xs text-red-400">Weights sum to more than 100 — reduce before publishing.</p>}
        </section>
      </div>

      <aside className="space-y-3">
        <h2 className="font-medium">Version history</h2>
        {versions.map((v) => (
          <div key={v.version} className="rounded-xl bg-surface p-3 text-sm shadow-[var(--shadow-border)]">
            <div className="flex items-center justify-between">
              <span className="font-medium">v{v.version}</span>
              {v.is_active ? (
                <Badge className="bg-emerald-500/15 text-emerald-400">active</Badge>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => rollback(v.version)}>
                  Roll back
                </Button>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">threshold {v.threshold} · {new Date(v.created_at).toLocaleString()}</p>
            {v.note && <p className="mt-1 text-xs text-muted">{v.note}</p>}
          </div>
        ))}
      </aside>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-lg tabular-nums ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

