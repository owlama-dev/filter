# Running AlphaFilter v2

This zip is the full repo: the TanStack Start web app + admin panel, and the
`worker/` service that does ingestion, enrichment and scoring. Two processes,
one Postgres database.

## 0. One thing to know about auth before you start

This app's sign-in was originally built for a hosted platform ("Grok") that
injects OAuth secrets for Google/X sign-in automatically. Outside that
platform, those secrets don't exist. I've turned on Better Auth's built-in
**email + password** sign-in instead (`src/lib/auth/email-password.ts`), and
added `/login` for it. That's what you'll use. If you later deploy through
the platform this project came from and it injects `GROK_AUTH_*` secrets,
the original Google/X buttons will also work side by side — nothing had to
be removed for this to work.

## 1. Prerequisites

- Node.js 22+
- A Postgres database. Easiest free option: [Neon](https://neon.tech) — create
  a project, copy its connection string.
- Docker, if you want to run the worker in a container (optional — `npm start`
  works too).

## 2. Database

Run the four migration files, **in order**, against your Postgres database.
The web app's own build does this automatically (see step 3), but you can also
do it by hand:

```bash
psql "$DATABASE_URL" -f migrations/0001_auth.sql
psql "$DATABASE_URL" -f migrations/0002_admin_core.sql
psql "$DATABASE_URL" -f migrations/0003_seed_and_functions.sql
psql "$DATABASE_URL" -f migrations/0004_deployer_and_reputation.sql
```

## 3. Web app (admin panel + UI)

```bash
npm install
```

Create `.env` in the repo root:

```bash
DATABASE_URL=postgres://user:pass@host/db?sslmode=require
OWNER_EMAIL=you@example.com        # this account becomes the admin owner
VITE_AUTH_ENABLED=true             # turns on real sign-in (not the dev user)
```

Run it:

```bash
npm run dev
```

Open `http://localhost:8080`, go to `/login`, click "Need an account? Sign
up", and sign up with the exact email you set as `OWNER_EMAIL`. The moment
that account visits `/admin`, it's automatically granted the owner role (see
`src/lib/admin/guard.server.ts` — this only happens once, while no admin
exists yet). From there, use the Members tab to add teammates by email (they
must sign up once first) as admin or analyst.

**Deploying the web app:** `npm run build` builds it and also runs pending
migrations against `DATABASE_URL` (`scripts/migrate.mjs`). It's set up for
Vercel (`vercel.json`) — set the same three env vars in your Vercel project,
point `DATABASE_URL` at the same Neon database the worker uses, and deploy.

## 4. Worker (ingestion, scoring, alerts — must run continuously)

The worker can't run on Vercel (no long-lived processes there). Run it
somewhere that stays up: a small VPS, Railway, Render, or Fly.

```bash
cd worker
npm install
cp .env.example .env
```

Edit `worker/.env`:

```bash
DATABASE_URL=postgres://user:pass@host/db?sslmode=require   # same database as the web app
RPC_URLS=https://solana-rpc.publicnode.com,https://api.mainnet-beta.solana.com
# ^ free public RPCs work but rate-limit hard. A paid endpoint (Helius,
#   Triton, QuickNode) as the FIRST entry is strongly recommended — the
#   deployer trace in particular makes several RPC calls per token.

TELEGRAM_API_ID=
TELEGRAM_API_HASH=
TELEGRAM_SESSION=

ALERT_BOT_TOKEN=
ALERT_CHAT_ID=
```

**Telegram** (optional but you asked for both sources): create an app at
https://my.telegram.org to get `TELEGRAM_API_ID`/`TELEGRAM_API_HASH`, then:

```bash
npm run telegram:login
```

Follow the prompts (phone number, login code, 2FA if you have it). It prints
`TELEGRAM_SESSION=...` — paste that into `.env`. **Use a dedicated Telegram
account for this, not your main one.** The account must already be a member
of every channel you add as a source in the admin panel.

**Alerts** (optional): message [@BotFather](https://t.me/BotFather), create a
bot, get its token for `ALERT_BOT_TOKEN`. Message your new bot once, then get
your numeric chat id (e.g. via `@userinfobot`) for `ALERT_CHAT_ID`.

Run it:

```bash
npm start
```

or with Docker, from the repo root:

```bash
cd worker
docker compose up -d --build
```

Check it's alive: `curl http://localhost:8081/healthz`

On-chain ingestion (GeckoTerminal new/trending pools) needs no setup and
starts working immediately — that's the fastest way to see the pipeline run
end to end before bothering with Telegram credentials.

## 5. First run checklist

1. Both migrations and the web app are pointed at the **same** `DATABASE_URL`.
2. Web app running, you've signed up as `OWNER_EMAIL` and visited `/admin` once.
3. Worker running, `/healthz` returns `{"ok":true,...}`.
4. In the admin panel → **Sources**, the two `gecko-new`/`gecko-trending`
   sources are enabled by default — you should see evaluations appear on the
   **Dashboard** tab within a minute or two.
5. Add a Telegram channel in **Sources** once `TELEGRAM_SESSION` is set, and
   confirm the worker log shows `[telegram] listening`.
6. In **Scoring**, run a what-if backtest before changing anything, just to
   see the tool work — it needs a little evaluation history to be meaningful,
   so it'll look thin on day one.

## 6. What each piece is, if you're navigating the code

- `src/routes/admin*` — the admin panel UI.
- `src/lib/admin/` — role-checked, audited server functions the panel calls.
- `src/lib/alpha/{types,defaults,scoring}.ts` — the pure scoring engine,
  shared by the worker and the (now read-only) browser UI.
- `worker/src/pipeline.ts` — the per-token evaluation flow.
- `worker/src/providers/` — DexScreener, GeckoTerminal, Solana RPC, deployer
  tracing, bundle detection.
- `worker/src/ingest/` — Telegram and on-chain sources feeding the queue.
- `migrations/000{1,2,3,4}_*.sql` — run in that order, always.
