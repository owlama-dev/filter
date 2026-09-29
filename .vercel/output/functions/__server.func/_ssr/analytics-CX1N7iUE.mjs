import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { m as formatUsd } from "./scoring-DilwZFet.mjs";
import { a as useAlpha, o as useFeedStats } from "./router-CG39ymgt.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analytics-CX1N7iUE.js
var import_jsx_runtime = require_jsx_runtime();
function AnalyticsPage() {
	const tokens = useAlpha((s) => s.tokens);
	const channels = useAlpha((s) => s.channels);
	const stats = useFeedStats();
	const threshold = useAlpha((s) => s.threshold);
	const byChannel = channels.map((ch) => {
		const rows = tokens.filter((t) => t.sourceChannelId === ch.id);
		return {
			label: ch.title,
			passed: rows.filter((t) => t.status === "passed").length,
			rejected: rows.filter((t) => t.status === "rejected").length
		};
	});
	const edges = [
		0,
		20,
		40,
		60,
		80,
		100
	];
	const hist = edges.slice(0, -1).map((start, i) => {
		const end = edges[i + 1] ?? 100;
		const last = i === edges.length - 2;
		const count = tokens.filter((t) => {
			const s = t.analysis?.total;
			if (s == null) return false;
			return s >= start && (last ? s <= end : s < end);
		}).length;
		return {
			name: `${start}–${end}`,
			count
		};
	});
	const withLp = tokens.filter((t) => t.market?.liquidityUsd);
	const avgLp = withLp.reduce((s, t) => s + (t.market?.liquidityUsd ?? 0), 0) / Math.max(1, withLp.length);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-muted uppercase",
					children: "Desk stats"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight sm:text-3xl",
					children: "Analytics"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: [
						"How the filter is behaving on this session. Threshold is ",
						threshold,
						"."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Extracted",
						value: String(stats.extracted)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Passed",
						value: String(stats.passed)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Rejected",
						value: String(stats.rejected)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Pass rate",
						value: stats.extracted ? `${Math.round(stats.passed / stats.extracted * 100)}%` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "In flight",
						value: String(stats.inFlight)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Avg LP on tape",
						value: formatUsd(avgLp)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-sm font-medium",
						children: "Passed vs rejected by desk"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: byChannel,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--color-border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										stroke: "var(--color-muted)",
										fontSize: 11
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										allowDecimals: false,
										stroke: "var(--color-muted)",
										fontSize: 11
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "var(--color-surface)",
										border: "1px solid var(--color-border)",
										fontSize: 12,
										color: "var(--color-fg)"
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "passed",
										fill: "var(--color-pass)",
										radius: [
											4,
											4,
											0,
											0
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "rejected",
										fill: "var(--color-fail)",
										radius: [
											4,
											4,
											0,
											0
										]
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-sm font-medium",
						children: "Score distribution"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: hist,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--color-border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										stroke: "var(--color-muted)",
										fontSize: 11
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										allowDecimals: false,
										stroke: "var(--color-muted)",
										fontSize: 11
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "var(--color-surface)",
										border: "1px solid var(--color-border)",
										fontSize: 12,
										color: "var(--color-fg)"
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "count",
										fill: "var(--color-primary)",
										radius: [
											4,
											4,
											0,
											0
										]
									})
								]
							})
						})
					})]
				})]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs tracking-wide text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-mono text-lg tabular",
			children: value
		})]
	});
}
//#endregion
export { AnalyticsPage as component };
