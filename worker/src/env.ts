import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  RPC_URLS: z
    .string()
    .default("https://solana-rpc.publicnode.com,https://api.mainnet-beta.solana.com"),
  TELEGRAM_API_ID: z.coerce.number().optional(),
  TELEGRAM_API_HASH: z.string().optional(),
  TELEGRAM_SESSION: z.string().optional(),
  ALERT_BOT_TOKEN: z.string().optional(),
  ALERT_CHAT_ID: z.string().optional(),
  PORT: z.coerce.number().default(8081),
});

export const env = schema.parse(process.env);
export const rpcUrls = env.RPC_URLS.split(",").map((s) => s.trim()).filter(Boolean);
