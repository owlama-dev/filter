import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as listAudit } from "./api-Bxqb_Npe.mjs";
import { t as usePolling } from "./use-polling-BppY1xBR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-CRNT2r4g.js
var import_jsx_runtime = require_jsx_runtime();
function diffLine(before, after) {
	if (before == null && after != null) return "created";
	if (before != null && after == null) return "removed";
	try {
		return JSON.stringify(after).slice(0, 140);
	} catch {
		return "";
	}
}
function AuditPage() {
	const { data, error } = usePolling(() => listAudit(), 8e3);
	const rows = data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]",
		children: [error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "p-4 text-sm text-muted",
			children: error
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "border-b border-border text-left text-xs text-muted uppercase",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "When"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Actor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Action"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Target"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Change"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border/60 last:border-0 align-top",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "whitespace-nowrap px-4 py-3 text-muted",
						children: new Date(r.at).toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3",
						children: r.actor ?? "system"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 font-mono text-xs",
						children: r.action
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 font-mono text-xs text-muted",
						children: r.target ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "max-w-xs truncate px-4 py-3 text-xs text-muted",
						title: diffLine(r.before, r.after),
						children: diffLine(r.before, r.after)
					})
				]
			}, r.id)), rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 5,
				className: "px-4 py-8 text-center text-muted",
				children: "No admin actions yet."
			}) })] })]
		})]
	});
}
//#endregion
export { AuditPage as component };
