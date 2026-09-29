import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as shortMint, m as formatUsd } from "./scoring-DilwZFet.mjs";
import { l as ExternalLink } from "../_libs/lucide-react.mjs";
import { a as useAlpha, i as Button } from "./router-CG39ymgt.mjs";
import { t as TokenCard } from "./token-card-H_bhPgaw.mjs";
import { t as tokenExternalLinks } from "./links-D1_gqbSh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/passed-BFLFId_5.js
var import_jsx_runtime = require_jsx_runtime();
function PassedPage() {
	const tokens = useAlpha((s) => s.tokens).filter((t) => t.status === "passed");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-muted uppercase",
				children: "Survivors"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight sm:text-3xl",
				children: "Passed tokens"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-sm text-muted",
				children: "High-potential names only. OpenSea is first in the link row so a phone can buy or sell without hunting a chart."
			})
		] }), tokens.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-surface px-5 py-16 text-center shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Nothing has cleared the filter yet. Leave Pulse running or inspect a mint."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-4 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline",
				children: "Back to pulse"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: tokens.map((token) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "grid gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)] lg:grid-cols-[minmax(0,280px)_1fr] lg:p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenCard, { token }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col justify-between gap-3 px-1 py-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-subtle",
								children: "Mint"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-fg",
								children: shortMint(token.address, 6, 6)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-subtle",
								children: "Score"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-pass tabular",
								children: Math.round(token.analysis?.total ?? 0)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-subtle",
								children: "LP"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "tabular",
								children: formatUsd(token.market?.liquidityUsd)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-subtle",
								children: "24h vol"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "tabular",
								children: formatUsd(token.market?.volume24h)
							})] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: tokenExternalLinks(token.address).map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: link.id === "opensea" ? "default" : "outline",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: link.href,
								target: "_blank",
								rel: "noreferrer",
								children: [link.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
							})
						}, link.id))
					})]
				})]
			}, token.id))
		})]
	});
}
//#endregion
export { PassedPage as component };
