-- RH PC LAB game economy: credits, check-ins, inventory + upgrades, roulette,
-- the player's own rig, and PC battles. Off-chain game currency only.
--
-- Security model: clients can READ their rows but never write them. Every
-- change goes through the game_* functions below, which only the server
-- (service role) may execute, after it has validated the session and worked
-- out prices, rewards, randomness and scores. The functions make each money
-- movement atomic and keep balances from going negative.

-- ───────────────────────── CONFIG ─────────────────────────

create table public.game_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.game_config enable row level security;
create policy "game config is public" on public.game_config for select using (true);

-- ───────────────────────── WALLET ─────────────────────────

create table public.wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  credits bigint not null default 0 check (credits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.credit_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount bigint not null,
  balance_after bigint not null,
  kind text not null check (kind in ('starting', 'checkin', 'roulette', 'purchase', 'battle', 'challenge', 'adjustment')),
  ref text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index credit_transactions_user_idx on public.credit_transactions (user_id, created_at desc);
-- A challenge pays out once per player, no matter how often the entry is replaced.
create unique index credit_transactions_once_idx on public.credit_transactions (user_id, kind, ref) where kind in ('starting', 'challenge');

-- ───────────────────────── DAILY ─────────────────────────

create table public.checkins (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  streak integer not null check (streak >= 1),
  reward integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table public.roulette_spins (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  reward jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ───────────────────────── INVENTORY & RIG ─────────────────────────

create table public.inventory (
  user_id uuid not null references public.profiles (id) on delete cascade,
  component_id text not null references public.components (id),
  level integer not null default 1 check (level between 1 and 10),
  -- Duplicate copies waiting to be fused into an upgrade.
  spare integer not null default 0 check (spare >= 0),
  acquired_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, component_id)
);

create table public.rigs (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  parts jsonb not null default '{}'::jsonb,   -- { category: component_id }
  levels jsonb not null default '{}'::jsonb,  -- { component_id: level } snapshot
  score integer not null default 0 check (score between 0 and 100),
  rarity text not null default 'COMMON',
  pc_level integer not null default 1,
  value integer not null default 0,
  power integer not null default 0,
  stats jsonb not null default '{}'::jsonb,   -- category scores for battles
  updated_at timestamptz not null default now()
);
create index rigs_score_idx on public.rigs (score);

-- ───────────────────────── BATTLES ─────────────────────────

create table public.battle_stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  wins integer not null default 0,
  losses integer not null default 0,
  streak integer not null default 0,
  best_streak integer not null default 0,
  points integer not null default 0,
  rewarded_day date,
  rewarded_count integer not null default 0,
  last_battle_at timestamptz
);

create table public.battles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  opponent_id uuid references public.profiles (id) on delete set null,
  opponent_bot text,
  opponent_name text not null,
  opponent_avatar text not null default 'bot',
  my_score integer not null,
  opp_score integer not null,
  my_total numeric not null,
  opp_total numeric not null,
  breakdown jsonb not null,
  won boolean not null,
  credits integer not null default 0,
  points integer not null default 0,
  streak integer not null default 0,
  my_rig jsonb not null,
  opp_rig jsonb not null,
  created_at timestamptz not null default now()
);
create index battles_user_idx on public.battles (user_id, created_at desc);
create index battles_opponent_idx on public.battles (opponent_id, created_at desc);

-- ───────────────────────── RLS (read-only for players) ─────────────────────────

alter table public.wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.checkins enable row level security;
alter table public.roulette_spins enable row level security;
alter table public.inventory enable row level security;
alter table public.rigs enable row level security;
alter table public.battle_stats enable row level security;
alter table public.battles enable row level security;

create policy "own wallet" on public.wallets for select using (auth.uid() = user_id);
create policy "own transactions" on public.credit_transactions for select using (auth.uid() = user_id);
create policy "own checkins" on public.checkins for select using (auth.uid() = user_id);
create policy "own spins" on public.roulette_spins for select using (auth.uid() = user_id);
create policy "own inventory" on public.inventory for select using (auth.uid() = user_id);
create policy "rigs are public" on public.rigs for select using (true);
create policy "battle stats are public" on public.battle_stats for select using (true);
create policy "own battles" on public.battles for select using (auth.uid() = user_id or auth.uid() = opponent_id);

