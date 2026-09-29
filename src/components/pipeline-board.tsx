import { TokenCard } from "@/components/token-card";
import type { PipelineStatus, TokenRecord } from "@/lib/alpha/types";
import { cn } from "@/lib/utils";

const COLUMNS: { key: string; title: string; match: (t: TokenRecord) => boolean; hint: string }[] = [
  {
    key: "extracted",
    title: "Extracted",
    match: (t) => t.status === "extracted",
    hint: "CA pulled from the alert",
  },
  {
    key: "enriching",
    title: "Enriching",
    match: (t) => t.status === "enriching",
    hint: "DexScreener + mint account",
  },
  {
    key: "analyzing",
    title: "Analyzing",
    match: (t) => t.status === "analyzing" || t.status === "scored",
    hint: "Holders, LP, tape, score",
  },
  {
    key: "passed",
    title: "Passed",
    match: (t) => t.status === "passed",
    hint: "Cleared threshold, no kill flags",
  },
  {
    key: "rejected",
    title: "Rejected",
    match: (t) => t.status === "rejected",
    hint: "Below threshold or hard fail",
  },
];

export function PipelineBoard({ tokens }: { tokens: TokenRecord[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {COLUMNS.map((col) => {
        const rows = tokens.filter(col.match).slice(0, 12);
        return (
          <section
            key={col.key}
            className="flex min-h-[220px] flex-col rounded-2xl bg-surface/60 p-2 shadow-[var(--shadow-border)]"
          >
            <header className="flex items-baseline justify-between px-2 py-2">
              <div>
                <h3 className="text-xs font-medium tracking-wide uppercase">{col.title}</h3>
                <p className="text-xs text-subtle">{col.hint}</p>
              </div>
              <span className="font-mono text-xs tabular text-muted">{rows.length}</span>
            </header>
            <div className={cn("flex flex-col gap-2", col.key === "rejected" && "opacity-95")}>
              {rows.length === 0 && <p className="px-2 py-6 text-center text-xs text-subtle">Empty</p>}
              {rows.map((token) => (
                <TokenCard key={token.id} token={token} dense={col.key !== "passed"} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function statusColumn(status: PipelineStatus) {
  return COLUMNS.find((c) => c.key === status)?.title ?? status;
}
