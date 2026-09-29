import { useEffect, type ReactNode } from "react";
import { useAlpha } from "@/lib/alpha/store";

export function AlphaProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useAlpha.getState().markHydrated();
    useAlpha.getState().start();
    return () => useAlpha.getState().stop();
  }, []);

  return children;
}
