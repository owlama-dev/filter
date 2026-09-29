import { DEFAULT_KILL_RULES, DEFAULT_WEIGHTS } from "./defaults";
import { clamp } from "./format";
import type {
  Analysis,
  CheckItem,
  KillFlag,
  KillRules,
  MarketMetrics,
  OnchainFacts,
  ScorePart,
  SignalSource,
  TokenRecord,
  WeightKey,
  Weights,
} from "./types";

function toneFor(signal: number): ScorePart["tone"] {
  if (signal >= 75) return "good";
  if (signal >= 50) return "neutral";
  if (signal >= 32) return "warn";
  return "bad";
}

function part(
  key: WeightKey,
  label: string,
  weight: number,
  signal: number,
  reason: string,
  source: SignalSource,
): ScorePart {
  const s = clamp(signal);
  return {
    key,
    label,
    weight,
    signal: s,
    points: (s / 100) * weight,
    reason,
    source,
    tone: toneFor(s),
  };
}

function isCurveDex(dexId: string | null) {
  const d = (dexId ?? "").toLowerCase();
  return d.includes("pump") || d.includes("moonshot") || d.includes("letsbonk");
}

function uniqueRatio(buyers: number | null, buys: number | null) {
  if (!buyers || !buys || buys <= 0) return null;
  return clamp((buyers / buys) * 100);
}

export function buildChecklist(
  token: Pick<TokenRecord, "market" | "onchain" | "status">,
): CheckItem[] {
  const m = token.market;
  const o = token.onchain;
  const analyzing = token.status === "analyzing" || token.status === "scored" || token.status === "passed" || token.status === "rejected";
  const enriched = Boolean(m) || token.status !== "extracted";
  return [
    {
      id: "mint",
      label: "Read mint & freeze authority",
      done: analyzing && o?.queriedAt != null,
      detail:
        o?.queriedAt == null
          ? o === null
            ? "RPC pending"
            : "On-chain read unavailable — scoring without authorities"
          : o.mintAuthority == null && o.freezeAuthority == null
            ? "Both authorities revoked"
            : "Authority still set",
    },
    {
      id: "holders",
      label: "Cluster top holders",
      done: analyzing && (o?.topHolders.length ?? 0) > 0,
      detail:
        (o?.topHolders.length ?? 0) > 0
          ? `${o!.topHolders.length} largest accounts · ${Math.round(o!.holderCoveragePct ?? 0)}% supply`
          : "Largest-account read pending or rate-limited",
    },
    {
      id: "lp",
      label: "Measure LP versus float",
      done: enriched && m?.liquidityUsd != null,
      detail:
        m?.liquidityUsd != null
          ? `Depth ${Math.round(m.liquidityUsd)} USD on ${m.dexId ?? "unknown dex"}`
          : "Waiting on market tape",
    },
    {
      id: "tape",
      label: "Inspect launch tape",
      done: enriched && m?.pairAgeMin != null,
      detail:
        m?.pairAgeMin != null
          ? `Pair age ${m.pairAgeMin < 1 ? "<1m" : `${Math.round(m.pairAgeMin)}m`} · ${m.buyers1h ?? "?"} unique 1h buyers`
          : "No pair clock yet",
    },
    {
      id: "flow",
      label: "Score organic vs artificial flow",
      done: analyzing && m != null,
      detail: m?.buyers24h != null ? `${m.buyers24h} unique 24h buyers` : undefined,
    },
  ];
}

function authoritiesSignal(onchain: OnchainFacts | null): { signal: number; reason: string; source: SignalSource } {
  if (!onchain || onchain.queriedAt == null || onchain.mintAuthority === undefined) {
    return {
      signal: 48,
      reason: "Mint account not readable. Authority status unknown — scored as incomplete, not clean.",
      source: "modeled",
    };
  }
  const mintLive = Boolean(onchain.mintAuthority);
  const freezeLive = Boolean(onchain.freezeAuthority);
  if (!mintLive && !freezeLive) {
    return {
      signal: 96,
      reason: "Mint and freeze authorities are both revoked on-chain.",
      source: "onchain",
    };
  }
  if (mintLive && freezeLive) {
    return {
      signal: 8,
      reason: "Mint and freeze still sit on a wallet. Supply can be printed or accounts frozen.",
      source: "onchain",
    };
  }
  if (mintLive) {
    return {
      signal: 28,
      reason: `Mint authority still live (${onchain.mintAuthority?.slice(0, 4)}…). Freeze revoked.`,
      source: "onchain",
    };
  }
  return {
    signal: 42,
    reason: "Freeze authority still live. Mint revoked — freeze can still brick holders.",
    source: "onchain",
  };
}

