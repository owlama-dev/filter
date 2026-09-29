import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { telegramChannelUrl } from "@/lib/alpha/links";
import { useAlpha } from "@/lib/alpha/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/channels")({ component: ChannelsPage });

function ChannelsPage() {
  const channels = useAlpha((s) => s.channels);
  const tokens = useAlpha((s) => s.tokens);
  const addChannel = useAlpha((s) => s.addChannel);
  const toggleChannel = useAlpha((s) => s.toggleChannel);
  const removeChannel = useAlpha((s) => s.removeChannel);
  const [handle, setHandle] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"channel" | "bot">("channel");

  function onAdd(e: FormEvent) {
    e.preventDefault();
    addChannel({ handle, title, kind });
    setHandle("");
    setTitle("");
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-wide text-muted uppercase">Sources</p>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Channels</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          The desk listens to this roster. Live Solana launches are attributed across enabled desks the way a userbot would fan them in. Toggle a source off to stop routing new mints through it.
        </p>
      </header>

      <form
        onSubmit={onAdd}
        className="grid gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
      >
        <div className="space-y-1.5">
          <Label htmlFor="handle">Telegram handle</Label>
          <Input id="handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="sol_alpha_desk" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Display name</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sol Alpha Desk" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kind">Type</Label>
          <select
            id="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as "channel" | "bot")}
            className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm"
          >
            <option value="channel">Channel</option>
            <option value="bot">Bot</option>
          </select>
        </div>
        <Button type="submit" className="min-h-11">
          Add source
        </Button>
      </form>

      <ul className="space-y-3">
        {channels.map((ch) => {
          const fromHere = tokens.filter((t) => t.sourceChannelId === ch.id);
          const passed = fromHere.filter((t) => t.status === "passed").length;
          return (
            <li
              key={ch.id}
              className="flex flex-col gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-medium">{ch.title}</h2>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs uppercase tracking-wide text-muted">
                    {ch.kind}
                  </span>
                </div>
                <a
                  href={telegramChannelUrl(ch.handle)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-muted underline-offset-4 hover:underline"
                >
                  t.me/{ch.handle}
                </a>
                {ch.note && <p className="mt-1 text-xs text-subtle">{ch.note}</p>}
              </div>
              <div className="flex items-center gap-4 font-mono text-xs text-muted">
                <span className="tabular">{fromHere.length} in</span>
                <span className="tabular text-pass">{passed} pass</span>
                <Switch checked={ch.enabled} onCheckedChange={() => toggleChannel(ch.id)} aria-label={`Toggle ${ch.title}`} />
                <Button variant="ghost" size="sm" onClick={() => removeChannel(ch.id)}>
                  Remove
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
