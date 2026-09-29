import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Menu,
  Radio,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { APP_NAME } from "@/lib/alpha/defaults";
import { useAlpha, useFeedStats } from "@/lib/alpha/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { InspectBar } from "@/components/inspect-bar";

const NAV = [
  { to: "/", label: "Pulse", icon: Activity },
  { to: "/passed", label: "Passed", icon: CheckCircle2 },
  { to: "/channels", label: "Channels", icon: Radio },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SlidersHorizontal },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
] as const;

function FilterMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 5h16l-6.5 8.2V19l-3 1.5v-7.3L4 5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const stats = useFeedStats();
  const running = useAlpha((s) => s.running);
  const setRunning = useAlpha((s) => s.setRunning);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-h-11 items-center gap-2.5 pr-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-fg">
              <FilterMark className="size-4" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
              <span className="hidden text-xs text-muted sm:block">Solana call filter</span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm transition-colors duration-150",
                    active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-3 pr-2 font-mono text-xs text-muted sm:flex">
              <span className="tabular">
                <span className="text-subtle">in</span> {stats.extracted}
              </span>
              <span className="text-pass tabular">{stats.passed} pass</span>
              <span className="text-fail tabular">{stats.rejected} out</span>
            </div>
            <Button
              variant={running ? "outline" : "default"}
              size="sm"
              onClick={() => setRunning(!running)}
              className="min-h-11"
            >
              <span className={cn("size-1.5 rounded-full", running ? "bg-pass" : "bg-muted")} />
              {running ? "Live" : "Paused"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-3 sm:px-6">
          <InspectBar />
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col gap-2 pt-12">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm",
                pathname === item.to ? "bg-surface-2" : "text-muted",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </SheetContent>
      </Sheet>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 md:pb-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 backdrop-blur-sm md:hidden">
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.to === "/settings" ? Settings2 : item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-xs tracking-wide uppercase",
                  active ? "text-fg" : "text-muted",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
