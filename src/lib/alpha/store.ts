import { create } from "zustand";
import { inspectMint, listLaunchTape } from "./api";
import { DEFAULT_CHANNELS, DEFAULT_THRESHOLD, DEFAULT_WEIGHTS } from "./defaults";
import { extractMints, isSolanaMint } from "./extract";
import { scoreToken, buildChecklist } from "./scoring";
import type {
  LaunchCandidate,
  PipelineStatus,
  TelegramMessage,
  TokenRecord,
  Weights,
} from "./types";

const MAX_TOKENS = 80;
const MAX_MESSAGES = 60;

type EngineTimers = {
  drip: number | null;
  refresh: number | null;
};

const timers: EngineTimers = { drip: null, refresh: null };

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function formatLaunchTape(launch: LaunchCandidate) {
  const lp = launch.liquidityUsd != null ? `LP $${Math.round(launch.liquidityUsd).toLocaleString("en-US")}` : "LP n/a";
  const cap = launch.mcapUsd != null ? `MC $${Math.round(launch.mcapUsd).toLocaleString("en-US")}` : "MC n/a";
  const age =
    launch.pairAgeMin == null
      ? "age n/a"
      : launch.pairAgeMin < 1
        ? "under 1m"
        : `${Math.round(launch.pairAgeMin)}m old`;
  const dex = launch.dexId ?? "unknown dex";
  return [
    "DEXSCREENER · SOLANA POOL",
    `$${launch.symbol}  ${launch.name}`,
    `mint  ${launch.address}`,
    `${dex} · ${age} · ${lp} · ${cap}`,
  ].join("\n");
}

function betterName(inspected: string, fallback: string) {
  if (!inspected || inspected === "???" || inspected.startsWith("token ")) return fallback;
  return inspected;
}

export interface AlphaState {
  weights: Weights;
  threshold: number;
  running: boolean;
  hydrated: boolean;
  tokens: TokenRecord[];
  messages: TelegramMessage[];
  queue: LaunchCandidate[];
  seen: string[];
  tapeUpdatedAt: number | null;
  tapeError: string | null;
  inspectBusy: boolean;
  feedMs: number;
  setRunning: (running: boolean) => void;
  setThreshold: (n: number) => void;
  setWeight: (key: keyof Weights, value: number) => void;
  resetWeights: () => void;
  setFeedMs: (n: number) => void;
  ingestLaunch: (launch: LaunchCandidate, origin: TokenRecord["origin"]) => string | null;
  inspectAddress: (address: string) => string | null;
  refreshTape: () => Promise<void>;
  start: () => void;
  stop: () => void;
  resetDemo: () => void;
  markHydrated: () => void;
}

function patchToken(id: string, patch: Partial<TokenRecord>) {
  useAlpha.setState((s) => ({
    tokens: s.tokens.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t)),
  }));
}

async function runPipeline(id: string) {
  const snap = () => useAlpha.getState().tokens.find((t) => t.id === id);
  if (!snap()) return;

  patchToken(id, { status: "extracted" });

  const afterWait = snap();
  if (!afterWait) return;
  patchToken(id, {
    status: "enriching",
    analysis: {
      parts: [],
      total: 0,
      threshold: useAlpha.getState().threshold,
      passed: false,
      killFlags: [],
      checklist: buildChecklist({ ...afterWait, status: "enriching" }),
    },
  });

  try {
    const inspected = await inspectMint({ data: { address: afterWait.address } });
    if (!snap()) return;
    patchToken(id, {
      name: betterName(inspected.name, afterWait.name),
      symbol: betterName(inspected.symbol, afterWait.symbol),
      market: inspected.market,
      onchain: inspected.onchain,
      imageUrl: inspected.imageUrl ?? afterWait.imageUrl,
      status: "analyzing",
    });
    const mid = snap();
    if (mid) {
      patchToken(id, {
        analysis: {
          parts: [],
          total: 0,
          threshold: useAlpha.getState().threshold,
          passed: false,
          killFlags: [],
          checklist: buildChecklist({ ...mid, status: "analyzing" }),
        },
      });
    }
  } catch (err) {
    if (!snap()) return;
    patchToken(id, {
      status: "analyzing",
      error: err instanceof Error ? err.message : "Enrichment failed",
    });
  }

  const current = snap();
  if (!current) return;
  const { weights, threshold } = useAlpha.getState();
  const analysis = scoreToken(current, weights, threshold);
  const next: PipelineStatus = analysis.passed ? "passed" : "rejected";
  patchToken(id, { analysis, status: "scored" });
  patchToken(id, { status: next });
}

function dripOnce() {
  const state = useAlpha.getState();
  if (!state.running) return;
  const next = state.queue.find((q) => !state.seen.includes(q.address));
  if (!next) return;
  state.ingestLaunch(next, "tape");
}

function stopTimers() {
  if (typeof window === "undefined") return;
  if (timers.drip != null) window.clearTimeout(timers.drip);
  if (timers.refresh != null) window.clearInterval(timers.refresh);
  timers.drip = null;
  timers.refresh = null;
}

