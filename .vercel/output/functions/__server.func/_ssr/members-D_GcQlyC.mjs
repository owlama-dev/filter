import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as listMembers, f as setMember, p as whoami, s as removeMember } from "./api-Bxqb_Npe.mjs";
import { t as usePolling } from "./use-polling-BppY1xBR.mjs";
import { t as Badge } from "./badge-DOzO57gK.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Button, r as Input } from "./router-CG39ymgt.mjs";
import { t as Label } from "./label-DCYNWq-3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/members-D_GcQlyC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MembersPage() {
	const { data: me } = usePolling(() => whoami(), 3e4);
	const { data, refresh, error } = usePolling(() => listMembers(), 8e3);
	const members = data ?? [];
	const [email, setEmail] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("analyst");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onAdd(e) {
		e.preventDefault();
		if (!email.trim()) return;
		setBusy(true);
		try {
			await setMember({ data: {
				email: email.trim(),
				role
			} });
			toast.success(`${email} set as ${role}`);
			setEmail("");
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to add member");
		} finally {
			setBusy(false);
		}
	}
	async function remove(m) {
		if (!confirm(`Remove ${m.email} from the admin panel?`)) return;
		try {
			await removeMember({ data: { userId: m.user_id } });
			toast.success("Removed");
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to remove");
		}
	}
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm text-muted",
		children: [
			"Only the owner can manage members. (",
			error,
			")"
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: onAdd,
			className: "grid gap-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:grid-cols-[1fr_160px_auto]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1",
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "teammate@example.com"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "mt-1 h-9 w-full rounded-md border border-border bg-surface-2 px-2 text-sm",
					value: role,
					onChange: (e) => setRole(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "analyst",
							children: "Analyst — view + backtest"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "admin",
							children: "Admin — edit + publish"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "owner",
							children: "Owner — full control"
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: "Set role"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "col-span-full text-xs text-muted",
					children: "They must have signed in at least once before you can add them."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border text-left text-xs text-muted uppercase",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Member"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Role"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Added"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60 last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: m.name ?? m.email
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: m.email
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "bg-surface-2",
								children: m.role
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted",
							children: new Date(m.created_at).toLocaleDateString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: m.user_id !== me?.userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => remove(m),
								children: "Remove"
							})
						})
					]
				}, m.user_id)) })]
			})
		})]
	});
}
//#endregion
export { MembersPage as component };
