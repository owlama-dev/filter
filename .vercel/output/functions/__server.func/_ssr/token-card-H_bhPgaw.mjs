import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { _ as shortMint, h as relativeTime, m as formatUsd, u as formatAge } from "./scoring-DilwZFet.mjs";
import { a as useAlpha } from "./router-CG39ymgt.mjs";
import { n as StatusBadge, t as ScoreMark } from "./status-badge-BjmMx2N-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/token-card-H_bhPgaw.js
var import_jsx_runtime = require_jsx_runtime();
function TokenCard({ token, dense = false }) {
	const channel = useAlpha((s) => s.channels.find((c) => c.id === token.sourceChannelId));
	const passed = token.status === "passed";
	const rejected = token.status === "rejected";
	const scored = token.status === "passed" || token.status === "rejected" || token.status === "scored";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/token/$address",
		params: { address: token.address },
		className: cn("block rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 ease-out hover:shadow-[var(--shadow-border-hover)]", passed && "shadow-[0_0_0_1px_rgb(143_175_136/0.35)]", rejected && "opacity-90"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreMark, {
					value: scored ? token.analysis?.total : null,
					passed,
					size: dense ? 44 : 52
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-sm font-medium tracking-tight",
								children: ["$", token.symbol]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: token.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: token.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-xs text-subtle",
							children: shortMint(token.address, 6, 6)
						})
					]
				})]
			}),
			!dense && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 font-mono text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-subtle",
						children: "LP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "tabular text-fg",
						children: formatUsd(token.market?.liquidityUsd)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-subtle",
						children: "MC"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "tabular text-fg",
						children: formatUsd(token.market?.mcapUsd)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-subtle",
						children: "Age"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "tabular text-fg",
						children: formatAge(token.market?.pairAgeMin)
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center justify-between text-xs text-subtle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: channel?.title ?? "Unknown desk"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono tabular",
					children: relativeTime(token.extractedAt)
				})]
			})
		]
	});
}
//#endregion
export { TokenCard as t };
