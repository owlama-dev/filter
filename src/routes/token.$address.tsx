import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { AnalysisPanel } from "@/components/analysis-panel";
import { ScoreMark } from "@/components/score-mark";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { tokenExternalLinks } from "@/lib/alpha/links";
import { formatAge, formatPct, formatUsd, shortMint } from "@/lib/alpha/format";
import { useAlpha } from "@/lib/alpha/store";

export const Route = createFileRoute("/token/$address")({ component: TokenDetail });

function TokenDetail() {
  const { address } = Route.useParams();
  const token = useAlpha((s) => s.tokens.find((t) => t.address === address));
  const channel = useAlpha((s) => s.channels.find((c) => c.id === token?.sourceChannelId));

  if (!token) {
    return (
      <div className="rounded-2xl bg-surface px-5 py-16 text-center shadow-[var(--shadow-border)]">
        <p className="text-sm text-muted">This mint is not on the desk yet.</p>
        <p className="mt-2 font-mono text-xs text-subtle break-all">{address}</p>
        <p className="mt-4 text-sm text-muted">Paste it in the inspect bar to run the filter.</p>
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
          Back to pulse
        </Link>
      </div>
    );
  }

  const chart = (token.analysis?.parts ?? []).map((p) => ({
    name: p.label.replace(" & ", " "),
    points: Number(p.points.toFixed(1)),
    weight: Number(p.weight.toFixed(1)),
  }));

  const holders = token.onchain?.topHolders ?? [];

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Pulse
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <ScoreMark value={token.analysis?.total} passed={token.status === "passed"} size={72} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-medium tracking-tight">${token.symbol}</h1>
              <StatusBadge status={token.status} />
            </div>
            <p className="text-sm text-muted">{token.name}</p>
            <p className="mt-1 font-mono text-xs text-subtle break-all">{token.address}</p>
            <p className="mt-2 text-xs text-subtle">
              {channel?.title ?? "Desk"} · {token.origin === "inspect" ? "manual inspect" : "telegram tape"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tokenExternalLinks(token.address).map((link) => (
            <Button key={link.id} asChild variant={link.id === "opensea" ? "default" : "outline"} size="sm">
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          ))}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Liquidity" value={formatUsd(token.market?.liquidityUsd)} />
        <Stat label="Market cap" value={formatUsd(token.market?.mcapUsd)} />
        <Stat label="24h volume" value={formatUsd(token.market?.volume24h)} />
        <Stat label="Pair age" value={formatAge(token.market?.pairAgeMin)} />
        <Stat label="Dex" value={token.market?.dexId ?? "—"} />
        <Stat
          label="Mint auth"
          value={
            token.onchain?.queriedAt
              ? token.onchain.mintAuthority
                ? shortMint(token.onchain.mintAuthority)
                : "revoked"
              : "unread"
          }
        />
        <Stat
          label="Freeze auth"
          value={
            token.onchain?.queriedAt
              ? token.onchain.freezeAuthority
                ? shortMint(token.onchain.freezeAuthority)
                : "revoked"
              : "unread"
          }
        />
        <Stat
          label="24h change"
          value={token.market?.priceChange24h != null ? formatPct(token.market.priceChange24h, 1) : "—"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <h2 className="mb-4 text-sm font-medium">Why this score</h2>
          <AnalysisPanel analysis={token.analysis} />
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <h2 className="mb-4 text-sm font-medium">Points by check</h2>
            {chart.length === 0 ? (
              <p className="text-sm text-muted">Score lands after analysis.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} layout="vertical" margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
                    <CartesianGrid stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--color-muted)" fontSize={11} />
                    <YAxis type="category" dataKey="name" width={110} stroke="var(--color-muted)" fontSize={11} />
                    <RTooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        fontSize: 12,
                        color: "var(--color-fg)",
                      }}
                    />
                    <Bar dataKey="points" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <h2 className="mb-3 text-sm font-medium">Largest accounts</h2>
            {holders.length === 0 ? (
              <p className="text-sm text-muted">
                Holder map is often rate-limited on public RPC. Concentration then uses LP/mcap as a proxy and is marked modeled.
              </p>
            ) : (
              <ul className="space-y-2">
                {holders.slice(0, 8).map((h, i) => (
                  <li key={h.address + i} className="flex items-center gap-3 text-xs">
                    <span className="w-5 font-mono text-subtle">{i === 0 ? "LP" : i}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, h.pct)}%` }} />
                    </div>
                    <span className="w-14 text-right font-mono tabular">{h.pct.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <h2 className="mb-3 text-sm font-medium">Source alert</h2>
            <pre className="font-mono text-xs leading-relaxed text-muted whitespace-pre-wrap">
              {token.rawSnippet}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <div className="text-xs tracking-wide text-subtle uppercase">{label}</div>
      <div className="mt-1 font-mono text-sm tabular">{value}</div>
    </div>
  );
}
