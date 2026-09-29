import readline from "node:readline/promises";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

// One-time interactive login. Use a dedicated Telegram account, not your main one:
// automated user sessions can be limited by Telegram.
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const apiId = Number(process.env.TELEGRAM_API_ID || (await rl.question("api_id: ")));
const apiHash = process.env.TELEGRAM_API_HASH || (await rl.question("api_hash: "));
const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });
await client.start({
  phoneNumber: () => rl.question("phone (+country code): "),
  phoneCode: () => rl.question("login code: "),
  password: () => rl.question("2FA password (if any): "),
  onError: (e) => console.error(e),
});
console.log("\nTELEGRAM_SESSION=" + client.session.save());
await client.disconnect();
rl.close();
process.exit(0);
