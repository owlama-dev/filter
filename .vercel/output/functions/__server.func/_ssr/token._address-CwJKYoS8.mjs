import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Badge } from "./badge-DOzO57gK.mjs";
import { _ as shortMint, f as formatPct, m as formatUsd, u as formatAge } from "./scoring-DilwZFet.mjs";
import { f as Check, l as ExternalLink, m as ArrowLeft, u as Circle } from "../_libs/lucide-react.mjs";
import { a as useAlpha, i as Button, n as Route } from "./router-CG39ymgt.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
import { n as StatusBadge, t as ScoreMark } from "./status-badge-BjmMx2N-.mjs";
import { t as tokenExternalLinks } from "./links-D1_gqbSh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/token._address-CwJKYoS8.js
var import_jsx_runtime = require_jsx_runtime();
function Progress({ value = 0, className, barClassName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full rounded-full bg-primary transition-[width] duration-300 ease-[var(--ease-smooth-out)]", barClassName),
			style: { width: `${Math.min(100, Math.max(0, value))}%` }
		})
	});
}
var sourceLabel = {
	onchain: "on-chain",
	market: "market",
	modeled: "modeled"
};
function toneBar(tone) {
	if (tone === "good") return "bg-pass";
	if (tone === "warn") return "bg-warn";
	if (tone === "bad") return "bg-fail";
	return "bg-muted";
}
function AnalysisPanel({ analysis }) {
	if (!analysis) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Analysis has not started. The mint is still in the first stages of the pipe."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			analysis.killFlags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xs font-medium tracking-wide text-fail uppercase",
					children: "Kill flags"
				}), analysis.killFlags.map((flag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-fail/10 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fail",
						children: flag.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: flag.detail
					})]
				}, flag.code))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-3 text-xs font-medium tracking-wide text-muted uppercase",
				children: "Pipeline checks"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: analysis.checklist.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3 rounded-lg bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("mt-0.5", item.done ? "text-pass" : "text-subtle"),
						children: item.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: item.label
					}), item.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: item.detail
					})] })]
				}, item.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-3 text-xs font-medium tracking-wide text-muted uppercase",
				children: "Score breakdown"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: analysis.parts.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-surface p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: part.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: sourceLabel[part.source]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs tabular text-muted",
								children: [
									part.points.toFixed(1),
									" / ",
									part.weight.toFixed(0)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: part.signal,
							barClassName: toneBar(part.tone)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-relaxed text-muted",
							children: part.reason
						})
					]
				}, part.key))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-subtle",
				children: [
					"Threshold ",
					formatPct(analysis.threshold, 0).replace("%", ""),
					" · total ",
					Math.round(analysis.total),
					". Kill flags override a high score."
				]
			})
		]
	});
}
function TokenDetail() {
	const { address } = Route.useParams();
	const token = useAlpha((s) => s.tokens.find((t) => t.address === address));
	const channel = useAlpha((s) => s.channels.find((c) => c.id === token?.sourceChannelId));
	if (!token) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-surface px-5 py-16 text-center shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "This mint is not on the desk yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-xs text-subtle break-all",
				children: address
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Paste it in the inspect bar to run the filter."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-4 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline",
				children: "Back to pulse"
			})
		]
	});
	const chart = (token.analysis?.parts ?? []).map((p) => ({
		name: p.label.replace(" & ", " "),
		points: Number(p.points.toFixed(1)),
		weight: Number(p.weight.toFixed(1))
	}));
	const holders = token.onchain?.topHolders ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Pulse"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreMark, {
						value: token.analysis?.total,
						passed: token.status === "passed",
						size: 72
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-2xl font-medium tracking-tight",
								children: ["$", token.symbol]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: token.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: token.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-xs text-subtle break-all",
							children: token.address
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-subtle",
							children: [
								channel?.title ?? "Desk",
								" · ",
								token.origin === "inspect" ? "manual inspect" : "telegram tape"
							]
						})
					] })]
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Liquidity",
						value: formatUsd(token.market?.liquidityUsd)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Market cap",
						value: formatUsd(token.market?.mcapUsd)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "24h volume",
						value: formatUsd(token.market?.volume24h)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Pair age",
						value: formatAge(token.market?.pairAgeMin)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Dex",
						value: token.market?.dexId ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Mint auth",
						value: token.onchain?.queriedAt ? token.onchain.mintAuthority ? shortMint(token.onchain.mintAuthority) : "revoked" : "unread"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Freeze auth",
						value: token.onchain?.queriedAt ? token.onchain.freezeAuthority ? shortMint(token.onchain.freezeAuthority) : "revoked" : "unread"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "24h change",
						value: token.market?.priceChange24h != null ? formatPct(token.market.priceChange24h, 1) : "—"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-sm font-medium",
						children: "Why this score"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisPanel, { analysis: token.analysis })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-4 text-sm font-medium",
								children: "Points by check"
							}), chart.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Score lands after analysis."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-64",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
										data: chart,
										layout: "vertical",
										margin: {
											left: 8,
											right: 8,
											top: 4,
											bottom: 4
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
												stroke: "var(--color-border)",
												horizontal: false
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												type: "number",
												stroke: "var(--color-muted)",
												fontSize: 11
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
												type: "category",
												dataKey: "name",
												width: 110,
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
												dataKey: "points",
												fill: "var(--color-primary)",
												radius: [
													0,
													4,
													4,
													0
												]
											})
										]
									})
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-3 text-sm font-medium",
								children: "Largest accounts"
							}), holders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Holder map is often rate-limited on public RPC. Concentration then uses LP/mcap as a proxy and is marked modeled."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2",
								children: holders.slice(0, 8).map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-3 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-5 font-mono text-subtle",
											children: i === 0 ? "LP" : i
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full bg-primary",
												style: { width: `${Math.min(100, h.pct)}%` }
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "w-14 text-right font-mono tabular",
											children: [h.pct.toFixed(1), "%"]
										})
									]
								}, h.address + i))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-3 text-sm font-medium",
								children: "Source alert"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "font-mono text-xs leading-relaxed text-muted whitespace-pre-wrap",
								children: token.rawSnippet
							})]
						})
					]
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
			className: "mt-1 font-mono text-sm tabular",
			children: value
		})]
	});
}
//#endregion
export { TokenDetail as component };
