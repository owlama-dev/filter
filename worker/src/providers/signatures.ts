import { rpcUrls } from "../env";
import { Limiter, callProvider, fetchJson } from "./http";

const limiter = new Limiter(6);
let cursor = 0;

export type Sig = { signature: string; slot: number; blockTime: number | null; err: unknown };

export async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < rpcUrls.length; i += 1) {
    const idx = (cursor + i) % rpcUrls.length;
    const url = rpcUrls[idx]!;
    try {
      const json = await callProvider(`rpc:${new URL(url).host}`, limiter, () =>
        fetchJson<{ result?: T; error?: { message?: string } }>(
          url,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
          },
          9000,
        ),
      );
      if (json.error) throw new Error(json.error.message ?? "rpc error");
      cursor = idx;
      return json.result as T;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("rpc failed");
}

/** Oldest-first signature history for an address, walking `before` cursors. Capped for cost. */
export async function getSignatures(address: string, limit = 1000): Promise<Sig[]> {
  const out: Sig[] = [];
  let before: string | undefined;
  while (out.length < limit) {
    const page = await rpcCall<Sig[]>("getSignaturesForAddress", [
      address,
      { limit: Math.min(1000, limit - out.length), before },
    ]);
    if (!page.length) break;
    out.push(...page);
    before = page[page.length - 1]!.signature;
    if (page.length < 1000) break;
  }
  return out; // newest-first, as returned by the RPC
}
