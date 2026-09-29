-- Real deployer tracing + bundle detection storage, and source reputation bookkeeping.

alter table tokens add column if not exists deployer_wallet text;
create index if not exists tokens_deployer_idx on tokens (deployer_wallet);

-- Our own ledger of wallets that have deployed mints we've seen, and how those
-- launches turned out. Built incrementally by the worker; NOT a full chain scan.
create table if not exists dev_wallets (
  wallet          text primary key,
  first_seen_at   timestamptz not null default now(),
  tx_count        integer,
  mint_count      integer not null default 0,
  rug_count       integer not null default 0,
  updated_at      timestamptz not null default now()
);

-- Reputation bookkeeping on sources (weight itself already existed in 0002).
alter table sources add column if not exists reputation_sample integer not null default 0;
alter table sources add column if not exists reputation_updated_at timestamptz;
alter table sources add column if not exists avg_multiple_60m numeric;

-- Every scoring_configs row can now carry an admin-edited kill_rules payload
-- (the column already existed in 0002 as a jsonb default '{}'). Backfill the
-- active config with the shipped defaults so old rows behave exactly as before.
update scoring_configs
   set kill_rules = '{"requireAuthoritiesRevoked":true,"minLiquidityUsd":800,"maxTopHolderPct":40,"maxDeployerPriorRugs":2,"maxSameSlotBundlePct":55}'::jsonb
 where kill_rules = '{}'::jsonb;
