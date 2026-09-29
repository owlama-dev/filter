//#region node_modules/.nitro/vite/services/ssr/assets/links-D1_gqbSh.js
function dexscreenerTokenUrl(address) {
	return `https://dexscreener.com/solana/${address}`;
}
function solscanTokenUrl(address) {
	return `https://solscan.io/token/${address}`;
}
function jupiterSwapUrl(address) {
	return `https://jup.ag/swap/SOL-${address}`;
}
function openseaTokenUrl(address) {
	return `https://opensea.io/item/solana/${address}`;
}
function tokenExternalLinks(address) {
	return [
		{
			id: "opensea",
			label: "OpenSea",
			href: openseaTokenUrl(address),
			hint: "Mobile-friendly buy / sell"
		},
		{
			id: "dex",
			label: "DexScreener",
			href: dexscreenerTokenUrl(address),
			hint: "Chart and tape"
		},
		{
			id: "solscan",
			label: "Solscan",
			href: solscanTokenUrl(address),
			hint: "Explorer"
		},
		{
			id: "jupiter",
			label: "Jupiter",
			href: jupiterSwapUrl(address),
			hint: "Swap"
		}
	];
}
//#endregion
export { tokenExternalLinks as t };
