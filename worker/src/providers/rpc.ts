import type { HolderRow, OnchainFacts } from "../../../src/lib/alpha/types";
import { rpcCall } from "./signatures";

type MintInfo = {
  owner?: string;
  data?: {
    parsed?: {
      info?: { mintAuthority?: string | null; freezeAuthority?: string | null; decimals?: number; supply?: string };
    };
  };
} | null;

export async function readMint(address: string): Promise<OnchainFacts> {
  const facts: OnchainFacts = {
    mintAuthority: undefined,
    freezeAuthority: undefined,
    decimals: null,
    supply: null,
    tokenProgram: null,
    topHolders: [],
    holderCoveragePct: null,
    queriedAt: null,
  };
  try {
    const value = await rpcCall<{ value?: MintInfo }>("getAccountInfo", [address, { encoding: "jsonParsed" }]);
    const info = value?.value?.data?.parsed?.info;
    if (!value?.value) return facts;
    facts.tokenProgram = value.value.owner ?? null;
    facts.mintAuthority = info?.mintAuthority ?? null;
    facts.freezeAuthority = info?.freezeAuthority ?? null;
    facts.decimals = info?.decimals ?? null;
    facts.supply = info?.supply ?? null;
    facts.queriedAt = Date.now();
  } catch {
    return facts;
  }
  try {
    const largest = await rpcCall<{ value?: { amount?: string; uiAmount?: number; address?: string }[] }>(
      "getTokenLargestAccounts",
      [address],
    );
    const supply = facts.supply ? Number(facts.supply) : 0;
    const decimals = facts.decimals ?? 0;
    const rows: HolderRow[] = [];
    let covered = 0;
    for (const row of largest?.value ?? []) {
      const ui = row.uiAmount ?? (row.amount ? Number(row.amount) / 10 ** decimals : 0);
      const raw = row.amount ? Number(row.amount) : ui * 10 ** decimals;
      const pct = supply > 0 ? (raw / supply) * 100 : 0;
      covered += pct;
      rows.push({ address: row.address ?? "", pct, uiAmount: ui });
    }
    facts.topHolders = rows;
    facts.holderCoveragePct = covered;
  } catch {
    // holder read is best-effort; scoring falls back to market proxies
  }
  return facts;
}
