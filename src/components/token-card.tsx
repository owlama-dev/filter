import { Link } from "@tanstack/react-router";
import { formatAge, formatUsd, relativeTime, shortMint } from "@/lib/alpha/format";
import { DEFAULT_CHANNELS } from "@/lib/alpha/defaults";
import type { TokenRecord } from "@/lib/alpha/types";
import { cn } from "@/lib/utils";
import { ScoreMark } from "@/components/score-mark";
import { StatusBadge } from "@/components/status-badge";

export function TokenCard({ token, dense = false }: { token: TokenRecord; dense?: boolean }) {
  const channel = DEFAULT_CHANNELS.find((c) => c.id === token.sourceChannelId);
  const passed = token.status === "passed";
  const rejected = token.status === "rejected";
  const scored =
    token.status === "passed" || token.status === "rejected" || token.status === "scored";

  return (
    <Link
      to="/token/$address"
      params={{ address: token.address }}
      className={cn(
        "block rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 ease-out hover:shadow-[var(--shadow-border-hover)]",
        passed && "shadow-[0_0_0_1px_rgb(143_175_136/0.35)]",
        rejected && "opacity-90",
      )}
    >
      <div className="flex items-start gap-3">
        <ScoreMark value={scored ? token.analysis?.total : null} passed={passed} size={dense ? 44 : 52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium tracking-tight">${token.symbol}</p>
            <StatusBadge status={token.status} />
          </div>
          <p className="truncate text-xs text-muted">{token.name}</p>
          <p className="mt-1 font-mono text-xs text-subtle">{shortMint(token.address, 6, 6)}</p>
        </div>
      </div>
      {!dense && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 font-mono text-xs text-muted">
          <div>
            <div className="text-subtle">LP</div>
            <div className="tabular text-fg">{formatUsd(token.market?.liquidityUsd)}</div>
          </div>
          <div>
            <div className="text-subtle">MC</div>
            <div className="tabular text-fg">{formatUsd(token.market?.mcapUsd)}</div>
          </div>
          <div>
            <div className="text-subtle">Age</div>
            <div className="tabular text-fg">{formatAge(token.market?.pairAgeMin)}</div>
          </div>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between text-xs text-subtle">
        <span className="truncate">{channel?.title ?? "Unknown desk"}</span>
        <span className="font-mono tabular">{relativeTime(token.extractedAt)}</span>
      </div>
    </Link>
  );
}
