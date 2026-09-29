import { cn } from "@/lib/utils";

export function Progress({ value = 0, className, barClassName }: { value?: number; className?: string; barClassName?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div
        className={cn("h-full rounded-full bg-primary transition-[width] duration-300 ease-[var(--ease-smooth-out)]", barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
