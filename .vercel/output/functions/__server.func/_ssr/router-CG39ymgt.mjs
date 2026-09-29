import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { c as require_react, n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as useRouter, S as useNavigate, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { bn as union, gn as object, hn as number, pn as literal, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { c as buildChecklist, g as scoreToken, n as DEFAULT_CHANNELS, r as DEFAULT_WEIGHTS, t as APP_NAME$1 } from "./scoring-DilwZFet.mjs";
import { n as isSolanaMint, r as normalizeHandle, t as extractMints } from "./extract-CKhKsRsx.mjs";
import { a as Settings2, c as Menu, d as CircleCheck, h as Activity, i as ShieldCheck, n as TriangleAlert, o as Search, p as ChartColumn, r as SlidersHorizontal, s as Radio, t as X } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as Provider } from "../_libs/radix-ui__react-tooltip.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createSsrRpc-B2Izd0c7.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-CG39ymgt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var listLaunchTape = createServerFn({ method: "GET" }).handler(createSsrRpc("a6cb405f7241a0b70e40b0d707fe81c0931c5dc6ccadc617e3e7e6e00b6136c1"));
var inspectMint = createServerFn({ method: "POST" }).validator(object({ address: string().min(32).max(44) })).handler(createSsrRpc("39ad0ea222870b5192e950942c075ffc4bd15de0808c6bf193aa84424ce5d91a"));
var MAX_TOKENS = 80;
var MAX_MESSAGES = 60;
var timers = {
	drip: null,
	refresh: null,
	ticks: /* @__PURE__ */ new Set()
};
function uid(prefix) {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}
function pickChannel(channels) {
	const live = channels.filter((c) => c.enabled);
	if (!live.length) return null;
	return live[Math.floor(Math.random() * live.length)] ?? live[0] ?? null;
}
function composeMessage(channel, launch) {
	const lp = launch.liquidityUsd != null ? `LP $${Math.round(launch.liquidityUsd).toLocaleString("en-US")}` : "LP n/a";
	const cap = launch.mcapUsd != null ? `MC $${Math.round(launch.mcapUsd).toLocaleString("en-US")}` : "MC n/a";
	const age = launch.pairAgeMin == null ? "age n/a" : launch.pairAgeMin < 1 ? "fresh pool" : `${Math.round(launch.pairAgeMin)}m on tape`;
	const dex = launch.dexId ?? "unknown dex";
	return [
		`${channel.title.toUpperCase()}`,
		`$${launch.symbol}  ${launch.name}`,
		`mint  ${launch.address}`,
		`${dex} · ${age} · ${lp} · ${cap}`
	].join("\n");
}
function delay(ms) {
	return new Promise((resolve) => {
		const t = window.setTimeout(() => {
			timers.ticks.delete(t);
			resolve();
		}, ms);
		timers.ticks.add(t);
	});
}
function betterName(inspected, fallback) {
	if (!inspected || inspected === "???" || inspected.startsWith("token ")) return fallback;
	return inspected;
}
function patchToken(id, patch) {
	useAlpha.setState((s) => ({ tokens: s.tokens.map((t) => t.id === id ? {
		...t,
		...patch,
		updatedAt: Date.now()
	} : t) }));
}
async function runPipeline(id) {
	const snap = () => useAlpha.getState().tokens.find((t) => t.id === id);
	if (!snap()) return;
	patchToken(id, { status: "extracted" });
	await delay(700 + Math.random() * 500);
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
			checklist: buildChecklist({
				...afterWait,
				status: "enriching"
			})
		}
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
			status: "analyzing"
		});
		const mid = snap();
		if (mid) patchToken(id, { analysis: {
			parts: [],
			total: 0,
			threshold: useAlpha.getState().threshold,
			passed: false,
			killFlags: [],
			checklist: buildChecklist({
				...mid,
				status: "analyzing"
			})
		} });
	} catch (err) {
		if (!snap()) return;
		patchToken(id, {
			status: "analyzing",
			error: err instanceof Error ? err.message : "Enrichment failed"
		});
	}
	await delay(1100 + Math.random() * 700);
	const current = snap();
	if (!current) return;
	const { weights, threshold } = useAlpha.getState();
	const analysis = scoreToken(current, weights, threshold);
	const next = analysis.passed ? "passed" : "rejected";
	patchToken(id, {
		analysis,
		status: "scored"
	});
	await delay(420);
	patchToken(id, { status: next });
}
function dripOnce() {
	const state = useAlpha.getState();
	if (!state.running) return;
	if (!state.channels.filter((c) => c.enabled).length) return;
	const next = state.queue.find((q) => !state.seen.includes(q.address));
	if (!next) {
		state.refreshTape();
		return;
	}
	state.ingestLaunch(next, "tape");
}
function stopTimers() {
	if (typeof window === "undefined") return;
	if (timers.drip != null) window.clearTimeout(timers.drip);
	if (timers.refresh != null) window.clearInterval(timers.refresh);
	for (const t of timers.ticks) window.clearTimeout(t);
	timers.drip = null;
	timers.refresh = null;
	timers.ticks.clear();
}
var useAlpha = create()((set, get) => ({
	channels: DEFAULT_CHANNELS,
	weights: { ...DEFAULT_WEIGHTS },
	threshold: 72,
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
	setWeight: (key, value) => set({ weights: {
		...get().weights,
		[key]: Math.min(40, Math.max(0, Math.round(value)))
	} }),
	resetWeights: () => set({
		weights: { ...DEFAULT_WEIGHTS },
		threshold: 72
	}),
	setFeedMs: (n) => set({ feedMs: Math.min(2e4, Math.max(2500, n)) }),
	addChannel: (input) => {
		const handle = normalizeHandle(input.handle);
		if (!handle) return;
		set({ channels: [{
			id: uid("ch"),
			handle,
			title: input.title.trim() || handle,
			kind: input.kind,
			enabled: true
		}, ...get().channels] });
	},
	toggleChannel: (id) => set({ channels: get().channels.map((c) => c.id === id ? {
		...c,
		enabled: !c.enabled
	} : c) }),
	removeChannel: (id) => set({ channels: get().channels.filter((c) => c.id !== id) }),
	ingestLaunch: (launch, origin) => {
		const state = get();
		if (state.seen.includes(launch.address)) return state.tokens.find((t) => t.address === launch.address)?.id ?? null;
		const channel = pickChannel(state.channels) ?? state.channels[0];
		if (!channel) return null;
		const messageId = uid("msg");
		const tokenId = uid("tok");
		const text = composeMessage(channel, launch);
		const message = {
			id: messageId,
			channelId: channel.id,
			text,
			receivedAt: Date.now(),
			extractedAddresses: extractMints(text),
			tokenId
		};
		const token = {
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
				priceChange24h: null
			},
			onchain: null,
			analysis: null,
			imageUrl: launch.imageUrl,
			origin
		};
		set({
			seen: [launch.address, ...state.seen].slice(0, 400),
			queue: state.queue.filter((q) => q.address !== launch.address),
			messages: [message, ...state.messages].slice(0, MAX_MESSAGES),
			tokens: [token, ...state.tokens].slice(0, MAX_TOKENS)
		});
		runPipeline(tokenId);
		return tokenId;
	},
	inspectAddress: (raw) => {
		const address = raw.trim();
		if (!isSolanaMint(address)) return null;
		const existing = get().tokens.find((t) => t.address === address);
		if (existing) return existing.id;
		return get().ingestLaunch({
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
			createdAt: null
		}, "inspect");
	},
	refreshTape: async () => {
		try {
			const res = await listLaunchTape();
			const seen = new Set(get().seen);
			const fresh = res.launches.filter((l) => !seen.has(l.address));
			set({
				queue: [...get().queue.filter((q) => !seen.has(q.address)), ...fresh].slice(0, 80),
				tapeUpdatedAt: res.fetchedAt,
				tapeError: res.launches.length === 0 ? "No live source configured yet. Add a real source or enable one from the Sources panel." : null
			});
		} catch (err) {
			set({ tapeError: err instanceof Error ? err.message : "Launch tape unavailable" });
		}
	},
	start: () => {
		if (typeof window === "undefined") return;
		stopTimers();
		set({ running: true });
		get().refreshTape();
		timers.refresh = window.setInterval(() => {
			get().refreshTape();
		}, 45e3);
		const pulse = () => {
			dripOnce();
			timers.drip = window.setTimeout(pulse, get().feedMs + Math.random() * 1400);
		};
		timers.drip = window.setTimeout(pulse, 900);
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
			running: true
		});
		get().start();
	},
	markHydrated: () => set({ hydrated: true })
}));
function useFeedStats() {
	const tokens = useAlpha((s) => s.tokens);
	let passed = 0;
	let rejected = 0;
	let inFlight = 0;
	for (const t of tokens) if (t.status === "passed") passed += 1;
	else if (t.status === "rejected") rejected += 1;
	else inFlight += 1;
	return {
		extracted: tokens.length,
		passed,
		rejected,
		inFlight
	};
}
function AlphaProvider({ children }) {
	(0, import_react.useEffect)(() => {
		useAlpha.getState().markHydrated();
		useAlpha.getState().start();
		return () => useAlpha.getState().stop();
	}, []);
	return children;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-fail/90 text-fg hover:bg-fail",
			outline: "border border-border bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-surface-2",
			secondary: "bg-secondary text-secondary-foreground hover:bg-surface-2",
			ghost: "text-fg hover:bg-surface-2",
			link: "text-fg underline-offset-4 hover:underline"
		},
		size: {
			default: "h-10 min-h-10 px-4",
			sm: "h-9 min-h-9 rounded-md px-3 text-xs",
			lg: "h-11 min-h-11 rounded-lg px-5",
			icon: "size-10 min-h-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Sheet = Dialog;
function SheetContent({ className, side = "right", children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 bg-surface p-5 shadow-[var(--shadow-border)]", side === "right" && "inset-y-0 right-0 h-full w-[min(100%,22rem)]", side === "left" && "inset-y-0 left-0 h-full w-[min(100%,22rem)]", side === "bottom" && "inset-x-0 bottom-0 rounded-t-2xl", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 size-10 rounded-md text-muted hover:bg-surface-2 hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mx-auto size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm text-fg shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:shadow-[var(--shadow-border-hover)] disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Input.displayName = "Input";
function InspectBar() {
	const [value, setValue] = (0, import_react.useState)("");
	const inspectAddress = useAlpha((s) => s.inspectAddress);
	const inspectBusy = useAlpha((s) => s.inspectBusy);
	const navigate = useNavigate();
	function onSubmit(e) {
		e.preventDefault();
		const address = value.trim();
		if (!isSolanaMint(address)) {
			toast("Paste a Solana mint (32–44 base58).");
			return;
		}
		if (!inspectAddress(address)) {
			toast("Could not queue that mint.");
			return;
		}
		setValue("");
		navigate({
			to: "/token/$address",
			params: { address }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "flex gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value,
				onChange: (e) => setValue(e.target.value),
				placeholder: "Paste a Solana contract to run the filter",
				className: "pl-10 font-mono text-xs sm:text-sm",
				autoComplete: "off",
				spellCheck: false
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			disabled: inspectBusy,
			className: "min-h-11 px-4",
			children: inspectBusy ? "Reading" : "Inspect"
		})]
	});
}
var NAV = [
	{
		to: "/",
		label: "Pulse",
		icon: Activity
	},
	{
		to: "/passed",
		label: "Passed",
		icon: CircleCheck
	},
	{
		to: "/admin/sources",
		label: "Sources",
		icon: Radio
	},
	{
		to: "/analytics",
		label: "Analytics",
		icon: ChartColumn
	},
	{
		to: "/settings",
		label: "Settings",
		icon: SlidersHorizontal
	},
	{
		to: "/admin",
		label: "Admin",
		icon: ShieldCheck
	}
];
function FilterMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className,
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M4 5h16l-6.5 8.2V19l-3 1.5v-7.3L4 5Z",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.6",
			strokeLinejoin: "round"
		})
	});
}
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const stats = useFeedStats();
	const running = useAlpha((s) => s.running);
	const setRunning = useAlpha((s) => s.setRunning);
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex min-h-11 items-center gap-2.5 pr-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-8 items-center justify-center rounded-lg bg-surface-2 text-fg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterMark, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex flex-col leading-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-semibold tracking-tight",
									children: APP_NAME$1
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden text-xs text-muted sm:block",
									children: "Solana call filter"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "ml-4 hidden items-center gap-1 md:flex",
							children: NAV.map((item) => {
								const active = pathname === item.to;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm transition-colors duration-150", active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-3.5" }), item.label]
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden items-center gap-3 pr-2 font-mono text-xs text-muted sm:flex",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "tabular",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-subtle",
													children: "in"
												}),
												" ",
												stats.extracted
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-pass tabular",
											children: [stats.passed, " pass"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-fail tabular",
											children: [stats.rejected, " out"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: running ? "outline" : "default",
									size: "sm",
									onClick: () => setRunning(!running),
									className: "min-h-11",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", running ? "bg-pass" : "bg-muted") }), running ? "Live" : "Paused"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "md:hidden",
									onClick: () => setOpen(true),
									"aria-label": "Open menu",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto w-full max-w-[1440px] px-4 pb-3 sm:px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectBar, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					side: "right",
					className: "flex flex-col gap-2 pt-12",
					children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						onClick: () => setOpen(false),
						className: cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm", pathname === item.to ? "bg-surface-2" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" }), item.label]
					}, item.to))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 md:pb-8",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 backdrop-blur-sm md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-5",
					children: NAV.map((item) => {
						const active = pathname === item.to;
						const Icon = item.to === "/settings" ? Settings2 : item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-xs tracking-wide uppercase", active ? "text-fg" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
						}, item.to);
					})
				})
			})
		]
	});
}
function Toaster$1() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme: "dark",
		position: "bottom-right",
		toastOptions: { classNames: { toast: "bg-surface text-fg border border-border shadow-[var(--shadow-border)]" } }
	});
}
var TooltipProvider = Provider;
var styles_default = "/assets/styles-jSceoviC.css";
var APP_NAME = "AlphaFilter";
var Route$13 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0b0b0c"
			},
			{
				name: "description",
				content: "Second-layer filter for Solana telegram calls — extract, enrich, score, keep the rest."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: Root
});
function Root() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
				delayDuration: 200,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlphaProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})] })
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$12 = () => import("./routes-nlqT8JMV.mjs");
var Route$12 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./admin-CAwN0tXq.mjs");
var Route$11 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./analytics-CX1N7iUE.mjs");
var Route$10 = createFileRoute("/analytics")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./channels-CAutkpcx.mjs");
var Route$9 = createFileRoute("/channels")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./login-BDnDrue2.mjs");
var Route$8 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
/**
* Email/password sign-in for self-hosted deployments that don't have the
* Grok auth broker's OAuth secrets (GROK_AUTH_*) injected. Enabled via the
* `emailAndPasswordEnabled` flag in `src/lib/auth/email-password.ts`.
* The first account whose email matches OWNER_EMAIL becomes the admin owner
* automatically on its first visit to /admin — see guard.server.ts.
*/
var $$splitComponentImporter$7 = () => import("./passed-BFLFId_5.mjs");
var Route$7 = createFileRoute("/passed")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./settings-CpifGlgr.mjs");
var Route$6 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./admin-BE-UJhcF.mjs");
var Route$5 = createFileRoute("/admin/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./audit-CRNT2r4g.mjs");
var Route$4 = createFileRoute("/admin/audit")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./members-D_GcQlyC.mjs");
var Route$3 = createFileRoute("/admin/members")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./scoring-DQl-UYd2.mjs");
var Route$2 = createFileRoute("/admin/scoring")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./sources-C2Nk3NkS.mjs");
var Route$1 = createFileRoute("/admin/sources")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./token._address-CwJKYoS8.mjs");
var Route = createFileRoute("/token/$address")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$13
});
var AdminRoute = Route$11.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$13
});
var AnalyticsRoute = Route$10.update({
	id: "/analytics",
	path: "/analytics",
	getParentRoute: () => Route$13
});
var ChannelsRoute = Route$9.update({
	id: "/channels",
	path: "/channels",
	getParentRoute: () => Route$13
});
var LoginRoute = Route$8.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$13
});
var PassedRoute = Route$7.update({
	id: "/passed",
	path: "/passed",
	getParentRoute: () => Route$13
});
var SettingsRoute = Route$6.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$13
});
var AdminIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminRoute
});
var AdminAuditRoute = Route$4.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => AdminRoute
});
var AdminMembersRoute = Route$3.update({
	id: "/members",
	path: "/members",
	getParentRoute: () => AdminRoute
});
var AdminScoringRoute = Route$2.update({
	id: "/scoring",
	path: "/scoring",
	getParentRoute: () => AdminRoute
});
var AdminSourcesRoute = Route$1.update({
	id: "/sources",
	path: "/sources",
	getParentRoute: () => AdminRoute
});
var TokenAddressRoute = Route.update({
	id: "/token/$address",
	path: "/token/$address",
	getParentRoute: () => Route$13
});
var AdminRouteChildren = {
	AdminAuditRoute,
	AdminMembersRoute,
	AdminScoringRoute,
	AdminSourcesRoute,
	AdminIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRoute._addFileChildren(AdminRouteChildren),
	AnalyticsRoute,
	ChannelsRoute,
	LoginRoute,
	PassedRoute,
	SettingsRoute,
	TokenAddressRoute
};
var routeTree = Route$13._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { useAlpha as a, Button as i, Route as n, useFeedStats as o, Input as r, createSsrRpc as s, router_exports as t };
