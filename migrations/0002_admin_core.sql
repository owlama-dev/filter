-- AlphaFilter v2 core schema. Server is the source of truth; the browser only renders.
-- Depends on 0001_auth.sql ("user" table). ids are TEXT to match Better Auth.

-- ── Access control ─────────────────────────────────────────────
create table if not exists admin_members (
  user_id     text primary key references "user" ("id") on delete cascade,
  role        text not null check (role in ('owner', 'admin', 'analyst')),
  created_by  text references "user" ("id") on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists audit_log (
  id          bigserial primary key,
  actor_id    text references "user" ("id") on delete set null,
  action      text not null,              -- e.g. 'config.publish', 'source.disable', 'engine.pause'
  target      text,
  before      jsonb,
  after       jsonb,
  ip          text,
  at          timestamptz not null default now()
);
create index if not exists audit_log_at_idx on audit_log (at desc);
create index if not exists audit_log_actor_idx on audit_log (actor_id, at desc);

-- ── Runtime control (kill switch, pause, ingest pace) ──────────
create table if not exists system_settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  text references "user" ("id") on delete set null,
  updated_at  timestamptz not null default now()
);
insert into system_settings (key, value) values
  ('engine', '{"paused": false, "safe_mode": false, "max_inflight": 8}'::jsonb)
on conflict (key) do nothing;

-- ── Sources (Telegram channels/bots, on-chain feeds, manual) ───
create table if not exists sources (
  id            text primary key,
  kind          text not null check (kind in ('telegram_channel', 'telegram_bot', 'onchain_feed', 'manual')),
  handle        text not null,
  title         text not null,
  enabled       boolean not null default true,
  weight        numeric not null default 1.0,     -- reputation multiplier, tuned from outcomes
  config        jsonb not null default '{}'::jsonb,
  last_seen_at  timestamptz,
  error_count   integer not null default 0,
  last_error    text,
  created_at    timestamptz not null default now(),
  unique (kind, handle)
);

create table if not exists messages (
  id            bigserial primary key,
  source_id     text not null references sources (id) on delete cascade,
  external_id   text not null,                    -- telegram message id / pool id
  body          text not null,
  received_at   timestamptz not null default now(),
  unique (source_id, external_id)                 -- idempotent ingestion
);
create index if not exists messages_received_idx on messages (received_at desc);

-- ── Versioned scoring config (every decision is reproducible) ──
create table if not exists scoring_configs (
  version      serial primary key,
  weights      jsonb not null,
  threshold    integer not null check (threshold between 40 and 95),
  kill_rules   jsonb not null default '{}'::jsonb,
  is_active    boolean not null default false,
  note         text,
  created_by   text references "user" ("id") on delete set null,
  created_at   timestamptz not null default now()
);
create unique index if not exists scoring_configs_one_active on scoring_configs (is_active) where is_active;

-- ── Tokens and evaluations ─────────────────────────────────────
create table if not exists tokens (
  address         text primary key,
  chain           text not null default 'solana',
  name            text,
  symbol          text,
  image_url       text,
  first_source_id text references sources (id) on delete set null,
  first_message_id bigint references messages (id) on delete set null,
  first_seen_at   timestamptz not null default now()
);

create table if not exists evaluations (
  id              bigserial primary key,
  token_address   text not null references tokens (address) on delete cascade,
  config_version  integer not null references scoring_configs (version),
  status          text not null check (status in ('queued','enriching','scored','passed','rejected','error')),
  score           numeric,
  passed          boolean,
  market          jsonb,          -- raw provider snapshot, kept so we can re-score without refetching
  onchain         jsonb,
  analysis        jsonb,          -- parts, kill flags, checklist
  error           text,
  created_at      timestamptz not null default now(),
  finished_at     timestamptz
);
create index if not exists evaluations_token_idx on evaluations (token_address, created_at desc);
create index if not exists evaluations_status_idx on evaluations (status, created_at desc);
create index if not exists evaluations_passed_idx on evaluations (created_at desc) where passed;

-- ── Outcomes (feeds backtesting and source reputation) ─────────
create table if not exists outcomes (
  id              bigserial primary key,
  token_address   text not null references tokens (address) on delete cascade,
  horizon_min     integer not null,               -- 15, 60, 240, 1440
  price_usd       numeric,
  mcap_usd        numeric,
  multiple        numeric,                        -- vs price at evaluation time
  checked_at      timestamptz not null default now(),
  unique (token_address, horizon_min)
);

-- ── Provider health (admin can see what is degrading) ──────────
create table if not exists provider_health (
  provider      text primary key,                 -- 'dexscreener','gecko','rpc','rugcheck'
  ok            boolean not null default true,
  p50_ms        integer,
  error_rate    numeric,
  last_error    text,
  circuit_open_until timestamptz,
  updated_at    timestamptz not null default now()
);

-- ── Job queue (Postgres-backed; FOR UPDATE SKIP LOCKED) ────────
create table if not exists jobs (
  id            bigserial primary key,
  kind          text not null,                    -- 'enrich','score','outcome'
  payload       jsonb not null,
  run_at        timestamptz not null default now(),
  attempts      integer not null default 0,
  locked_at     timestamptz,
  done_at       timestamptz,
  last_error    text
);
create index if not exists jobs_ready_idx on jobs (run_at) where done_at is null and locked_at is null;
