import { TelegramClient } from "telegram";
import { NewMessage, type NewMessageEvent } from "telegram/events/index.js";
import { StringSession } from "telegram/sessions/index.js";
import { extractMints } from "../../../src/lib/alpha/extract";
import { q } from "../db";
import { env } from "../env";
import { markSourceError, recordCall } from "./common";

type Src = { id: string; handle: string };

/**
 * Reads real channel posts through a Telegram user session. The account must be a
 * member of every channel you add in the admin panel. Sources are re-read every 30s,
 * so adding, disabling or removing a channel needs no restart.
 */
export async function startTelegramIngest(): Promise<{ stop: () => Promise<void> } | null> {
  if (!env.TELEGRAM_API_ID || !env.TELEGRAM_API_HASH || !env.TELEGRAM_SESSION) {
    console.warn("[telegram] TELEGRAM_* not set, Telegram ingestion disabled (run `npm run telegram:login`)");
    return null;
  }
  const client = new TelegramClient(new StringSession(env.TELEGRAM_SESSION), env.TELEGRAM_API_ID, env.TELEGRAM_API_HASH, {
    connectionRetries: 10,
    autoReconnect: true,
  });
  await client.connect();

  let byHandle = new Map<string, Src>();
  const reload = async () => {
    const rows = await q<Src>(
      "select id, lower(handle) as handle from sources where enabled and kind in ('telegram_channel','telegram_bot')",
    );
    byHandle = new Map(rows.map((r) => [r.handle.replace(/^@/, ""), r]));
  };
  await reload();
  const timer = setInterval(() => void reload().catch(() => undefined), 30_000);

  client.addEventHandler(async (ev: NewMessageEvent) => {
    try {
      const text = ev.message.message ?? "";
      if (!text) return;
      const chat = (await ev.message.getChat()) as { username?: string; id?: { toString(): string } } | undefined;
      const keys = [chat?.username?.toLowerCase(), chat?.id?.toString()].filter(Boolean) as string[];
      const src = keys.map((k) => byHandle.get(k)).find(Boolean);
      if (!src) return;
      const addresses = extractMints(text);
      if (!addresses.length) return;
      await recordCall({ sourceId: src.id, externalId: String(ev.message.id), body: text, addresses });
    } catch (err) {
      console.error("[telegram]", err instanceof Error ? err.message : err);
    }
  }, new NewMessage({ incoming: true }));

  console.log("[telegram] listening");
  return {
    stop: async () => {
      clearInterval(timer);
      await client.disconnect();
    },
  };
}

export { markSourceError };
