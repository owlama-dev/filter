import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { adminOverview, setEngine } from "@/lib/admin/api";
import { usePolling } from "@/lib/admin/use-polling";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/")({ component: DashboardPage });

const STATUS_LABEL: Record<string, string> = {
  queued: "Queued",
  enriching: "Enriching",
  scored: "Scored",
  passed: "Passed",
  rejected: "Rejected",
  error: "Errored",
};

function DashboardPage() {
  const { data, error, refresh } = usePolling(() => adminOverview(), 4000);
  const [saving, setSaving] = useState(false);
  const engine = data?.engine as { paused: boolean; safe_mode: boolean; max_inflight: number } | undefined;
  const [draft, setDraft] = useState<{ paused: boolean; safe_mode: boolean; max_inflight: number } | null>(null);
  const live = draft ?? engine ?? { paused: false, safe_mode: false, max_inflight: 8 };

  async function save(next: typeof live) {
    setDraft(next);
    setSaving(true);
    try {
      await setEngine({ data: next });
      toast.success(next.paused ? "Engine paused" : "Engine settings saved");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
      setDraft(null);
    }
  }

  const byStatus = new Map((data?.byStatus as { status: string; n: number }[] | undefined)?.map((r) => [r.status, r.n]));
  const sources = (data?.sources as { enabled: boolean; error_count: number }[] | undefined) ?? [];
  const providers = (data?.providers as
    | { provider: string; ok: boolean; p50_ms: number | null; error_rate: number | null; last_error: string | null }[]
    | undefined) ?? [];

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">Engine</h2>
            <p className="text-sm text-muted">Kill switch and pace, live for every worker instance within ~3s.</p>
          </div>
          {live.paused && <Badge className="bg-red-500/15 text-red-400">Paused</Badge>}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3">
            <span className="text-sm">Pause ingestion &amp; scoring</span>
            <Switch checked={live.paused} disabled={saving} onCheckedChange={(v) => save({ ...live, paused: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3">
            <span className="text-sm">Safe mode (score, no alerts)</span>
            <Switch checked={live.safe_mode} disabled={saving} onCheckedChange={(v) => save({ ...live, safe_mode: v })} />
          </label>
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="flex items-center justify-between text-sm">
              <span>Max concurrent evaluations</span>
              <span className="tabular-nums text-muted">{live.max_inflight}</span>
            </div>
            <Slider
              className="mt-2"
              min={1}
              max={32}
              step={1}
              value={[live.max_inflight]}
              disabled={saving}
              onValueChange={([v]) => setDraft({ ...live, max_inflight: v })}
              onValueCommit={([v]) => save({ ...live, max_inflight: v })}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <div key={key} className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="text-xs text-muted uppercase tracking-wide">{label} (24h)</p>
            <p className="mt-1 text-2xl font-medium tabular-nums">{byStatus.get(key) ?? 0}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-medium">Queue</h2>
          <div className="mt-3 flex gap-6 text-sm">
            <div>
              <p className="text-muted">Ready</p>
              <p className="text-xl tabular-nums">{data?.queue?.ready ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted">Failed (given up)</p>
              <p className="text-xl tabular-nums">{data?.queue?.failed ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted">Sources enabled</p>
              <p className="text-xl tabular-nums">
                {sources.filter((s) => s.enabled).length}/{sources.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-medium">Provider health</h2>
          <div className="mt-3 space-y-2">
            {providers.length === 0 && <p className="text-sm text-muted">No provider calls recorded yet.</p>}
            {providers.map((p) => (
              <div key={p.provider} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                <span className="font-mono">{p.provider}</span>
                <div className="flex items-center gap-3 text-xs text-muted">
                  {p.p50_ms != null && <span>{p.p50_ms}ms p50</span>}
                  {p.error_rate != null && <span>{(p.error_rate * 100).toFixed(0)}% err</span>}
                  <Badge className={p.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}>
                    {p.ok ? "ok" : "degraded"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