revoke insert, update, delete, truncate on
  public.game_config, public.wallets, public.credit_transactions, public.checkins, public.roulette_spins,
  public.inventory, public.rigs, public.battle_stats, public.battles
from anon, authenticated;
grant select on
  public.game_config, public.wallets, public.credit_transactions, public.checkins, public.roulette_spins,
  public.inventory, public.rigs, public.battle_stats, public.battles
to anon, authenticated;

-- ───────────────────────── CORE MONEY FUNCTION ─────────────────────────

create or replace function public.game_apply(p_user uuid, p_amount bigint, p_kind text, p_ref text default null, p_meta jsonb default '{}'::jsonb)
returns bigint language plpgsql set search_path = public as $$
declare
  v_balance bigint;
begin
  insert into wallets (user_id) values (p_user) on conflict (user_id) do nothing;
  select credits into v_balance from wallets where user_id = p_user for update;
  if v_balance + p_amount < 0 then
    raise exception 'INSUFFICIENT_CREDITS' using errcode = 'P0001';
  end if;
  update wallets set credits = credits + p_amount, updated_at = now() where user_id = p_user returning credits into v_balance;
  insert into credit_transactions (user_id, amount, balance_after, kind, ref, meta) values (p_user, p_amount, v_balance, p_kind, p_ref, p_meta);
  return v_balance;
end $$;

-- Starting balance for every new player (same amount for everyone).
create or replace function public.on_profile_created_wallet() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_start bigint := coalesce((select (value ->> 'startingCredits')::bigint from game_config where key = 'economy'), 5000);
begin
  perform game_apply(new.id, v_start, 'starting', 'starting', '{}'::jsonb);
  return new;
end $$;

create trigger profiles_wallet
after insert on public.profiles
for each row execute function public.on_profile_created_wallet();

-- ───────────────────────── INVENTORY ─────────────────────────

-- Adds a component: new → level 1, owned already → one more spare for upgrades.
create or replace function public.game_grant(p_user uuid, p_component text) returns jsonb
language plpgsql set search_path = public as $$
declare
  v_row inventory;
begin
  select * into v_row from inventory where user_id = p_user and component_id = p_component for update;
  if found then
    update inventory set spare = spare + 1, updated_at = now() where user_id = p_user and component_id = p_component returning * into v_row;
    return jsonb_build_object('duplicate', true, 'level', v_row.level, 'spare', v_row.spare);
  end if;
  insert into inventory (user_id, component_id) values (p_user, p_component) returning * into v_row;
  return jsonb_build_object('duplicate', false, 'level', 1, 'spare', 0);
end $$;

create or replace function public.game_buy(p_user uuid, p_component text, p_price integer) returns jsonb
language plpgsql set search_path = public as $$
declare
  v_balance bigint;
begin
  if p_price < 0 then raise exception 'BAD_PRICE'; end if;
  v_balance := game_apply(p_user, -p_price, 'purchase', p_component, jsonb_build_object('price', p_price));
  return game_grant(p_user, p_component) || jsonb_build_object('balance', v_balance);
end $$;

-- Fuses one spare copy into the component: level + 1.
create or replace function public.game_upgrade(p_user uuid, p_component text, p_max_level integer) returns integer
language plpgsql set search_path = public as $$
declare
  v_level integer;
begin
  update inventory set level = level + 1, spare = spare - 1, updated_at = now()
  where user_id = p_user and component_id = p_component and spare > 0 and level < p_max_level
  returning level into v_level;
  if v_level is null then
    raise exception 'NO_UPGRADE_AVAILABLE' using errcode = 'P0001';
  end if;
  return v_level;
end $$;

-- Buys any missing parts and installs the rig in one transaction.
-- p_buy: [{ "id": text, "price": int }]   p_rig: computed rig row (score etc.)
create or replace function public.game_install(p_user uuid, p_buy jsonb, p_rig jsonb) returns bigint
language plpgsql set search_path = public as $$
declare
  v_item jsonb;
  v_part text;
  v_balance bigint;
