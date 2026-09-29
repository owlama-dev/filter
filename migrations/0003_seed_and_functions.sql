-- Seed data, mention tracking, and atomic config publish/rollback.

create table if not exists mentions (
  message_id     bigint not null references messages (id) on delete cascade,
  token_address  text not null references tokens (address) on delete cascade,
  primary key (message_id, token_address)
);
create index if not exists mentions_token_idx on mentions (token_address);

-- Built-in on-chain feeds (admin can disable them; Telegram channels are added in the panel).
insert into sources (id, kind, handle, title) values
  ('gecko-new', 'onchain_feed', 'geckoterminal:new_pools', 'GeckoTerminal new pools'),
  ('gecko-trending', 'onchain_feed', 'geckoterminal:trending_pools', 'GeckoTerminal trending')
on conflict (id) do nothing;

-- Version 1 mirrors the defaults the current app ships with.
insert into scoring_configs (weights, threshold, is_active, note)
select '{"deployer":14,"freshWallets":12,"concentration":16,"bundles":12,"lpLock":12,"authorities":14,"liquidity":10,"organic":10}'::jsonb,
       72, true, 'initial defaults'
where not exists (select 1 from scoring_configs);

-- Publish a new version and make it the only active one, atomically.
create or replace function publish_scoring_config(
  p_weights jsonb, p_threshold integer, p_kill_rules jsonb, p_note text, p_user text
) returns integer language plpgsql as $$
declare v integer;
begin
  update scoring_configs set is_active = false where is_active;
  insert into scoring_configs (weights, threshold, kill_rules, is_active, note, created_by)
  values (p_weights, p_threshold, coalesce(p_kill_rules, '{}'::jsonb), true, p_note, p_user)
  returning version into v;
  return v;
end $$;

-- Rollback = re-activate an older version. History is never rewritten.
create or replace function activate_scoring_config(p_version integer) returns integer language plpgsql as $$
begin
  if not exists (select 1 from scoring_configs where version = p_version) then
    raise exception 'unknown version %', p_version;
  end if;
  update scoring_configs set is_active = false where is_active;
  update scoring_configs set is_active = true where version = p_version;
  return p_version;
end $$;