function concentrationSignal(
  onchain: OnchainFacts | null,
  market: MarketMetrics | null,
): { signal: number; reason: string; source: SignalSource } {
  const holders = onchain?.topHolders ?? [];
  if (holders.length >= 3) {
    const rest = holders.slice(1);
    const topInsider = rest[0]?.pct ?? 0;
    const top5 = rest.slice(0, 5).reduce((s, h) => s + h.pct, 0);
    let signal = 88;
    if (topInsider > 18) signal -= 40;
    else if (topInsider > 10) signal -= 22;
    else if (topInsider > 6) signal -= 10;
    if (top5 > 45) signal -= 18;
    else if (top5 > 32) signal -= 8;
    const lp = holders[0]?.pct ?? 0;
    return {
      signal,
      reason: `Top account (treated as LP/curve) ${lp.toFixed(1)}%. Largest non-LP ${topInsider.toFixed(1)}%. Next five wallets ${top5.toFixed(1)}% of supply.`,
      source: "onchain",
    };
  }
  if (market?.liquidityUsd != null && market.mcapUsd && market.mcapUsd > 0) {
    const ratio = market.liquidityUsd / market.mcapUsd;
    const signal = clamp(20 + ratio * 140);
    return {
      signal,
      reason: `Holder map unavailable. Using LP/mcap ${Math.round(ratio * 100)}% as a float proxy.`,
      source: "modeled",
    };
  }
  return {
    signal: 46,
    reason: "No holder map and no float proxy. Concentration left in the middle.",
    source: "modeled",
  };
}

function lpSignal(market: MarketMetrics | null): { signal: number; reason: string; source: SignalSource } {
  if (!market || market.liquidityUsd == null) {
    return { signal: 40, reason: "No liquidity print yet.", source: "market" };
  }
  const liq = market.liquidityUsd;
  let signal = 20;
  if (liq >= 80_000) signal = 92;
  else if (liq >= 25_000) signal = 78;
  else if (liq >= 10_000) signal = 64;
  else if (liq >= 4_000) signal = 48;
  else if (liq >= 1_500) signal = 30;
  else signal = 12;

  if (isCurveDex(market.dexId)) {
    signal = Math.min(74, signal + 8);
    return {
      signal,
      reason: `${Math.round(liq)} USD on ${market.dexId}. Bonding-curve depth is protocol-owned, not a burned Raydium lock.`,
      source: "market",
    };
  }
  const mcap = market.mcapUsd ?? 0;
  if (mcap > 0) {
    const ratio = liq / mcap;
    if (ratio < 0.04) signal -= 18;
    else if (ratio > 0.25) signal += 8;
  }
  return {
    signal,
    reason: `Pair depth ${Math.round(liq)} USD on ${market.dexId ?? "unknown dex"}${mcap ? ` · ${Math.round((liq / mcap) * 100)}% of cap` : ""}. Lock/burn not independently verified.`,
    source: "market",
  };
}

function liquiditySizeSignal(market: MarketMetrics | null): { signal: number; reason: string; source: SignalSource } {
  if (!market || market.liquidityUsd == null) {
    return { signal: 38, reason: "Size unknown until the pair is enriched.", source: "market" };
  }
  const liq = market.liquidityUsd;
  const vol = market.volume24h ?? 0;
  let signal = 18;
  if (liq >= 100_000) signal = 90;
  else if (liq >= 40_000) signal = 78;
  else if (liq >= 15_000) signal = 64;
  else if (liq >= 6_000) signal = 50;
  else if (liq >= 2_000) signal = 34;
  else signal = 12;

  if (liq > 0 && vol / liq > 25) signal -= 14;
  if (liq > 0 && vol / liq < 0.08 && (market.pairAgeMin ?? 0) > 180) signal -= 10;
  return {
    signal,
    reason: `Depth ${Math.round(liq)} · 24h volume ${Math.round(vol)}${liq ? ` · turnover ${(vol / liq).toFixed(1)}×` : ""}.`,
    source: "market",
  };
}