begin
  for v_item in select * from jsonb_array_elements(coalesce(p_buy, '[]'::jsonb)) loop
    -- Never charge twice for a part that became owned in the meantime.
    if not exists (select 1 from inventory where user_id = p_user and component_id = v_item ->> 'id') then
      perform game_buy(p_user, v_item ->> 'id', (v_item ->> 'price')::integer);
    end if;
  end loop;
  for v_part in select value from jsonb_each_text(p_rig -> 'parts') loop
    if not exists (select 1 from inventory where user_id = p_user and component_id = v_part) then
      raise exception 'PART_NOT_OWNED: %', v_part using errcode = 'P0001';
    end if;
  end loop;
  perform game_save_rig(p_user, p_rig);
  select credits into v_balance from wallets where user_id = p_user;
  return v_balance;
end $$;

create or replace function public.game_save_rig(p_user uuid, p_rig jsonb) returns void
language plpgsql set search_path = public as $$
begin
  insert into rigs (user_id, parts, levels, score, rarity, pc_level, value, power, stats, updated_at)
  values (p_user, p_rig -> 'parts', p_rig -> 'levels', (p_rig ->> 'score')::int, p_rig ->> 'rarity', (p_rig ->> 'pc_level')::int,
          (p_rig ->> 'value')::int, (p_rig ->> 'power')::int, p_rig -> 'stats', now())
  on conflict (user_id) do update set
    parts = excluded.parts, levels = excluded.levels, score = excluded.score, rarity = excluded.rarity, pc_level = excluded.pc_level,
    value = excluded.value, power = excluded.power, stats = excluded.stats, updated_at = now();
end $$;

-- ───────────────────────── DAILY ─────────────────────────

create or replace function public.game_checkin(p_user uuid, p_day date, p_rewards integer[]) returns jsonb
language plpgsql set search_path = public as $$
declare
  v_prev integer;
  v_streak integer;
  v_reward integer;
  v_balance bigint;
begin
  if exists (select 1 from checkins where user_id = p_user and day = p_day) then
    raise exception 'ALREADY_CHECKED_IN' using errcode = 'P0001';
  end if;
  select streak into v_prev from checkins where user_id = p_user and day = p_day - 1;
  v_streak := coalesce(v_prev, 0) + 1;
  v_reward := p_rewards[((v_streak - 1) % array_length(p_rewards, 1)) + 1];
  insert into checkins (user_id, day, streak, reward) values (p_user, p_day, v_streak, v_reward);
  v_balance := game_apply(p_user, v_reward, 'checkin', p_day::text, jsonb_build_object('streak', v_streak));
  return jsonb_build_object('streak', v_streak, 'reward', v_reward, 'balance', v_balance);
end $$;

-- The reward is rolled by the server; this only records it once per day and pays out.
create or replace function public.game_spin(p_user uuid, p_day date, p_reward jsonb) returns jsonb
language plpgsql set search_path = public as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_balance bigint;
begin
  insert into roulette_spins (user_id, day, reward) values (p_user, p_day, p_reward);
  if p_reward ->> 'type' = 'credits' then
    v_balance := game_apply(p_user, (p_reward ->> 'amount')::bigint, 'roulette', p_day::text, p_reward);
    v_result := jsonb_build_object('balance', v_balance);
  else
    v_result := game_grant(p_user, p_reward ->> 'componentId');
  end if;
  return v_result;
exception when unique_violation then
  raise exception 'ALREADY_SPUN' using errcode = 'P0001';
end $$;

-- ───────────────────────── BATTLES ─────────────────────────

-- p_battle: the full battle row computed by the server. p_cfg: reward tuning.
create or replace function public.game_record_battle(p_user uuid, p_day date, p_battle jsonb, p_cfg jsonb) returns jsonb
language plpgsql set search_path = public as $$
declare
  v_stats battle_stats;
  v_won boolean := (p_battle ->> 'won')::boolean;
  v_streak integer;
  v_rewarded boolean;
  v_credits integer := 0;
  v_points integer;
  v_bonus integer := 0;
  v_id uuid;
  v_balance bigint;
