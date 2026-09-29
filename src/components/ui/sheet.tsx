import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  side = "right",
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { side?: "right" | "left" | "bottom" }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/70" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-surface p-5 shadow-[var(--shadow-border)]",
          side === "right" && "inset-y-0 right-0 h-full w-[min(100%,22rem)]",
          side === "left" && "inset-y-0 left-0 h-full w-[min(100%,22rem)]",
          side === "bottom" && "inset-x-0 bottom-0 rounded-t-2xl",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 size-10 rounded-md text-muted hover:bg-surface-2 hover:text-fg">
          <X className="mx-auto size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
