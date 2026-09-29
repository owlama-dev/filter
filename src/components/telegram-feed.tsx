import { Link } from "@tanstack/react-router";
import { formatClock } from "@/lib/alpha/format";
import { useAlpha } from "@/lib/alpha/store";
import { cn } from "@/lib/utils";

export function TelegramFeed() {
  const messages = useAlpha((s) => s.messages);
  const channels = useAlpha((s) => s.channels);
  const tokens = useAlpha((s) => s.tokens);
  const tapeError = useAlpha((s) => s.tapeError);
  const running = useAlpha((s) => s.running);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
      <header className="mb-3 flex items-baseline justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-medium tracking-tight">Telegram tape</h2>
          <p className="text-xs text-muted">Public launch flow, formatted as desk alerts.</p>
        </div>
        <span className={cn("font-mono text-[11px] uppercase", running ? "text-pass" : "text-muted")}>
          {running ? "listening" : "paused"}
        </span>
      </header>
      {tapeError && (
        <p className="mb-3 rounded-lg bg-fail/10 px-3 py-2 text-xs text-fail">{tapeError}</p>
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="px-2 py-8 text-center text-sm text-muted">
            Waiting for the first alert. New Solana pools are pulled onto this tape in real time.
          </p>
        )}
        {messages.map((msg) => {
          const channel = channels.find((c) => c.id === msg.channelId);
          const token = tokens.find((t) => t.id === msg.tokenId);
          return (
            <article
              key={msg.id}
              className="rounded-xl bg-bg p-3 shadow-[var(--shadow-border)]"
            >
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-subtle">
                <span className="truncate font-medium tracking-wide text-muted uppercase">
                  {channel?.title ?? msg.channelId}
                </span>
                <time className="font-mono tabular">{formatClock(msg.receivedAt)}</time>
              </div>
              <pre className="font-mono text-[11px] leading-relaxed text-fg whitespace-pre-wrap">
                {msg.text}
              </pre>
              {token && (
                <Link
                  to="/token/$address"
                  params={{ address: token.address }}
                  className="mt-2 inline-flex min-h-9 items-center text-[11px] text-muted underline-offset-4 hover:text-fg hover:underline"
                >
                  Follow in pipeline → {token.status}
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
