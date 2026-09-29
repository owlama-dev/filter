import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { whoami } from "@/lib/admin/api";
import { SignInGate } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const TABS = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/sources", label: "Sources" },
  { to: "/admin/scoring", label: "Scoring" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/audit", label: "Audit log" },
] as const;

type Role = "owner" | "admin" | "analyst";

function useRole() {
  const [state, setState] = useState<{ loading: boolean; role: Role | null; error: string | null }>({
    loading: true,
    role: null,
    error: null,
  });
  useEffect(() => {
    let alive = true;
    whoami()
      .then((r) => alive && setState({ loading: false, role: r.role as Role | null, error: null }))
      .catch((e) => alive && setState({ loading: false, role: null, error: e instanceof Error ? e.message : String(e) }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { loading, role, error } = useRole();

  return (
    <SignInGate
      fallback={
        <div className="mx-auto max-w-sm space-y-4 rounded-2xl bg-surface p-6 text-center shadow-[var(--shadow-border)]">
          <p className="text-sm font-medium">Sign in to reach the admin panel.</p>
          <Link to="/login" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground">
            Go to sign in
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <header>
          <p className="text-xs tracking-wide text-muted uppercase">Control plane</p>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Admin</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Every change here is role-checked on the server and written to the audit log.
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-muted">Checking access…</p>
        ) : !role ? (
          <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-sm font-medium">You don't have admin access.</p>
            <p className="mt-1 text-sm text-muted">
              {error ??
                "Ask an existing admin to add your account, or set OWNER_EMAIL and sign in with that address to bootstrap the owner seat."}
            </p>
          </div>
        ) : (
          <>
            <nav className="flex flex-wrap items-center gap-1 border-b border-border pb-2">
              {TABS.map((tab) => {
                const active = tab.to === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.to);
                if (tab.to === "/admin/members" && role !== "owner") return null;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={cn(
                      "inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors duration-150",
                      active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg",
                    )}
                  >
                    {tab.label}
                  </Link>
                );
              })}
              <span className="ml-auto text-xs text-muted uppercase tracking-wide">{role}</span>
            </nav>
            <Outlet />
          </>
        )}
      </div>
    </SignInGate>
  );
}
