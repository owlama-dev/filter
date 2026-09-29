import { useCallback, useEffect, useRef, useState } from "react";

interface PollState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Calls `fn` immediately, then every `intervalMs`, until unmounted. This is
 * the app's live-update mechanism for the admin panel: short-interval polling
 * against server functions, rather than a persistent connection — simple and
 * robust, at the cost of up to one interval's staleness.
 */
export function usePolling<T>(fn: () => Promise<T>, intervalMs: number, deps: unknown[] = []) {
  const [state, setState] = useState<PollState<T>>({ data: null, error: null, loading: true });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    try {
      const data = await fnRef.current();
      setState({ data, error: null, loading: false });
    } catch (err) {
      setState((s) => ({ data: s.data, error: err instanceof Error ? err.message : String(err), loading: false }));
    }
  }, []);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    const tick = async () => {
      if (!alive) return;
      await run();
    };
    void tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [intervalMs, run, ...deps]);

  return { ...state, refresh: run };
}
