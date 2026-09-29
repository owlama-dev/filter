import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as authClient } from "./client-DWskxiwE.mjs";
import { n as SignedIn } from "./gates-ClfWFDUM.mjs";
import { i as Button, r as Input } from "./router-CG39ymgt.mjs";
import { t as Label } from "./label-DCYNWq-3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BDnDrue2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Email/password sign-in for self-hosted deployments that don't have the
* Grok auth broker's OAuth secrets (GROK_AUTH_*) injected. Enabled via the
* `emailAndPasswordEnabled` flag in `src/lib/auth/email-password.ts`.
* The first account whose email matches OWNER_EMAIL becomes the admin owner
* automatically on its first visit to /admin — see guard.server.ts.
*/
function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			const { error } = mode === "in" ? await authClient.signIn.email({
				email,
				password
			}) : await authClient.signUp.email({
				email,
				password,
				name: name || email.split("@")[0]
			});
			if (error) throw new Error(error.message ?? "Authentication failed");
			toast.success(mode === "in" ? "Signed in" : "Account created");
			navigate({ to: "/" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Authentication failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-center text-sm text-muted",
			children: "You're already signed in."
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-medium",
					children: mode === "in" ? "Sign in" : "Create an account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "mt-4 space-y-3",
					children: [
						mode === "up" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Optional"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							type: "email",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							type: "password",
							required: true,
							minLength: 8,
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: busy,
							children: busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-4 w-full text-center text-xs text-muted underline-offset-4 hover:underline",
					onClick: () => setMode((m) => m === "in" ? "up" : "in"),
					children: mode === "in" ? "Need an account? Sign up" : "Already have an account? Sign in"
				})
			]
		})]
	});
}
//#endregion
export { LoginPage as component };
