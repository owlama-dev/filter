import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        mute: "bg-surface-2 text-muted",
        pass: "bg-pass/15 text-pass",
        fail: "bg-fail/15 text-fail",
        warn: "bg-warn/15 text-warn",
        info: "bg-info/15 text-info",
        outline: "border border-border text-muted",
      },
    },
    defaultVariants: { variant: "mute" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
