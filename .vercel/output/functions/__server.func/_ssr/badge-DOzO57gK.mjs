import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-DOzO57gK.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase", {
	variants: { variant: {
		default: "bg-primary text-primary-foreground",
		mute: "bg-surface-2 text-muted",
		pass: "bg-pass/15 text-pass",
		fail: "bg-fail/15 text-fail",
		warn: "bg-warn/15 text-warn",
		info: "bg-info/15 text-info",
		outline: "border border-border text-muted"
	} },
	defaultVariants: { variant: "mute" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
export { Badge as t };