begin
  insert into battle_stats (user_id) values (p_user) on conflict (user_id) do nothing;
  select * into v_stats from battle_stats where user_id = p_user for update;
  if v_stats.last_battle_at is not null and v_stats.last_battle_at > now() - make_interval(secs => (p_cfg ->> 'cooldownSeconds')::int) then
    raise exception 'BATTLE_COOLDOWN' using errcode = 'P0001';
  end if;

  v_streak := case when v_won then v_stats.streak + 1 else 0 end;
  v_rewarded := coalesce(v_stats.rewarded_day = p_day and v_stats.rewarded_count >= (p_cfg ->> 'rewardedPerDay')::int, false) = false;
  v_points := case when v_won then (p_cfg ->> 'winPoints')::int else (p_cfg ->> 'lossPoints')::int end;
  if v_rewarded then
    v_credits := case when v_won then (p_cfg ->> 'winCredits')::int else (p_cfg ->> 'lossCredits')::int end;
    if v_won then v_bonus := coalesce((p_cfg -> 'streakBonus' ->> v_streak::text)::int, 0); end if;
    v_credits := v_credits + v_bonus;
  end if;

  update battle_stats set
    wins = wins + (case when v_won then 1 else 0 end),
    losses = losses + (case when v_won then 0 else 1 end),
    streak = v_streak,
    best_streak = greatest(best_streak, v_streak),
    points = points + v_points,
    rewarded_count = case when v_rewarded then (case when rewarded_day = p_day then rewarded_count + 1 else 1 end) else rewarded_count end,
    rewarded_day = case when v_rewarded then p_day else rewarded_day end,
    last_battle_at = now()
  where user_id = p_user;

  insert into battles (user_id, opponent_id, opponent_bot, opponent_name, opponent_avatar, my_score, opp_score, my_total, opp_total,
                       breakdown, won, credits, points, streak, my_rig, opp_rig)
  values (p_user, nullif(p_battle ->> 'opponent_id', '')::uuid, p_battle ->> 'opponent_bot', p_battle ->> 'opponent_name',
          coalesce(p_battle ->> 'opponent_avatar', 'bot'), (p_battle ->> 'my_score')::int, (p_battle ->> 'opp_score')::int,
          (p_battle ->> 'my_total')::numeric, (p_battle ->> 'opp_total')::numeric, p_battle -> 'breakdown', v_won,
          v_credits, v_points, v_streak, p_battle -> 'my_rig', p_battle -> 'opp_rig')
  returning id into v_id;

  if v_credits > 0 then
    v_balance := game_apply(p_user, v_credits, 'battle', v_id::text, jsonb_build_object('won', v_won, 'streakBonus', v_bonus));
  end if;
  return jsonb_build_object('id', v_id, 'credits', v_credits, 'points', v_points, 'streak', v_streak, 'streakBonus', v_bonus, 'rewarded', v_rewarded);
end $$;

-- ───────────────────────── PERMISSIONS ─────────────────────────

revoke execute on function
  public.game_apply(uuid, bigint, text, text, jsonb),
  public.game_grant(uuid, text),
  public.game_buy(uuid, text, integer),
  public.game_upgrade(uuid, text, integer),
  public.game_install(uuid, jsonb, jsonb),
  public.game_save_rig(uuid, jsonb),
  public.game_checkin(uuid, date, integer[]),
  public.game_spin(uuid, date, jsonb),
  public.game_record_battle(uuid, date, jsonb, jsonb)
from public, anon, authenticated;
grant execute on function
  public.game_apply(uuid, bigint, text, text, jsonb),
  public.game_grant(uuid, text),
  public.game_buy(uuid, text, integer),
  public.game_upgrade(uuid, text, integer),
  public.game_install(uuid, jsonb, jsonb),
  public.game_save_rig(uuid, jsonb),
  public.game_checkin(uuid, date, integer[]),
  public.game_spin(uuid, date, jsonb),
  public.game_record_battle(uuid, date, jsonb, jsonb)
to service_role;

-- Existing players get the same starting balance as new ones.
insert into public.wallets (user_id) select id from public.profiles on conflict do nothing;
do $$
declare r record;
begin
  for r in select p.id from public.profiles p
           where not exists (select 1 from public.credit_transactions t where t.user_id = p.id and t.kind = 'starting') loop
    perform public.game_apply(r.id, 5000, 'starting', 'starting', '{}'::jsonb);
  end loop;
end $$;
