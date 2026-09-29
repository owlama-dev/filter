import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { d as formatClock } from "./scoring-DilwZFet.mjs";
import { a as useAlpha, o as useFeedStats } from "./router-CG39ymgt.mjs";
import { t as TokenCard } from "./token-card-H_bhPgaw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-nlqT8JMV.js
var import_jsx_runtime = require_jsx_runtime();
var COLUMNS = [
	{
		key: "extracted",
		title: "Extracted",
		match: (t) => t.status === "extracted",
		hint: "CA pulled from the alert"
	},
	{
		key: "enriching",
		title: "Enriching",
		match: (t) => t.status === "enriching",
		hint: "DexScreener + mint account"
	},
	{
		key: "analyzing",
		title: "Analyzing",
		match: (t) => t.status === "analyzing" || t.status === "scored",
		hint: "Holders, LP, tape, score"
	},
	{
		key: "passed",
		title: "Passed",
		match: (t) => t.status === "passed",
		hint: "Cleared threshold, no kill flags"
	},
	{
		key: "rejected",
		title: "Rejected",
		match: (t) => t.status === "rejected",
		hint: "Below threshold or hard fail"
	}
];
function PipelineBoard({ tokens }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5",
		children: COLUMNS.map((col) => {
			const rows = tokens.filter(col.match).slice(0, 12);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex min-h-[220px] flex-col rounded-2xl bg-surface/60 p-2 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-baseline justify-between px-2 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-medium tracking-wide uppercase",
						children: col.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: col.hint
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs tabular text-muted",
						children: rows.length
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex flex-col gap-2", col.key === "rejected" && "opacity-95"),
					children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 py-6 text-center text-xs text-subtle",
						children: "Empty"
					}), rows.map((token) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenCard, {
						token,
						dense: col.key !== "passed"
					}, token.id))]
				})]
			}, col.key);
		})
	});
}
function TelegramFeed() {
	const messages = useAlpha((s) => s.messages);
	const channels = useAlpha((s) => s.channels);
	const tokens = useAlpha((s) => s.tokens);
	const tapeError = useAlpha((s) => s.tapeError);
	const running = useAlpha((s) => s.running);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex h-full min-h-0 flex-col rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-3 flex items-baseline justify-between gap-3 px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium tracking-tight",
					children: "Telegram tape"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Public launch flow, formatted as desk alerts."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-mono text-[11px] uppercase", running ? "text-pass" : "text-muted"),
					children: running ? "listening" : "paused"
				})]
			}),
			tapeError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 rounded-lg bg-fail/10 px-3 py-2 text-xs text-fail",
				children: tapeError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1",
				children: [messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 py-8 text-center text-sm text-muted",
					children: "Waiting for the first alert. New Solana pools are pulled onto this tape in real time."
				}), messages.map((msg) => {
					const channel = channels.find((c) => c.id === msg.channelId);
					const token = tokens.find((t) => t.id === msg.tokenId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl bg-bg p-3 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center justify-between gap-2 text-[11px] text-subtle",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-medium tracking-wide text-muted uppercase",
									children: channel?.title ?? msg.channelId
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
									className: "font-mono tabular",
									children: formatClock(msg.receivedAt)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "font-mono text-[11px] leading-relaxed text-fg whitespace-pre-wrap",
								children: msg.text
							}),
							token && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/token/$address",
								params: { address: token.address },
								className: "mt-2 inline-flex min-h-9 items-center text-[11px] text-muted underline-offset-4 hover:text-fg hover:underline",
								children: ["Follow in pipeline → ", token.status]
							})
						]
					}, msg.id);
				})]
			})
		]
	});
}
function Pulse() {
	const tokens = useAlpha((s) => s.tokens);
	const threshold = useAlpha((s) => s.threshold);
	const queue = useAlpha((s) => s.queue);
	const stats = useFeedStats();
	const tapeUpdatedAt = useAlpha((s) => s.tapeUpdatedAt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-muted uppercase",
					children: "Live desk"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight sm:text-3xl",
					children: "Pulse"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: [
						"Alerts land, the mint is extracted, then the second layer reads the chain and the tape. Only names that clear ",
						threshold,
						" without a kill flag survive."
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs sm:text-right",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: "In flight"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular text-fg",
						children: stats.inFlight
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: "Queue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular text-fg",
						children: queue.length
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: "Pass rate"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular text-fg",
						children: stats.extracted ? `${Math.round(stats.passed / stats.extracted * 100)}%` : "—"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: "Tape"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular text-fg",
						children: tapeUpdatedAt ? new Date(tapeUpdatedAt).toLocaleTimeString("en-GB", {
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit"
						}) : "warming"
					})] })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-[min(52dvh,420px)] lg:h-[calc(100dvh-13rem)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TelegramFeed, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineBoard, { tokens })]
		})]
	});
}
//#endregion
export { Pulse as component };