function organicSignal(market: MarketMetrics | null): { signal: number; reason: string; source: SignalSource } {
  if (!market) return { signal: 44, reason: "No tape to judge flow.", source: "market" };
  const ratio = uniqueRatio(market.buyers1h ?? market.buyers24h, market.buys1h ?? market.buys24h);
  const buys = market.buys1h ?? market.buys24h ?? 0;
  const sells = market.sells1h ?? market.sells24h ?? 0;
  let signal = 50;
  if (ratio != null) {
    if (ratio >= 75) signal = 82;
    else if (ratio >= 55) signal = 68;
    else if (ratio >= 35) signal = 48;
    else signal = 28;
  }
  if (buys + sells > 20) {
    const sellShare = sells / (buys + sells);
    if (sellShare > 0.72) signal -= 12;
    if (sellShare < 0.22 && (market.pairAgeMin ?? 0) < 60) signal -= 8;
  }
  const buyers = market.buyers1h ?? market.buyers24h;
  return {
    signal,
    reason:
      ratio != null
        ? `Unique-buyer ratio ${Math.round(ratio)}% · ${buyers ?? "?"} buyers vs ${buys} buys. Buy/sell ${buys}/${sells}.`
        : `Buy/sell ${buys}/${sells}. Unique-wallet ratio not published.`,
    source: "market",
  };
}

function bundleSignal(
  market: MarketMetrics | null,
  onchain: OnchainFacts | null,
): { signal: number; reason: string; source: SignalSource } {
  const trail = onchain?.bundle;
  if (trail && trail.sameSlotPct != null) {
    const pct = trail.sameSlotPct;
    if (pct >= 55) {
      return {
        signal: clamp(28 - pct / 4),
        reason: `${trail.sameSlotTxCount}/${trail.earlyTxCount} of the earliest buys landed in the creation slot (${pct.toFixed(0)}%) — this is a Jito-style bundle, not organic discovery.`,
        source: "onchain",
      };
    }
    if (pct <= 15) {
      return {
        signal: 80,
        reason: `Only ${pct.toFixed(0)}% of early buys shared the creation slot. Traded slot-by-slot, not bundled.`,
        source: "onchain",
      };
    }
    return {
      signal: clamp(72 - pct / 2),
      reason: `${pct.toFixed(0)}% of early buys shared the creation slot — some clustering, short of a clear bundle.`,
      source: "onchain",
    };
  }
  const age = market?.pairAgeMin ?? null;
  const holders = onchain?.topHolders ?? [];
  const rest = holders.slice(1);
  const clustered = rest.slice(0, 8).reduce((s, h) => s + h.pct, 0);
  let signal = 62;
  const notes: string[] = [];

  if (age != null && age < 12 && (market?.mcapUsd ?? 0) > 40_000 && (market?.liquidityUsd ?? 0) < 12_000) {
    signal -= 28;
    notes.push("Cap outran depth in the first minutes — classic bundle print.");
  }
  if (age != null && age < 25 && clustered > 38) {
    signal -= 22;
    notes.push(`Non-LP cluster ${clustered.toFixed(0)}% while the pair is still young.`);
  }
  const buyers = market?.buyers1h;
  const vol1h = market?.volume1h;
  if (age != null && age < 40 && buyers != null && buyers < 18 && (vol1h ?? 0) > 20_000) {
    signal -= 16;
    notes.push("Few unique wallets carrying heavy 1h volume.");
  }
  if (age != null && age > 180 && clustered < 22) {
    signal += 10;
    notes.push("Tape has aged without a tight non-LP cluster.");
  }
  if (!notes.length) {
    notes.push(
      age != null
        ? `Pair age ${Math.round(age)}m. No same-block proof — this is launch clustering, not a Jito decode.`
        : "No pair clock. Bundle score is conservative.",
    );
  }
  return {
    signal,
    reason: notes.join(" "),
    source: holders.length ? "onchain" : "modeled",
  };
}

