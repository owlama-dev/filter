import type { BundleTrail } from "../../../src/lib/alpha/types";
import { getSignatures } from "./signatures";

/**
 * Looks at the earliest ~40 transactions touching the mint and checks how many
 * share the exact slot of the first (creation) transaction. A high same-slot
 * share means the buys were landed as a single Jito bundle around the launch
 * tx, i.e. sniped/insider supply — not the market-derived proxy the app used
 * to fall back on.
 */
export async function traceBundle(mintAddress: string): Promise<BundleTrail | null> {
  try {
    const sigs = await getSignatures(mintAddress, 60);
    if (!sigs.length) return null;
    const chronological = sigs.slice().reverse(); // oldest first
    const creationSlot = chronological[0]!.slot;
    const early = chronological.slice(0, 40);
    const sameSlot = early.filter((s) => s.slot === creationSlot).length;
    return {
      creationSlot,
      earlyTxCount: early.length,
      sameSlotTxCount: sameSlot,
      sameSlotPct: early.length ? (sameSlot / early.length) * 100 : null,
      tracedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
