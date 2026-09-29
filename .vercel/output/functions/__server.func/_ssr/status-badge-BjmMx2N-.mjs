import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Badge } from "./badge-DOzO57gK.mjs";
import { p as formatScore } from "./scoring-DilwZFet.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-badge-BjmMx2N-.js
var import_jsx_runtime = require_jsx_runtime();
function ScoreMark({ value, passed, size = 56 }) {
	const stroke = 3.5;
	const r = 12.5;
	const c = 2 * Math.PI * r;
	const pct = Math.min(100, Math.max(0, value ?? 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative inline-flex items-center justify-center",
		style: {
			width: size,
			height: size
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 32 32",
			className: "size-full -rotate-90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r,
				fill: "none",
				stroke: "var(--color-surface-2)",
				strokeWidth: stroke
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r,
				fill: "none",
				stroke: passed ? "var(--color-pass)" : value == null ? "var(--color-muted)" : pct >= 72 ? "var(--color-warn)" : "var(--color-fail)",
				strokeWidth: stroke,
				strokeDasharray: `${pct / 100 * c} ${c}`,
				strokeLinecap: "round"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("absolute font-mono text-sm tabular", passed ? "text-pass" : "text-fg"),
			children: formatScore(value)
		})]
	});
}
var MAP = {
	extracted: {
		label: "Extracted",
		variant: "mute"
	},
	enriching: {
		label: "Enriching",
		variant: "info"
	},
	analyzing: {
		label: "Analyzing",
		variant: "warn"
	},
	scored: {
		label: "Scored",
		variant: "info"
	},
	passed: {
		label: "Passed",
		variant: "pass"
	},
	rejected: {
		label: "Rejected",
		variant: "fail"
	}
};
function StatusBadge({ status }) {
	const item = MAP[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: item.variant,
		children: item.label
	});
}
//#endregion
export { StatusBadge as n, ScoreMark as t };