function freshWalletSignal(market: MarketMetrics | null): { signal: number; reason: string; source: SignalSource } {
  const age = market?.pairAgeMin ?? null;
  const buyers5ish = market?.buyers1h;
  const buys = market?.buys1h;
  let signal = 55;
  if (age != null && age < 8 && (buyers5ish ?? 0) > 80) {
    signal = 22;
    return {
      signal,
      reason: `${buyers5ish} unique 1h buyers on a ${Math.round(age)}m pair — typical funded-fresh swarm, not organic discovery.`,
      source: "modeled",
    };
  }
  if (age != null && age < 20 && buyers5ish != null && buys && buyers5ish / buys > 0.9 && buyers5ish > 40) {
    signal = 30;
    return {
      signal,
      reason: "Almost every buy is a new wallet in the opening tape. High fresh-wallet ratio.",
      source: "modeled",
    };
  }
  if (age != null && age > 240 && (buyers5ish ?? 0) > 0) {
    signal = 74;
    return {
      signal,
      reason: "Pair has aged. Early fresh-wallet swarm has had time to wash out.",
      source: "modeled",
    };
  }
  return {
    signal,
    reason:
      "Wallet age is not on the public tape. Fresh-wallet ratio is modeled from launch crowding, not from first-funding traces.",
    source: "modeled",
  };
}

function deployerSignal(
  onchain: OnchainFacts | null,
  market: MarketMetrics | null,
): { signal: number; reason: string; source: SignalSource } {
  const mintLive = Boolean(onchain?.mintAuthority);
  const freezeLive = Boolean(onchain?.freezeAuthority);
  const age = market?.pairAgeMin ?? 0;
  const trail = onchain?.deployer;
  if (trail) {
    if (trail.priorRugCount > 0) {
      const signal = clamp(45 - trail.priorRugCount * 18);
      return {
        signal,
        reason: `Deployer wallet has ${trail.priorMintCount} prior launch${trail.priorMintCount === 1 ? "" : "es"} in our ledger, ${trail.priorRugCount} of which rugged.`,
        source: "onchain",
      };
    }
    if (trail.priorMintCount > 0) {
      return {
        signal: 70,
        reason: `Deployer wallet has ${trail.priorMintCount} prior launch${trail.priorMintCount === 1 ? "" : "es"} in our ledger with no tracked rugs.`,
        source: "onchain",
      };
    }
    if (trail.walletAgeDays != null && trail.walletAgeDays < 2) {
      return {
        signal: 40,
        reason: `Deployer wallet is ${trail.walletAgeDays.toFixed(1)} days old — freshly funded, no track record either way.`,
        source: "onchain",
      };
    }
    if (trail.walletAgeDays != null) {
      return {
        signal: 62,
        reason: `Deployer wallet is ${trail.walletAgeDays.toFixed(0)} days old with no launches in our ledger yet.`,
        source: "onchain",
      };
    }
  }
  if (onchain?.queriedAt && mintLive) {
    return {
      signal: 18,
      reason: "Deployer still holds mint authority. History is irrelevant until that is revoked.",
      source: "onchain",
    };
  }
  if (onchain?.queriedAt && !mintLive && !freezeLive && age > 120) {
    return {
      signal: 76,
      reason: "Authorities revoked and the pair has survived more than two hours. Funding trail is not fully walked.",
      source: "onchain",
    };
  }
  if (onchain?.queriedAt && !mintLive && !freezeLive) {
    return {
      signal: 64,
      reason: "Mint revoked. Deployer funding trail (CEX vs mixer, prior rugs) is not queried — this is not a greenlight.",
      source: "onchain",
    };
  }
  return {
    signal: 46,
    reason: "Deployer wallet not resolved. Trail scored as unknown.",
    source: "modeled",
  };
}

