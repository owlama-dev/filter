import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { useAlpha, useFeedStats } from "@/lib/alpha/store";
import { formatUsd } from "@/lib/alpha/format";

export const Route = createFileRoute("/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const tokens = useAlpha((s) => s.tokens);
  const channels = useAlpha((s) => s.channels);
  const stats = useFeedStats();
  const threshold = useAlpha((s) => s.threshold);

  const byChannel = channels.map((ch) => {
    const rows = tokens.filter((t) => t.sourceChannelId === ch.id);
    return {
      label: ch.title,
      passed: rows.filter((t) => t.status === "passed").length,
      rejected: rows.filter((t) => t.status === "rejected").length,
    };
  });

  const edges = [0, 20, 40, 60, 80, 100];
  const hist = edges.slice(0, -1).map((start, i) => {
    const end = edges[i + 1] ?? 100;
    const last = i === edges.length - 2;
    const count = tokens.filter((t) => {
      const s = t.analysis?.total;
      if (s == null) return false;
      return s >= start && (last ? s <= end : s < end);
    }).length;
    return { name: `${start}–${end}`, count };
  });

  const withLp = tokens.filter((t) => t.market?.liquidityUsd);
  const avgLp = withLp.reduce((s, t) => s + (t.market?.liquidityUsd ?? 0), 0) / Math.max(1, withLp.length);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-wide text-muted uppercase">Desk stats</p>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Analytics</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">How the filter is behaving on this session. Threshold is {threshold}.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Extracted" value={String(stats.extracted)} />
        <Stat label="Passed" value={String(stats.passed)} />
        <Stat label="Rejected" value={String(stats.rejected)} />
        <Stat label="Pass rate" value={stats.extracted ? `${Math.round((stats.passed / stats.extracted) * 100)}%` : "—"} />
        <Stat label="In flight" value={String(stats.inFlight)} />
        <Stat label="Avg LP on tape" value={formatUsd(avgLp)} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <h2 className="mb-4 text-sm font-medium">Passed vs rejected by desk</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byChannel}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted)" fontSize={11} />
                <YAxis allowDecimals={false} stroke="var(--color-muted)" fontSize={11} />
                <RTooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                    color: "var(--color-fg)",
                  }}
                />
                <Bar dataKey="passed" fill="var(--color-pass)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="var(--color-fail)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <h2 className="mb-4 text-sm font-medium">Score distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hist}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={11} />
                <YAxis allowDecimals={false} stroke="var(--color-muted)" fontSize={11} />
                <RTooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                    color: "var(--color-fg)",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <div className="text-xs tracking-wide text-subtle uppercase">{label}</div>
      <div className="mt-1 font-mono text-lg tabular">{value}</div>
    </div>
  );
}
