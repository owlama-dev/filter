import type { Channel, KillRules, Weights } from "./types";

export const APP_NAME = "AlphaFilter";
export const APP_TAGLINE = "Second-layer filter for Solana launches";

export const DEFAULT_THRESHOLD = 72;

export const DEFAULT_WEIGHTS: Weights = {
  deployer: 15,
  freshWallets: 12,
  concentration: 15,
  bundles: 15,
  lpLock: 12,
  authorities: 12,
  liquidity: 10,
  organic: 9,
};

export const WEIGHT_META: Record<
  keyof Weights,
  { label: string; blurb: string }
> = {
  deployer: {
    label: "Deployer trail",
    blurb: "Whether the mint still answers to a wallet, and how that reads on a fresh launch.",
  },
  freshWallets: {
    label: "Fresh wallets",
    blurb: "Early tape crowded with brand-new buyers usually means funded insiders.",
  },
  concentration: {
    label: "Holder concentration",
    blurb: "Top wallets after peeling off the LP / bonding curve.",
  },
  bundles: {
    label: "Bundle / same-block",
    blurb: "Launch clustering — snipers and bundled supply in the opening tape.",
  },
  lpLock: {
    label: "LP quality",
    blurb: "Depth versus float, and whether the curve/LP looks protocol-owned.",
  },
  authorities: {
    label: "Mint & freeze",
    blurb: "Authorities revoked on-chain. Both live is a hard risk.",
  },
  liquidity: {
    label: "Liquidity & size",
    blurb: "USD depth, volume quality, and whether the book can actually be traded.",
  },
  organic: {
    label: "Organic flow",
    blurb: "Unique buyers versus churn, buy/sell balance, wash-like spikes.",
  },
};

/** Matches the checks killFlags() used to have hardcoded, now admin-editable. */
export const DEFAULT_KILL_RULES: KillRules = {
  requireAuthoritiesRevoked: true,
  minLiquidityUsd: 800,
  maxTopHolderPct: 40,
  maxDeployerPriorRugs: 2,
  maxSameSlotBundlePct: 55,
};

export const KILL_RULE_META: Record<
  keyof KillRules,
  { label: string; blurb: string; kind: "bool" | "number"; min?: number; max?: number; step?: number }
> = {
  requireAuthoritiesRevoked: {
    label: "Require authorities revoked",
    blurb: "Auto-reject if mint AND freeze authority are both still live.",
    kind: "bool",
  },
  minLiquidityUsd: {
    label: "Minimum liquidity (USD)",
    blurb: "Auto-reject below this depth — exit is theoretical.",
    kind: "number",
    min: 0,
    max: 20000,
    step: 100,
  },
  maxTopHolderPct: {
    label: "Max single holder (%)",
    blurb: "Auto-reject if one non-LP wallet controls more than this share of supply.",
    kind: "number",
    min: 5,
    max: 90,
    step: 1,
  },
  maxDeployerPriorRugs: {
    label: "Max deployer prior rugs",
    blurb: "Auto-reject if this wallet's earlier launches rugged more than this many times.",
    kind: "number",
    min: 0,
    max: 10,
    step: 1,
  },
  maxSameSlotBundlePct: {
    label: "Max same-slot bundle (%)",
    blurb: "Auto-reject if this share of the earliest buys landed in the creation slot.",
    kind: "number",
    min: 10,
    max: 100,
    step: 5,
  },
};

export const DEFAULT_CHANNELS: Channel[] = [
  {
    id: "dexscreener-solana-boosts",
    handle: "solana/boosts",
    title: "DexScreener",
    kind: "onchain_feed",
    enabled: true,
  },
];

export const QUOTE_MINTS = new Set([
  "So11111111111111111111111111111111111111112",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  "USD1ttGY1N17NEEHLmELoaybftRJYQPBm4FBqct1uk5",
  "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKid3Npj6Q",
]);

export const SOLANA_CA_RE = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
