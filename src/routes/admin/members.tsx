import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { listMembers, removeMember, setMember, whoami } from "@/lib/admin/api";
import { usePolling } from "@/lib/admin/use-polling";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/members")({ component: MembersPage });

interface Member {
  user_id: string;
  role: "owner" | "admin" | "analyst";
  email: string;
  name: string | null;
  created_at: string;
}

function MembersPage() {
  const { data: me } = usePolling(() => whoami(), 30000);
  const { data, refresh, error } = usePolling(() => listMembers(), 8000);
  const members = (data as Member[] | undefined) ?? [];
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Member["role"]>("analyst");
  const [busy, setBusy] = useState(false);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await setMember({ data: { email: email.trim(), role } });
      toast.success(`${email} set as ${role}`);
      setEmail("");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setBusy(false);
    }
  }

  async function remove(m: Member) {
    if (!confirm(`Remove ${m.email} from the admin panel?`)) return;
    try {
      await removeMember({ data: { userId: m.user_id } });
      toast.success("Removed");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  }

  if (error) {
    return <p className="text-sm text-muted">Only the owner can manage members. ({error})</p>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onAdd} className="grid gap-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:grid-cols-[1fr_160px_auto]">
        <div>
          <Label>Email</Label>
          <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@example.com" />
        </div>
        <div>
          <Label>Role</Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-border bg-surface-2 px-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as Member["role"])}
          >
            <option value="analyst">Analyst — view + backtest</option>
            <option value="admin">Admin — edit + publish</option>
            <option value="owner">Owner — full control</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={busy}>
            Set role
          </Button>
        </div>
        <p className="col-span-full text-xs text-muted">They must have signed in at least once before you can add them.</p>
      </form>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.user_id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{m.name ?? m.email}</p>
                  <p className="text-xs text-muted">{m.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className="bg-surface-2">{m.role}</Badge>
                </td>
                <td className="px-4 py-3 text-muted">{new Date(m.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  {m.user_id !== me?.userId && (
                    <Button variant="ghost" size="sm" onClick={() => remove(m)}>
                      Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
