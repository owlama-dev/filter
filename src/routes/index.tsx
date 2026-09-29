import { createFileRoute } from "@tanstack/react-router";
import { PipelineBoard } from "@/components/pipeline-board";
import { TelegramFeed } from "@/components/telegram-feed";
import { useAlpha, useFeedStats } from "@/lib/alpha/store";

export const Route = createFileRoute("/")({ component: Pulse });

function Pulse() {
  const tokens = useAlpha((s) => s.tokens);
  const threshold = useAlpha((s) => s.threshold);
  const queue = useAlpha((s) => s.queue);
  const stats = useFeedStats();
  const tapeUpdatedAt = useAlpha((s) => s.tapeUpdatedAt);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">Live desk</p>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Pulse</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Alerts land, the mint is extracted, then the second layer reads the chain and the tape. Only names that clear {threshold} without a kill flag survive.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs sm:text-right">
          <div>
            <dt className="text-subtle">In flight</dt>
            <dd className="tabular text-fg">{stats.inFlight}</dd>
          </div>
          <div>
            <dt className="text-subtle">Queue</dt>
            <dd className="tabular text-fg">{queue.length}</dd>
          </div>
          <div>
            <dt className="text-subtle">Pass rate</dt>
            <dd className="tabular text-fg">
              {stats.extracted ? `${Math.round((stats.passed / stats.extracted) * 100)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-subtle">Tape</dt>
            <dd className="tabular text-fg">
              {tapeUpdatedAt
                ? new Date(tapeUpdatedAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "warming"}
            </dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        <div className="h-[min(52dvh,420px)] lg:h-[calc(100dvh-13rem)]">
          <TelegramFeed />
        </div>
        <PipelineBoard tokens={tokens} />
      </div>
    </div>
  );
}
