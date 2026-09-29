import { r as createServerFn } from "./ssr.mjs";
import { gn as object, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { l as emptyMetrics } from "./scoring-DilwZFet.mjs";
import { n as isSolanaMint } from "./extract-CKhKsRsx.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-BH_pxbjt.js
var RPCS = ["https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"];
async function fetchJson(url, init, timeoutMs = 8e3) {
	const res = await fetch(url, {
		...init,
		signal: AbortSignal.timeout(timeoutMs),
		headers: {
			accept: "application/json",
			...init?.headers ?? {}
		}
	});
	if (!res.ok) throw new Error(`${url} ${res.status}`);
	return await res.json();
}
function ageMin(createdAt) {
	if (createdAt == null) return null;
	const ts = typeof createdAt === "number" ? createdAt : Date.parse(createdAt);
	if (!Number.isFinite(ts)) return null;
	return Math.max(0, (Date.now() - ts) / 6e4);
}
function num(v) {
	if (v == null || v === "") return null;
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : null;
}
var listLaunchTape_createServerFn_handler = createServerRpc({
	id: "a6cb405f7241a0b70e40b0d707fe81c0931c5dc6ccadc617e3e7e6e00b6136c1",
	name: "listLaunchTape",
	filename: "src/lib/alpha/api.ts"
}, (opts) => listLaunchTape.__executeServer(opts));
var listLaunchTape = createServerFn({ method: "GET" }).handler(listLaunchTape_createServerFn_handler, async () => {
	return {
		launches: [],
		fetchedAt: Date.now(),
		source: "source-driven-empty"
	};
});
function pickPair(address, pairs) {
	const sol = (pairs ?? []).filter((p) => p.chainId === "solana");
	const ranked = (sol.length ? sol : pairs ?? []).slice().sort((a, b) => {
		const al = a.liquidity?.usd ?? 0;
		return (b.liquidity?.usd ?? 0) - al;
	});
	return ranked.find((p) => p.baseToken.address === address || p.quoteToken.address === address) ?? ranked[0] ?? null;
}
function metricsFromPair(address, pair) {
	const m = emptyMetrics();
	if (!pair) return m;
	const baseIsMint = pair.baseToken.address === address;
	m.priceUsd = num(pair.priceUsd);
	m.liquidityUsd = pair.liquidity?.usd ?? null;
	m.volume24h = pair.volume?.h24 ?? null;
	m.volume1h = pair.volume?.h1 ?? null;
	m.volume5m = pair.volume?.m5 ?? null;
	m.mcapUsd = pair.marketCap ?? pair.fdv ?? null;
	m.fdvUsd = pair.fdv ?? null;
	m.buys24h = pair.txns?.h24?.buys ?? null;
	m.sells24h = pair.txns?.h24?.sells ?? null;
	m.buys1h = pair.txns?.h1?.buys ?? null;
	m.sells1h = pair.txns?.h1?.sells ?? null;
	m.pairAgeMin = ageMin(pair.pairCreatedAt);
	m.dexId = pair.dexId ?? null;
	m.pairAddress = pair.pairAddress ?? null;
	m.pairUrl = pair.url ?? null;
	m.priceChange24h = pair.priceChange?.h24 ?? null;
	if (!baseIsMint && pair.quoteToken.address === address) m.dexId = pair.dexId;
	return m;
}
async function rpc(method, params) {
	let lastErr;
	for (const url of RPCS) try {
		const json = await fetchJson(url, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 1,
				method,
				params
			})
		}, 7e3);
		if (json.error) throw new Error(json.error.message ?? "rpc error");
		return json.result?.value;
	} catch (err) {
		lastErr = err;
	}
	throw lastErr instanceof Error ? lastErr : /* @__PURE__ */ new Error("rpc failed");
}
async function readMint(address) {
	const facts = {
		mintAuthority: void 0,
		freezeAuthority: void 0,
		decimals: null,
		supply: null,
		tokenProgram: null,
		topHolders: [],
		holderCoveragePct: null,
		queriedAt: null
	};
	try {
		const value = await rpc("getAccountInfo", [address, { encoding: "jsonParsed" }]);
		if (!value) return facts;
		const info = value.data?.parsed?.info;
		facts.tokenProgram = value.owner ?? null;
		facts.mintAuthority = info?.mintAuthority ?? null;
		facts.freezeAuthority = info?.freezeAuthority ?? null;
		facts.decimals = info?.decimals ?? null;
		facts.supply = info?.supply ?? null;
		facts.queriedAt = Date.now();
	} catch {
		return facts;
	}
	try {
		const largest = await rpc("getTokenLargestAccounts", [address]);
		const supply = facts.supply ? Number(facts.supply) : 0;
		const decimals = facts.decimals ?? 0;
		const rows = [];
		let covered = 0;
		for (const row of largest ?? []) {
			const ui = row.uiAmount ?? (row.amount ? Number(row.amount) / 10 ** decimals : 0);
			const raw = row.amount ? Number(row.amount) : ui * 10 ** decimals;
			const pct = supply > 0 ? raw / supply * 100 : 0;
			covered += pct;
			rows.push({
				address: row.address ?? "",
				pct,
				uiAmount: ui
			});
		}
		facts.topHolders = rows;
		facts.holderCoveragePct = covered;
	} catch {}
	return facts;
}
var inspectMint_createServerFn_handler = createServerRpc({
	id: "39ad0ea222870b5192e950942c075ffc4bd15de0808c6bf193aa84424ce5d91a",
	name: "inspectMint",
	filename: "src/lib/alpha/api.ts"
}, (opts) => inspectMint.__executeServer(opts));
var inspectMint = createServerFn({ method: "POST" }).validator(object({ address: string().min(32).max(44) })).handler(inspectMint_createServerFn_handler, async ({ data }) => {
	const address = data.address.trim();
	if (!isSolanaMint(address)) throw new Error("Not a Solana mint");
	const [dex, onchain] = await Promise.allSettled([fetchJson(`https://api.dexscreener.com/latest/dex/tokens/${address}`), readMint(address)]);
	const pair = pickPair(address, dex.status === "fulfilled" ? dex.value.pairs : []);
	const market = metricsFromPair(address, pair);
	const base = pair?.baseToken.address === address ? pair.baseToken : pair?.quoteToken.address === address ? pair.quoteToken : pair?.baseToken;
	return {
		address,
		name: base?.name ?? shortUnknown(address),
		symbol: (base?.symbol ?? "???").slice(0, 14),
		market,
		onchain: onchain.status === "fulfilled" ? onchain.value : {
			mintAuthority: void 0,
			freezeAuthority: void 0,
			decimals: null,
			supply: null,
			tokenProgram: null,
			topHolders: [],
			holderCoveragePct: null,
			queriedAt: null
		},
		imageUrl: null
	};
});
function shortUnknown(address) {
	return `token ${address.slice(0, 4)}`;
}
//#endregion
export { inspectMint_createServerFn_handler, listLaunchTape_createServerFn_handler };
