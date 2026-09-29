export type ChainId = "solana";

export type PipelineStatus =
  | "extracted"
  | "enriching"
  | "analyzing"
  | "scored"
  | "passed"
  | "rejected";

export type ChannelKind = "channel" | "bot" | "onchain_feed";

export interface Channel {
  id: string;
  handle: string;
  title: string;
  kind: ChannelKind;
  enabled: boolean;
  note?: string;
}

export interface TelegramMessage {
  id: string;
  channelId: string;
  text: string;
  receivedAt: number;
  extractedAddresses: string[];
  tokenId?: string;
}

export interface MarketMetrics {
  priceUsd: number | null;
  liquidityUsd: number | null;
  volume24h: number | null;
  volume1h: number | null;
  volume5m: number | null;
  mcapUsd: number | null;
  fdvUsd: number | null;
  buys24h: number | null;
  sells24h: number | null;
  buyers24h: number | null;
  sellers24h: number | null;
  buyers1h: number | null;
  buys1h: number | null;
  sells1h: number | null;
  pairAgeMin: number | null;
  dexId: string | null;
  pairAddress: string | null;
  pairUrl: string | null;
  priceChange24h: number | null;
}

export interface HolderRow {
  address: string;
  pct: number;
  uiAmount: number;
  owner?: string | null;
  clusterPct?: number;
  isLp?: boolean;
}

export interface OnchainFacts {
  mintAuthority: string | null | undefined;
  freezeAuthority: string | null | undefined;
  decimals: number | null;
  supply: string | null;
  tokenProgram: string | null;
  topHolders: HolderRow[];
  holderCoveragePct: number | null;
  queriedAt: number | null;
  /** Real deployer trace (worker only) — undefined means "not traced", not "clean". */
  deployer?: DeployerTrail | null;
  /** Real same-block/bundle trace (worker only) — undefined means "not traced". */
  bundle?: BundleTrail | null;
  /** Best-effort early signer and first-funding trace from public RPC. */
  freshWallets?: FreshWalletTrail | null;
  /** Queried pool account facts; lock/burn is unknown unless the account exposes it. */
  lp?: LpTrail | null;
}

/** Result of walking the mint's creation transaction and the fee payer's history. */
export interface DeployerTrail {
  wallet: string;
  walletAgeDays: number | null;
  walletTxCount: number | null;
  /** Other SPL mints this wallet has created, from our own dev_wallets ledger — not a full chain scan. */
  priorMintCount: number;
  /** Of those prior mints, how many we later marked as rugged (outcome multiple <= 0.3 at 60m). */
  priorRugCount: number;
  tracedAt: number;
}

/** Result of checking how many of the earliest transactions on the mint land in the pool-creation slot. */
export interface BundleTrail {
  creationSlot: number | null;
  earlyTxCount: number;
  sameSlotTxCount: number;
  sameSlotPct: number | null;
  tracedAt: number;
}

export interface FreshWalletTrail {
  earlyBuyerCount: number;
  freshBuyerCount: number;
  freshRatioPct: number | null;
  fundedAgeDaysMedian: number | null;
  tracedAt: number;
}

export interface LpTrail {
  poolAddress: string | null;
  dexId: string | null;
  poolAccountOwner: string | null;
  poolAccountReadable: boolean;
  reserveTokenAccounts: number;
  lpMint: string | null;
  burnedOrLockedPct: number | null;
  tracedAt: number;
}

/** Editable auto-reject thresholds. Mirrors the hardcoded checks scoring.ts used to ship with. */
export interface KillRules {
  requireAuthoritiesRevoked: boolean;
  minLiquidityUsd: number;
  maxTopHolderPct: number;
  maxDeployerPriorRugs: number;
  maxSameSlotBundlePct: number;
}

export type SignalSource = "onchain" | "market" | "modeled";

export interface Weights {
  deployer: number;
  freshWallets: number;
  concentration: number;
  bundles: number;
  lpLock: number;
  authorities: number;
  liquidity: number;
  organic: number;
}

export type WeightKey = keyof Weights;

export interface ScorePart {
  key: WeightKey;
  label: string;
  weight: number;
  signal: number;
  points: number;
  reason: string;
  source: SignalSource;
  tone: "good" | "warn" | "bad" | "neutral";
}

export interface KillFlag {
  code: string;
  label: string;
  detail: string;
}

export interface CheckItem {
  id: string;
  label: string;
  done: boolean;
  detail?: string;
}

export interface Analysis {
  parts: ScorePart[];
  total: number;
  threshold: number;
  passed: boolean;
  killFlags: KillFlag[];
  checklist: CheckItem[];
}

export interface TokenRecord {
  id: string;
  address: string;
  chain: ChainId;
  name: string;
  symbol: string;
  status: PipelineStatus;
  sourceChannelId: string;
  sourceMessageId: string;
  extractedAt: number;
  updatedAt: number;
  rawSnippet: string;
  market: MarketMetrics | null;
  onchain: OnchainFacts | null;
  analysis: Analysis | null;
  imageUrl?: string | null;
  error?: string | null;
  origin: "tape" | "inspect";
}

export interface LaunchCandidate {
  address: string;
  name: string;
  symbol: string;
  dexId: string | null;
  pairAddress: string | null;
  imageUrl: string | null;
  liquidityUsd: number | null;
  mcapUsd: number | null;
  volume24h: number | null;
  pairAgeMin: number | null;
  createdAt: string | null;
}

export interface FeedStats {
  extracted: number;
  passed: number;
  rejected: number;
  inFlight: number;
}
