import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Slider } from "./slider-CfD8wBHA.mjs";
import { t as Switch } from "./switch-CJhDOWH6.mjs";
import { s as WEIGHT_META } from "./scoring-DilwZFet.mjs";
import { a as useAlpha, i as Button } from "./router-CG39ymgt.mjs";
import { t as Label } from "./label-DCYNWq-3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-CpifGlgr.js
var import_jsx_runtime = require_jsx_runtime();
var KEYS = Object.keys(WEIGHT_META);
function SettingsPage() {
	const weights = useAlpha((s) => s.weights);
	const threshold = useAlpha((s) => s.threshold);
	const running = useAlpha((s) => s.running);
	const feedMs = useAlpha((s) => s.feedMs);
	const setWeight = useAlpha((s) => s.setWeight);
	const setThreshold = useAlpha((s) => s.setThreshold);
	const setRunning = useAlpha((s) => s.setRunning);
	const setFeedMs = useAlpha((s) => s.setFeedMs);
	const resetWeights = useAlpha((s) => s.resetWeights);
	const resetDemo = useAlpha((s) => s.resetDemo);
	const sum = KEYS.reduce((s, k) => s + weights[k], 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-muted uppercase",
					children: "Filter"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight sm:text-3xl",
					children: "Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Weights are normalized to 100 at score time. Kill flags still override a high total."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-5 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: "Live ingest"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Pull new Solana pools onto the telegram tape."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: running,
							onCheckedChange: setRunning
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
						"Alert spacing · ",
						(feedMs / 1e3).toFixed(1),
						"s"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						className: "mt-3",
						min: 2500,
						max: 16e3,
						step: 500,
						value: [feedMs],
						onValueChange: (v) => setFeedMs(v[0] ?? feedMs)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-end justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: "Pass threshold"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-sm tabular",
							children: threshold
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						min: 40,
						max: 90,
						step: 1,
						value: [threshold],
						onValueChange: (v) => setThreshold(v[0] ?? threshold)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Tokens at or above this score, with no kill flag, are marked Potential Good."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: "Weights"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-xs text-muted",
							children: ["raw sum ", sum]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-5",
						children: KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: WEIGHT_META[key].label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: WEIGHT_META[key].blurb
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs tabular",
								children: weights[key]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 0,
							max: 30,
							step: 1,
							value: [weights[key]],
							onValueChange: (v) => setWeight(key, v[0] ?? 0)
						})] }, key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: resetWeights,
							children: "Reset weights"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: resetDemo,
							children: "Clear desk"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)] sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-sm font-medium text-fg",
					children: "What is real"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Market tape comes from the active source feed you configure for this desk. Mint and freeze authorities are read from Solana RPC when available. Holder maps use the largest-account call when the source exposes it. Deployer and same-block bundle checks stay modeled when the feed does not provide them, so the desk stays honest." })]
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
