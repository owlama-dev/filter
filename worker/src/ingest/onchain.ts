import { q } from "../db";
import { env } from "../env";
import { fetchPools } from "../providers/gecko";
import { markSourceError, recordCall } from "./common";

const FEEDS = [
  { sourceId: "gecko-new", kind: "new_pools" as const },
  { sourceId: "gecko-trending", kind: "trending_pools" as const },
];

/** Polls on-chain launch feeds. Enabling or disabling the source in the admin panel takes effect on the next tick. */
export function startOnchainIngest(isStopping: () => boolean) {
  const tick = async () => {
    for (const feed of FEEDS) {
      if (isStopping()) return;
      const [src] = await q<{ enabled: boolean }>("select enabled from sources where id = $1", [feed.sourceId]);
      if (!src?.enabled) continue;
      try {
        const pools = await fetchPools(feed.kind);
        for (const p of pools) {
          await recordCall({
            sourceId: feed.sourceId,
            externalId: p.pairAddress ?? p.address,
            body: `${p.symbol} ${p.name} ${p.address}`,
            addresses: [p.address],
          });
        }
      } catch (err) {
        await markSourceError(feed.sourceId, err instanceof Error ? err.message : String(err));
      }
    }
  };
  const loop = async () => {
    while (!isStopping()) {
      await tick().catch((e) => console.error("[onchain]", e));
      await new Promise((r) => setTimeout(r, env.GECKO_POLL_MS));
    }
  };
  void loop();
}
