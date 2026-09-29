import { a as QUOTE_MINTS, o as SOLANA_CA_RE } from "./scoring-DilwZFet.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/extract-CKhKsRsx.js
function isSolanaMint(value) {
	const v = value.trim();
	if (v.length < 32 || v.length > 44) return false;
	if (QUOTE_MINTS.has(v)) return false;
	if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(v)) return false;
	return true;
}
function extractMints(text) {
	const found = text.match(SOLANA_CA_RE) ?? [];
	const unique = [];
	for (const raw of found) {
		if (!isSolanaMint(raw)) continue;
		if (unique.includes(raw)) continue;
		unique.push(raw);
	}
	return unique;
}
function normalizeHandle(handle) {
	return handle.trim().replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "");
}
//#endregion
export { isSolanaMint as n, normalizeHandle as r, extractMints as t };