function killFlags(
  onchain: OnchainFacts | null,
  market: MarketMetrics | null,
  rules: KillRules = DEFAULT_KILL_RULES,
): KillFlag[] {
  const flags: KillFlag[] = [];
  const mintLive = Boolean(onchain?.mintAuthority);
  const freezeLive = Boolean(onchain?.freezeAuthority);
  if (rules.requireAuthoritiesRevoked && onchain?.queriedAt && mintLive && freezeLive) {
    flags.push({
      code: "AUTH_LIVE",
      label: "Mint and freeze still live",
      detail: "Dev can print and freeze. Auto-reject regardless of the rest of the tape.",
    });
  }
  if ((market?.liquidityUsd ?? Infinity) < rules.minLiquidityUsd) {
    flags.push({
      code: "NO_BOOK",
      label: "No tradable book",
      detail: `Liquidity under $${rules.minLiquidityUsd.toLocaleString()}. Exit is theoretical.`,
    });
  }
  const rest = (onchain?.topHolders ?? []).slice(1);
  const topInsider = rest[0]?.pct ?? 0;
  if (topInsider >= rules.maxTopHolderPct) {
    flags.push({
      code: "WHALE_BAG",
      label: `Single wallet over ${rules.maxTopHolderPct}%`,
      detail: `Largest non-LP holder controls ${topInsider.toFixed(1)}% of supply.`,
    });
  }
  const trail = onchain?.deployer;
  if (trail && trail.priorRugCount > rules.maxDeployerPriorRugs) {
    flags.push({
      code: "SERIAL_RUGGER",
      label: "Deployer has rugged before",
      detail: `This wallet's prior launches rugged ${trail.priorRugCount} time${trail.priorRugCount === 1 ? "" : "s"} in our ledger.`,
    });
  }
  const bundle = onchain?.bundle;
  if (bundle && bundle.sameSlotPct != null && bundle.sameSlotPct >= rules.maxSameSlotBundlePct) {
    flags.push({
      code: "BUNDLE_LAUNCH",
      label: "Bundled launch",
      detail: `${bundle.sameSlotPct.toFixed(0)}% of the earliest buys shared the creation slot.`,
    });
  }
  return flags;
}

export function scoreToken(
  token: Pick<TokenRecord, "market" | "onchain" | "status">,
  weights: Weights = DEFAULT_WEIGHTS,
  threshold: number,
  killRules: KillRules = DEFAULT_KILL_RULES,
): Analysis {
  const weightTotal =
    weights.deployer +
    weights.freshWallets +
    weights.concentration +
    weights.bundles +
    weights.lpLock +
    weights.authorities +
    weights.liquidity +
    weights.organic || 1;

  const scale = 100 / weightTotal;
  const w = {
    deployer: weights.deployer * scale,
    freshWallets: weights.freshWallets * scale,
    concentration: weights.concentration * scale,
    bundles: weights.bundles * scale,
    lpLock: weights.lpLock * scale,
    authorities: weights.authorities * scale,
    liquidity: weights.liquidity * scale,
    organic: weights.organic * scale,
  };

  const a = authoritiesSignal(token.onchain);
  const c = concentrationSignal(token.onchain, token.market);
  const l = lpSignal(token.market);
  const s = liquiditySizeSignal(token.market);
  const o = organicSignal(token.market);
  const b = bundleSignal(token.market, token.onchain);
  const f = freshWalletSignal(token.market);
  const d = deployerSignal(token.onchain, token.market);

  const parts: ScorePart[] = [
    part("authorities", "Mint & freeze", w.authorities, a.signal, a.reason, a.source),
    part("concentration", "Holder concentration", w.concentration, c.signal, c.reason, c.source),
    part("lpLock", "LP quality", w.lpLock, l.signal, l.reason, l.source),
    part("liquidity", "Liquidity & size", w.liquidity, s.signal, s.reason, s.source),
    part("organic", "Organic flow", w.organic, o.signal, o.reason, o.source),
    part("bundles", "Bundle / same-block", w.bundles, b.signal, b.reason, b.source),
    part("freshWallets", "Fresh wallets", w.freshWallets, f.signal, f.reason, f.source),
    part("deployer", "Deployer trail", w.deployer, d.signal, d.reason, d.source),
  ];

  const total = clamp(parts.reduce((sum, p) => sum + p.points, 0));
  const flags = killFlags(token.onchain, token.market, killRules);
  const passed = flags.length === 0 && total >= threshold;

  return {
    parts,
    total,
    threshold,
    passed,
    killFlags: flags,
    checklist: buildChecklist({ ...token, status: "scored" }),
  };
}

export function emptyMetrics(): MarketMetrics {
  return {
    priceUsd: null,
    liquidityUsd: null,
    volume24h: null,
    volume1h: null,
    volume5m: null,
    mcapUsd: null,
    fdvUsd: null,
    buys24h: null,
    sells24h: null,
    buyers24h: null,
    sellers24h: null,
    buyers1h: null,
    buys1h: null,
    sells1h: null,
    pairAgeMin: null,
    dexId: null,
    pairAddress: null,
    pairUrl: null,
    priceChange24h: null,
  };
}
