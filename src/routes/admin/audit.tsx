import { createFileRoute } from "@tanstack/react-router";
import { listAudit } from "@/lib/admin/api";
import { usePolling } from "@/lib/admin/use-polling";

export const Route = createFileRoute("/admin/audit")({ component: AuditPage });

interface AuditRow {
  id: number;
  action: string;
  target: string | null;
  before: unknown;
  after: unknown;
  at: string;
  actor: string | null;
}

function diffLine(before: unknown, after: unknown): string {
  if (before == null && after != null) return "created";
  if (before != null && after == null) return "removed";
  try {
    return JSON.stringify(after).slice(0, 140);
  } catch {
    return "";
  }
}

function AuditPage() {
  const { data, error } = usePolling(() => listAudit(), 8000);
  const rows = (data as AuditRow[] | undefined) ?? [];

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
      {error && <p className="p-4 text-sm text-muted">{error}</p>}
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-muted uppercase">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Target</th>
            <th className="px-4 py-3">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/60 last:border-0 align-top">
              <td className="whitespace-nowrap px-4 py-3 text-muted">{new Date(r.at).toLocaleString()}</td>
              <td className="px-4 py-3">{r.actor ?? "system"}</td>
              <td className="px-4 py-3 font-mono text-xs">{r.action}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted">{r.target ?? "—"}</td>
              <td className="max-w-xs truncate px-4 py-3 text-xs text-muted" title={diffLine(r.before, r.after)}>
                {diffLine(r.before, r.after)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted">
                No admin actions yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
