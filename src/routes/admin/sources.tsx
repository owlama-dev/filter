import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { adminOverview, deleteSource, saveSource } from "@/lib/admin/api";
import { usePolling } from "@/lib/admin/use-polling";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/sources")({ component: SourcesPage });

interface SourceRow {
  id: string;
  kind: string;
  handle: string;
  title: string;
  enabled: boolean;
  weight: number;
  reputation_sample: number;
  avg_multiple_60m: number | null;
  last_seen_at: string | null;
  error_count: number;
  last_error: string | null;
}

function SourcesPage() {
  const { data, refresh } = usePolling(() => adminOverview(), 5000);
  const sources = ((data?.sources as SourceRow[] | undefined) ?? []).slice().sort((a, b) => a.title.localeCompare(b.title));
  const [form, setForm] = useState({ kind: "telegram_channel", handle: "", title: "", weight: 1 });
  const [busy, setBusy] = useState<string | null>(null);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.handle.trim() || !form.title.trim()) return;
    setBusy("__new");
    try {
      await saveSource({ data: { kind: form.kind as never, handle: form.handle, title: form.title, weight: 1, enabled: true } });
      toast.success("Source added");
      setForm({ kind: "telegram_channel", handle: "", title: "", weight: 1 });
      await refresh();
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : "Failed to add source");
    } finally {
      setBusy(null);
    }
  }

  async function toggle(s: SourceRow) {
    setBusy(s.id);
    try {
      await saveSource({ data: { id: s.id, kind: s.kind as never, handle: s.handle, title: s.title, weight: s.weight, enabled: !s.enabled } });
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusy(null);
    }
  }

  async function remove(s: SourceRow) {
    if (!confirm(`Remove "${s.title}"? Its message history stays; only the source stops being polled/read.`)) return;
    setBusy(s.id);
    try {
      await deleteSource({ data: { id: s.id } });
      toast.success("Source removed");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onAdd} className="grid gap-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:grid-cols-[160px_1fr_1fr_auto]">
        <div>
          <Label>Kind</Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-border bg-surface-2 px-2 text-sm"
            value={form.kind}
            onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
          >
            <option value="telegram_channel">Telegram channel</option>
            <option value="telegram_bot">Telegram bot</option>
            <option value="onchain_feed">On-chain feed</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div>
          <Label>Handle</Label>
          <Input
            className="mt-1"
            placeholder="@channel or t.me/channel"
            value={form.handle}
            onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
          />
        </div>
        <div>
          <Label>Title</Label>
          <Input
            className="mt-1"
            placeholder="Display name"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={busy === "__new"}>
            Add source
          </Button>
        </div>
        <p className="col-span-full text-xs text-muted">
          For Telegram, the worker's session account must already be a member of the channel — adding it here doesn't join it for you.
        </p>
      </form>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3">Avg 60m mult.</th>
              <th className="px-4 py-3">Last seen</th>
              <th className="px-4 py-3">Enabled</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted">@{s.handle}</p>
                  {s.error_count > 0 && (
                    <p className="mt-1 text-xs text-red-400" title={s.last_error ?? undefined}>
                      {s.error_count} recent error{s.error_count === 1 ? "" : "s"}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{s.kind.replace("_", " ")}</td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      s.weight >= 1.2
                        ? "bg-emerald-500/15 text-emerald-400"
                        : s.weight <= 0.7
                          ? "bg-red-500/15 text-red-400"
                          : "bg-surface-2 text-muted"
                    }
                  >
                    {s.weight.toFixed(2)}×{s.reputation_sample > 0 ? ` (n=${s.reputation_sample})` : " (new)"}
                  </Badge>
                </td>
                <td className="px-4 py-3 tabular-nums">{s.avg_multiple_60m != null ? `${s.avg_multiple_60m.toFixed(2)}×` : "—"}</td>
                <td className="px-4 py-3 text-muted">{s.last_seen_at ? new Date(s.last_seen_at).toLocaleString() : "never"}</td>
                <td className="px-4 py-3">
                  <Switch checked={s.enabled} disabled={busy === s.id} onCheckedChange={() => toggle(s)} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" disabled={busy === s.id} onClick={() => remove(s)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No sources yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
