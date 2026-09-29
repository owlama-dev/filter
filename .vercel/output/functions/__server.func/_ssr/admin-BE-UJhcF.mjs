import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as setEngine, t as adminOverview } from "./api-Bxqb_Npe.mjs";
import { t as usePolling } from "./use-polling-BppY1xBR.mjs";
import { t as Badge } from "./badge-DOzO57gK.mjs";
import { t as Slider } from "./slider-CfD8wBHA.mjs";
import { t as Switch } from "./switch-CJhDOWH6.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BE-UJhcF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	queued: "Queued",
	enriching: "Enriching",
	scored: "Scored",
	passed: "Passed",
	rejected: "Rejected",
	error: "Errored"
};
function DashboardPage() {
	const { data, error, refresh } = usePolling(() => adminOverview(), 4e3);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const engine = data?.engine;
	const [draft, setDraft] = (0, import_react.useState)(null);
	const live = draft ?? engine ?? {
		paused: false,
		safe_mode: false,
		max_inflight: 8
	};
	async function save(next) {
		setDraft(next);
		setSaving(true);
		try {
			await setEngine({ data: next });
			toast.success(next.paused ? "Engine paused" : "Engine settings saved");
			await refresh();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to save");
		} finally {
			setSaving(false);
			setDraft(null);
		}
	}
	const byStatus = new Map((data?.byStatus)?.map((r) => [r.status, r.n]));
	const sources = data?.sources ?? [];
	const providers = data?.providers ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-red-500",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium",
						children: "Engine"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Kill switch and pace, live for every worker instance within ~3s."
					})] }), live.paused && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: "bg-red-500/15 text-red-400",
						children: "Paused"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-4 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								children: "Pause ingestion & scoring"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: live.paused,
								disabled: saving,
								onCheckedChange: (v) => save({
									...live,
									paused: v
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								children: "Safe mode (score, no alerts)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: live.safe_mode,
								disabled: saving,
								onCheckedChange: (v) => save({
									...live,
									safe_mode: v
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-surface-2 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Max concurrent evaluations" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-muted",
									children: live.max_inflight
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								className: "mt-2",
								min: 1,
								max: 32,
								step: 1,
								value: [live.max_inflight],
								disabled: saving,
								onValueChange: ([v]) => setDraft({
									...live,
									max_inflight: v
								}),
								onValueCommit: ([v]) => save({
									...live,
									max_inflight: v
								})
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: Object.entries(STATUS_LABEL).map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted uppercase tracking-wide",
						children: [label, " (24h)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-2xl font-medium tabular-nums",
						children: byStatus.get(key) ?? 0
					})]
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium",
						children: "Queue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-6 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "Ready"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xl tabular-nums",
								children: data?.queue?.ready ?? "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "Failed (given up)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xl tabular-nums",
								children: data?.queue?.failed ?? "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "Sources enabled"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xl tabular-nums",
								children: [
									sources.filter((s) => s.enabled).length,
									"/",
									sources.length
								]
							})] })
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium",
						children: "Provider health"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [providers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No provider calls recorded yet."
						}), providers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: p.provider
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 text-xs text-muted",
								children: [
									p.p50_ms != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [p.p50_ms, "ms p50"] }),
									p.error_rate != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [(p.error_rate * 100).toFixed(0), "% err"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: p.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400",
										children: p.ok ? "ok" : "degraded"
									})
								]
							})]
						}, p.provider))]
					})]
				})]
			})
		]
	});
}
//#endregion
export { DashboardPage as component };
