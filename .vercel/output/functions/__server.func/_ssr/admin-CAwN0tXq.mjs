import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link, g as Outlet, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as whoami } from "./api-Bxqb_Npe.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as SignInGate } from "./gates-ClfWFDUM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-CAwN0tXq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	{
		to: "/admin",
		label: "Dashboard"
	},
	{
		to: "/admin/sources",
		label: "Sources"
	},
	{
		to: "/admin/scoring",
		label: "Scoring"
	},
	{
		to: "/admin/members",
		label: "Members"
	},
	{
		to: "/admin/audit",
		label: "Audit log"
	}
];
function useRole() {
	const [state, setState] = (0, import_react.useState)({
		loading: true,
		role: null,
		error: null
	});
	(0, import_react.useEffect)(() => {
		let alive = true;
		whoami().then((r) => alive && setState({
			loading: false,
			role: r.role,
			error: null
		})).catch((e) => alive && setState({
			loading: false,
			role: null,
			error: e instanceof Error ? e.message : String(e)
		}));
		return () => {
			alive = false;
		};
	}, []);
	return state;
}
function AdminLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { loading, role, error } = useRole();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInGate, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-sm space-y-4 rounded-2xl bg-surface p-6 text-center shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "Sign in to reach the admin panel."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground",
				children: "Go to sign in"
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-muted uppercase",
					children: "Control plane"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight sm:text-3xl",
					children: "Admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Every change here is role-checked on the server and written to the audit log."
				})
			] }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Checking access…"
			}) : !role ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "You don't have admin access."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: error ?? "Ask an existing admin to add your account, or set OWNER_EMAIL and sign in with that address to bootstrap the owner seat."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex flex-wrap items-center gap-1 border-b border-border pb-2",
				children: [TABS.map((tab) => {
					const active = tab.to === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.to);
					if (tab.to === "/admin/members" && role !== "owner") return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: tab.to,
						className: cn("inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors duration-150", active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg"),
						children: tab.label
					}, tab.to);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto text-xs text-muted uppercase tracking-wide",
					children: role
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})] })]
		})
	});
}
//#endregion
export { AdminLayout as component };