export const useAlpha = create<AlphaState>()((set, get) => ({
  weights: { ...DEFAULT_WEIGHTS },
  threshold: DEFAULT_THRESHOLD,
  running: true,
  hydrated: false,
  tokens: [],
  messages: [],
  queue: [],
  seen: [],
  tapeUpdatedAt: null,
  tapeError: null,
  inspectBusy: false,
  feedMs: 6500,
  setRunning: (running) => {
    set({ running });
    if (running) get().start();
    else get().stop();
  },
  setThreshold: (n) => set({ threshold: Math.min(95, Math.max(40, Math.round(n))) }),
  setWeight: (key, value) =>
    set({
      weights: { ...get().weights, [key]: Math.min(40, Math.max(0, Math.round(value))) },
    }),
  resetWeights: () => set({ weights: { ...DEFAULT_WEIGHTS }, threshold: DEFAULT_THRESHOLD }),
  setFeedMs: (n) => set({ feedMs: Math.min(20000, Math.max(2500, n)) }),
  ingestLaunch: (launch, origin) => {
    const state = get();
    if (state.seen.includes(launch.address)) {
      return state.tokens.find((t) => t.address === launch.address)?.id ?? null;
    }
    const channel = DEFAULT_CHANNELS[0];
    if (!channel) return null;
    const messageId = uid("msg");
    const tokenId = uid("tok");
    const text = formatLaunchTape(launch);
    const message: TelegramMessage = {
      id: messageId,
      channelId: channel.id,
      text,
      receivedAt: Date.now(),
      extractedAddresses: extractMints(text),
      tokenId,
    };
    const token: TokenRecord = {
      id: tokenId,
      address: launch.address,
      chain: "solana",
      name: launch.name,
      symbol: launch.symbol,
      status: "extracted",
      sourceChannelId: channel.id,
      sourceMessageId: messageId,
      extractedAt: Date.now(),
      updatedAt: Date.now(),
      rawSnippet: text,
      market: {
        priceUsd: null,
        liquidityUsd: launch.liquidityUsd,
        volume24h: launch.volume24h,
        volume1h: null,
        volume5m: null,
        mcapUsd: launch.mcapUsd,
        fdvUsd: launch.mcapUsd,
        buys24h: null,
        sells24h: null,
        buyers24h: null,
        sellers24h: null,
        buyers1h: null,
        buys1h: null,
        sells1h: null,
        pairAgeMin: launch.pairAgeMin,
        dexId: launch.dexId,
        pairAddress: launch.pairAddress,
        pairUrl: null,
        priceChange24h: null,
      },
      onchain: null,
      analysis: null,
      imageUrl: launch.imageUrl,
      origin,
    };
    set({
      seen: [launch.address, ...state.seen].slice(0, 400),
      queue: state.queue.filter((q) => q.address !== launch.address),
      messages: [message, ...state.messages].slice(0, MAX_MESSAGES),
      tokens: [token, ...state.tokens].slice(0, MAX_TOKENS),
    });
    void runPipeline(tokenId);
    return tokenId;
  },
  inspectAddress: (raw) => {
    const address = raw.trim();
    if (!isSolanaMint(address)) return null;
    const existing = get().tokens.find((t) => t.address === address);
    if (existing) return existing.id;
    return get().ingestLaunch(
      {
        address,
        name: `mint ${address.slice(0, 4)}`,
        symbol: "SCAN",
        dexId: null,
        pairAddress: null,
        imageUrl: null,
        liquidityUsd: null,
        mcapUsd: null,
        volume24h: null,
        pairAgeMin: null,
        createdAt: null,
      },
      "inspect",
    );
  },
  refreshTape: async () => {
    try {
      const res = await listLaunchTape();
      const seen = new Set(get().seen);
      const fresh = res.launches.filter((l) => !seen.has(l.address));
      set({
        queue: [...get().queue.filter((q) => !seen.has(q.address)), ...fresh].slice(0, 80),
        tapeUpdatedAt: res.fetchedAt,
        tapeError: null,
      });
      if (get().running) dripOnce();
    } catch (err) {
      set({
        tapeError: err instanceof Error ? err.message : "Launch tape unavailable",
      });
    }
  },
  start: () => {
    if (typeof window === "undefined") return;
    stopTimers();
    set({ running: true });
    void get().refreshTape();
    timers.refresh = window.setInterval(() => {
      void get().refreshTape();
    }, 45000);
    const pulse = () => {
      dripOnce();
      timers.drip = window.setTimeout(pulse, get().feedMs);
    };
    timers.drip = window.setTimeout(pulse, get().feedMs);
  },
  stop: () => {
    set({ running: false });
    stopTimers();
  },
  resetDemo: () => {
    stopTimers();
    set({
      tokens: [],
      messages: [],
      queue: [],
      seen: [],
      tapeError: null,
      running: true,
    });
    get().start();
  },
  markHydrated: () => set({ hydrated: true }),
}));

export function useFeedStats() {
  const tokens = useAlpha((s) => s.tokens);
  let passed = 0;
  let rejected = 0;
  let inFlight = 0;
  for (const t of tokens) {
    if (t.status === "passed") passed += 1;
    else if (t.status === "rejected") rejected += 1;
    else inFlight += 1;
  }
  return { extracted: tokens.length, passed, rejected, inFlight };
}
