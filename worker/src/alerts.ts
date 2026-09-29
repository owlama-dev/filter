import { env } from "./env";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface AlertInput {
  symbol: string;
  name: string;
  address: string;
  score: number;
  threshold: number;
  mcapUsd: number | null;
  liquidityUsd: number | null;
  pairUrl: string | null;
  topReasons: string[];
  sourceTitle: string | null;
}

const usd = (v: number | null) =>
  v == null ? "n/a" : v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(1)}K` : `$${v.toFixed(0)}`;

export async function sendAlert(a: AlertInput): Promise<void> {
  if (!env.ALERT_BOT_TOKEN || !env.ALERT_CHAT_ID) return;
  const lines = [
    `<b>PASS ${a.score.toFixed(0)}/${a.threshold}</b>  ${esc(a.symbol)} (${esc(a.name)})`,
    `MC ${usd(a.mcapUsd)} · Liq ${usd(a.liquidityUsd)}${a.sourceTitle ? ` · via ${esc(a.sourceTitle)}` : ""}`,
    ...a.topReasons.slice(0, 3).map((r) => `• ${esc(r)}`),
    `<code>${a.address}</code>`,
    [
      a.pairUrl ? `<a href="${a.pairUrl}">DexScreener</a>` : null,
      `<a href="https://rugcheck.xyz/tokens/${a.address}">RugCheck</a>`,
      `<a href="https://solscan.io/token/${a.address}">Solscan</a>`,
    ]
      .filter(Boolean)
      .join(" · "),
  ];
  const res = await fetch(`https://api.telegram.org/bot${env.ALERT_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: env.ALERT_CHAT_ID,
      text: lines.join("\n"),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`telegram alert ${res.status}`);
}
