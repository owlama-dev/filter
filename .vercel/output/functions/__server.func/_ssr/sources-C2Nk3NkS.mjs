import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as deleteSource, t as adminOverview, u as saveSource } from "./api-Bxqb_Npe.mjs";
import { t as usePolling } from "./use-polling-BppY1xBR.mjs";
import { t as Badge } from "./badge-DOzO57gK.mjs";
import { t as Switch } from "./switch-CJhDOWH6.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Button, r as Input } from "./router-CG39ymgt.mjs";
import { t as Label } from "./label-DCYNWq-3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sources-C2Nk3NkS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SourcesPage() {
	const { data, error, refresh } = usePolling(() => adminOverview(), 5e3);
	const sources = (data?.sources ?? []).slice().sort((a, b) => a.title.localeCompare(b.title));
	const [form, setForm] = (0, import_react.useState)({
		kind: "telegram_channel",
		handle: "",
		title: "",
		weight: 1
	});
	const [busy, setBusy] = (0, import_react.useState)(null);
	async function onAdd(e) {
		e.preventDefault();
		if (!form.handle.trim() || !form.title.trim()) return;
		setBusy("__new");
		try {
			await saveSource({ data: {
				kind: form.kind,
				handle: form.handle,
				title: form.title,
				weight: 1,
				enabled: true
			} });
			toast.success("Source added");
			setForm({
				kind: "telegram_channel",
				handle: "",
				title: "",
				weight: 1
			});
			await refresh();
		} catch (e2) {
			toast.error(e2 instanceof Error ? e2.message : "Failed to add source");
		} finally {
			setBusy(null);
		}
	}
	async function toggle(s) {
		setBusy(s.id);
		try {
			await saveSource({ data: {
				id: s.id,
				kind: s.kind,
				handle: s.handle,
				title: s.title,
				weight: s.weight,
				enabled: !s.enabled
			} });
			await refresh();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to update");
		} finally {
			setBusy(null);
		}
	}
	async function remove(s) {
		if (!confirm(`Remove "${s.title}"? Its message history stays; only the source stops being polled/read.`)) return;
		setBusy(s.id);
		try {
			await deleteSource({ data: { id: s.id } });
			toast.success("Source removed");
			await refresh();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to remove");
		} finally {
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				className: "text-sm text-red-500",
				children: ["Source status unavailable: ", error]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onAdd,
				className: "grid gap-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:grid-cols-[160px_1fr_1fr_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Kind" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-1 h-9 w-full rounded-md border border-border bg-surface-2 px-2 text-sm",
						value: form.kind,
						onChange: (e) => setForm((f) => ({
							...f,
							kind: e.target.value
						})),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "telegram_channel",
								children: "Telegram channel"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "telegram_bot",
								children: "Telegram bot"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "onchain_feed",
								children: "On-chain feed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "manual",
								children: "Manual"
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Handle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1",
						placeholder: "@channel or t.me/channel",
						value: form.handle,
						onChange: (e) => setForm((f) => ({
							...f,
							handle: e.target.value
						}))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1",
						placeholder: "Display name",
						value: form.title,
						onChange: (e) => setForm((f) => ({
							...f,
							title: e.target.value
						}))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy === "__new",
							children: "Add source"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "col-span-full text-xs text-muted",
						children: "For Telegram, the worker's session account must already be a member of the channel — adding it here doesn't join it for you."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-b border-border text-left text-xs text-muted uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Source"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Kind"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Weight"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Avg 60m mult."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Calls captured"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Last seen"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Enabled"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [sources.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/60 last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: s.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: ["@", s.handle]
									}),
									s.error_count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-red-400",
										title: s.last_error ?? void 0,
										children: [
											s.error_count,
											" recent error",
											s.error_count === 1 ? "" : "s"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted",
								children: s.kind.replace("_", " ")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									className: s.weight >= 1.2 ? "bg-emerald-500/15 text-emerald-400" : s.weight <= .7 ? "bg-red-500/15 text-red-400" : "bg-surface-2 text-muted",
									children: [
										s.weight.toFixed(2),
										"×",
										s.reputation_sample > 0 ? ` (n=${s.reputation_sample})` : " (new)"
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: s.avg_multiple_60m != null ? `${s.avg_multiple_60m.toFixed(2)}×` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: s.ingested_calls
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted",
								children: s.last_seen_at ? new Date(s.last_seen_at).toLocaleString() : "never"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: s.enabled,
									disabled: busy === s.id,
									onCheckedChange: () => toggle(s)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									disabled: busy === s.id,
									onClick: () => remove(s),
									children: "Remove"
								})
							})
						]
					}, s.id)), sources.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 8,
						className: "px-4 py-8 text-center text-muted",
						children: "No sources yet."
					}) })] })]
				})
			})
		]
	});
}
//#endregion
export { SourcesPage as component };
