import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as rollbackConfig, l as runBacktest, o as publishConfig, r as getScoringState } from "./api-Bxqb_Npe.mjs";
import { t as usePolling } from "./use-polling-BppY1xBR.mjs";
import { t as Badge } from "./badge-DOzO57gK.mjs";
import { t as Slider } from "./slider-CfD8wBHA.mjs";
import { t as Switch } from "./switch-CJhDOWH6.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as KILL_RULE_META, s as WEIGHT_META } from "./scoring-DilwZFet.mjs";
import { i as Button, r as Input } from "./router-CG39ymgt.mjs";
import { t as Label } from "./label-DCYNWq-3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scoring-DQl-UYd2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WEIGHT_KEYS = Object.keys(WEIGHT_META);
var KILL_KEYS = Object.keys(KILL_RULE_META);
function ScoringPage() {
	const { data, refresh } = usePolling(() => getScoringState(), 15e3);
	const versions = data?.versions ?? [];
	const active = versions.find((v) => v.is_active) ?? versions[0];
	const [weights, setWeights] = (0, import_react.useState)(null);
	const [threshold, setThreshold] = (0, import_react.useState)(null);
	const [killRules, setKillRules] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)("");
	const [publishing, setPublishing] = (0, import_react.useState)(false);
	const [backtest, setBacktest] = (0, import_react.useState)(null);
	const [backtesting, setBacktesting] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (active && !weights) {
			setWeights(active.weights);
			setThreshold(active.threshold);
			setKillRules(active.kill_rules);
		}
	}, [active, weights]);
	if (!weights || threshold == null || !killRules) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Loading scoring configuration…"
	});
	const total = WEIGHT_KEYS.reduce((sum, k) => sum + weights[k], 0);
	async function runWhatIf() {
		setBacktesting(true);
		setBacktest(null);
		try {
			const result = await runBacktest({ data: {
				weights,
				threshold,
				killRules,
				sampleSize: 500
			} });
			setBacktest(result);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Backtest failed");
		} finally {
			setBacktesting(false);
		}
	}
	async function publish() {
		setPublishing(true);
		try {
			const res = await publishConfig({ data: {
				weights,
				threshold,
				killRules,
				note: note || void 0
			} });
			toast.success(`Published as version ${res.version}`);
			setNote("");
			await refresh();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to publish");
		} finally {
			setPublishing(false);
		}
	}
	async function rollback(version) {
		if (!confirm(`Roll back to version ${version}? This makes it the active config immediately.`)) return;
		try {
			await rollbackConfig({ data: { version } });
			toast.success(`Rolled back to version ${version}`);
			setWeights(null);
			await refresh();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Rollback failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[1fr_320px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Weights"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `text-sm tabular-nums ${total > 100 ? "text-red-400" : "text-muted"}`,
							children: [total, "/100"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-4",
						children: WEIGHT_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: WEIGHT_META[key].label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-muted",
									children: weights[key]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: WEIGHT_META[key].blurb
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								className: "mt-2",
								min: 0,
								max: 40,
								step: 1,
								value: [weights[key]],
								onValueChange: ([v]) => setWeights((w) => w ? {
									...w,
									[key]: v
								} : w)
							})
						] }, key))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Pass threshold"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Minimum total score (of 100) to mark a token \"passed\" and alert."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								className: "flex-1",
								min: 40,
								max: 95,
								step: 1,
								value: [threshold],
								onValueChange: ([v]) => setThreshold(v)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10 text-right text-sm tabular-nums",
								children: threshold
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Kill rules"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Any one of these auto-rejects a token regardless of its score."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-4",
							children: KILL_KEYS.map((key) => {
								const meta = KILL_RULE_META[key];
								if (meta.kind === "bool") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: meta.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: meta.blurb
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: Boolean(killRules[key]),
										onCheckedChange: (v) => setKillRules((r) => r ? {
											...r,
											[key]: v
										} : r)
									})]
								}, key);
								const value = Number(killRules[key]);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: meta.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "tabular-nums text-muted",
											children: value
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: meta.blurb
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										className: "mt-2",
										min: meta.min,
										max: meta.max,
										step: meta.step,
										value: [value],
										onValueChange: ([v]) => setKillRules((r) => r ? {
											...r,
											[key]: v
										} : r)
									})
								] }, key);
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-medium",
								children: "What-if backtest"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: runWhatIf,
								disabled: backtesting,
								children: backtesting ? "Running…" : "Run against last 500 evaluations"
							})]
						}),
						backtest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Sampled",
									value: backtest.sampled
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Currently passed",
									value: backtest.originalPassed
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Would pass",
									value: backtest.candidatePassed,
									highlight: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Newly passing",
									value: backtest.onlyCandidatePassed
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Newly rejected",
									value: backtest.onlyOriginalPassed
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Avg 60m mult. (would-pass)",
									value: backtest.candidateAvgMultiple60m != null ? `${backtest.candidateAvgMultiple60m.toFixed(2)}×` : "—",
									highlight: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Avg 60m mult. (current)",
									value: backtest.originalAvgMultiple60m != null ? `${backtest.originalAvgMultiple60m.toFixed(2)}×` : "—"
								})
							]
						}),
						!backtest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Re-scores stored snapshots — no live refetching, no risk."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Publish note (optional)" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							value: note,
							onChange: (e) => setNote(e.target.value),
							placeholder: "Why this change"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-3",
							onClick: publish,
							disabled: publishing || total > 100,
							children: publishing ? "Publishing…" : "Publish new version"
						}),
						total > 100 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-red-400",
							children: "Weights sum to more than 100 — reduce before publishing."
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-medium",
				children: "Version history"
			}), versions.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-surface p-3 text-sm shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium",
							children: ["v", v.version]
						}), v.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: "bg-emerald-500/15 text-emerald-400",
							children: "active"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => rollback(v.version),
							children: "Roll back"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							"threshold ",
							v.threshold,
							" · ",
							new Date(v.created_at).toLocaleString()
						]
					}),
					v.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: v.note
					})
				]
			}, v.version))]
		})]
	});
}
function Stat({ label, value, highlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface-2 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-1 text-lg tabular-nums ${highlight ? "text-primary" : ""}`,
			children: value
		})]
	});
}
//#endregion
export { ScoringPage as component };
