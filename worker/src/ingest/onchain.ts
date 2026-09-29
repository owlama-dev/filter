import { markSourceError } from "./common";

/**
 * Source-driven ingest: this app should only consume feeds that are explicitly
 * configured by the user/admin. No hard-wired vendor feeds, no Coingecko/GeckoTerminal defaults.
 */
export function startOnchainIngest(isStopping: () => boolean) {
  const loop = async () => {
    while (!isStopping()) {
      await new Promise((r) => setTimeout(r, 60000));
    }
  };
  void loop().catch((e) => {
    console.error("[onchain]", e);
    void markSourceError("source-driven", e instanceof Error ? e.message : String(e));
  });
}
