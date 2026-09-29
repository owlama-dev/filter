export function dexscreenerTokenUrl(address: string) {
  return `https://dexscreener.com/solana/${address}`;
}

export function solscanTokenUrl(address: string) {
  return `https://solscan.io/token/${address}`;
}

export function jupiterSwapUrl(address: string) {
  return `https://jup.ag/swap/SOL-${address}`;
}

export function openseaTokenUrl(address: string) {
  return `https://opensea.io/item/solana/${address}`;
}

export function photonUrl(address: string) {
  return `https://photon-sol.tinyastro.io/en/lp/${address}`;
}

export function telegramChannelUrl(handle: string) {
  return `https://t.me/${handle.replace(/^@/, "")}`;
}

export type ExternalLink = {
  id: string;
  label: string;
  href: string;
  hint: string;
};

export function tokenExternalLinks(address: string): ExternalLink[] {
  return [
    {
      id: "opensea",
      label: "OpenSea",
      href: openseaTokenUrl(address),
      hint: "Mobile-friendly buy / sell",
    },
    {
      id: "dex",
      label: "DexScreener",
      href: dexscreenerTokenUrl(address),
      hint: "Chart and tape",
    },
    {
      id: "solscan",
      label: "Solscan",
      href: solscanTokenUrl(address),
      hint: "Explorer",
    },
    {
      id: "jupiter",
      label: "Jupiter",
      href: jupiterSwapUrl(address),
      hint: "Swap",
    },
  ];
}
