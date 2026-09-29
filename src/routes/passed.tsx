import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { TokenCard } from "@/components/token-card";
import { tokenExternalLinks } from "@/lib/alpha/links";
import { formatUsd, shortMint } from "@/lib/alpha/format";
import { useAlpha } from "@/lib/alpha/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/passed")({ component: PassedPage });

function PassedPage() {
  const all = useAlpha((s) => s.tokens);
  const tokens = all.filter((t) => t.status === "passed");

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs tracking-wide text-muted uppercase">Survivors</p>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Passed tokens</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          High-potential names only. OpenSea is first in the link row so a phone can buy or sell without hunting a chart.
        </p>
      </header>

      {tokens.length === 0 ? (
        <div className="rounded-2xl bg-surface px-5 py-16 text-center shadow-[var(--shadow-border)]">
          <p className="text-sm text-muted">Nothing has cleared the filter yet. Leave Pulse running or inspect a mint.</p>
          <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
            Back to pulse
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <article
              key={token.id}
              className="grid gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)] lg:grid-cols-[minmax(0,280px)_1fr] lg:p-4"
            >
              <TokenCard token={token} />
              <div className="flex flex-col justify-between gap-3 px-1 py-1">
                <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
                  <div>
                    <div className="text-subtle">Mint</div>
                    <div className="text-fg">{shortMint(token.address, 6, 6)}</div>
                  </div>
                  <div>
                    <div className="text-subtle">Score</div>
                    <div className="text-pass tabular">{Math.round(token.analysis?.total ?? 0)}</div>
                  </div>
                  <div>
                    <div className="text-subtle">LP</div>
                    <div className="tabular">{formatUsd(token.market?.liquidityUsd)}</div>
                  </div>
                  <div>
                    <div className="text-subtle">24h vol</div>
                    <div className="tabular">{formatUsd(token.market?.volume24h)}</div>
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
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
