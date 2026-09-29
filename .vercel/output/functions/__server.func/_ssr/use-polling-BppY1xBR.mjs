import { o as __toESM } from "../_runtime.mjs";
import { c as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-polling-BppY1xBR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Calls `fn` immediately, then every `intervalMs`, until unmounted. This is
* the app's live-update mechanism for the admin panel: short-interval polling
* against server functions, rather than a persistent connection — simple and
* robust, at the cost of up to one interval's staleness.
*/
function usePolling(fn, intervalMs, deps = []) {
	const [state, setState] = (0, import_react.useState)({
		data: null,
		error: null,
		loading: true
	});
	const fnRef = (0, import_react.useRef)(fn);
	fnRef.current = fn;
	const run = (0, import_react.useCallback)(async () => {
		try {
			const data = await fnRef.current();
			setState({
				data,
				error: null,
				loading: false
			});
		} catch (err) {
			setState((s) => ({
				data: s.data,
				error: err instanceof Error ? err.message : String(err),
				loading: false
			}));
		}
	}, []);
	(0, import_react.useEffect)(() => {
		let alive = true;
		setState((s) => ({
			...s,
			loading: true
		}));
		const tick = async () => {
			if (!alive) return;
			await run();
		};
		tick();
		const id = setInterval(tick, intervalMs);
		return () => {
			alive = false;
			clearInterval(id);
		};
	}, [
		intervalMs,
		run,
		...deps
	]);
	return {
		...state,
		refresh: run
	};
}
//#endregion
export { usePolling as t };
