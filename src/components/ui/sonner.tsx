import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "bg-surface text-fg border border-border shadow-[var(--shadow-border)]",
        },
      }}
    />
  );
}
