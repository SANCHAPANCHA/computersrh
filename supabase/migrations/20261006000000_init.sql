-- RH PC LAB schema. Unofficial community project, off-chain only.

-- ───────────────────────── TABLES ─────────────────────────

create table public.components (
  id text primary key,
  name text not null,
  category text not null check (category in ('case','cpu','gpu','motherboard','ram','storage','psu','cooling','monitor','keyboard','mouse')),
  rarity text not null check (rarity in ('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC')),
  price integer not null check (price >= 0),
  performance integer not null check (performance between 0 and 100),
  power integer not null check (power >= 0),
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb
);
create index components_category_idx on public.components (category);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[a-z0-9_]{3,20}$'),
  avatar text not null default 'bot' check (char_length(avatar) <= 32),
  bio text not null default '' check (char_length(bio) <= 160),
  favorite_component text references public.components (id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index profiles_username_key on public.profiles (lower(username));

create table public.builds (
  id uuid primary key default gen_random_uuid(),
  build_number bigint generated always as identity unique,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 32),
  score integer not null check (score between 0 and 100),
  rarity text not null check (rarity in ('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC')),
  value integer not null check (value >= 0),
  power integer not null check (power >= 0),
  rgb text not null default 'mint' check (rgb in ('mint','pink','violet','gold','ice','red','off')),
  chaos_mode boolean not null default false,
  build_time_seconds integer check (build_time_seconds >= 0),
  likes_count integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index builds_user_idx on public.builds (user_id, created_at desc);
create index builds_public_new_idx on public.builds (created_at desc) where is_public;
create index builds_public_score_idx on public.builds (score desc, created_at desc) where is_public;
create index builds_public_likes_idx on public.builds (likes_count desc, created_at desc) where is_public;
create index builds_rarity_idx on public.builds (rarity) where is_public;

create table public.build_components (
  id bigint generated always as identity primary key,
  build_id uuid not null references public.builds (id) on delete cascade,
  component_id text not null references public.components (id),
  category text not null,
  unique (build_id, category)
);
create index build_components_component_idx on public.build_components (component_id);

create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  build_id uuid not null references public.builds (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, build_id)
);
create index likes_build_idx on public.likes (build_id);

create table public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  requirement_type text not null check (requirement_type in ('builds_count','best_score','min_rarity','likes_received','speedrun')),
  requirement_value integer not null
);

create table public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table public.daily_challenges (
  id text primary key,
  title text not null,
  description text not null default '',
  rules jsonb not null default '{}'::jsonb,
  start_date date not null,
  end_date date not null,
  check (end_date >= start_date)
);
create index daily_challenges_dates_idx on public.daily_challenges (start_date, end_date);

create table public.challenge_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null references public.daily_challenges (id) on delete cascade,
  build_id uuid not null references public.builds (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (challenge_id, user_id)
);
create index challenge_entries_challenge_idx on public.challenge_entries (challenge_id);
create index challenge_entries_build_idx on public.challenge_entries (build_id);

-- ───────────────────────── VIEWS ─────────────────────────

create view public.leaderboard with (security_invoker = true) as
select
  p.id,
  p.username,
  p.avatar,
  count(b.id)::int as builds_count,
  coalesce(max(b.score), 0)::int as best_score,
  coalesce(sum(b.likes_count), 0)::int as total_likes
from public.profiles p
join public.builds b on b.user_id = p.id and b.is_public
group by p.id;

-- ───────────────────────── FUNCTIONS & TRIGGERS ─────────────────────────

create or replace function public.rarity_rank(r text) returns int
language sql immutable as $$
  select array_position(array['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC'], r) - 1
$$;

-- New auth user → public profile with a fun, unique username.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  wanted text := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
  adjectives text[] := array['pixel','turbo','neon','retro','byte','quantum','frosty','cosmic','chunky','glitch'];
  nouns text[] := array['builder','smith','wizard','pilot','tinker','ranger','modder','overclock','tech','rig'];
  candidate text;
  tries int := 0;
begin
  if wanted ~ '^[a-z0-9_]{3,20}$' and not exists (select 1 from profiles where lower(username) = wanted) then
    candidate := wanted;
  else
    loop
      candidate := adjectives[1 + floor(random() * 10)::int] || nouns[1 + floor(random() * 10)::int] || (10 + floor(random() * 990)::int)::text;
      exit when not exists (select 1 from profiles where lower(username) = candidate) or tries > 20;
      tries := tries + 1;
    end loop;
  end if;
  insert into profiles (id, username, avatar) values (new.id, candidate, coalesce(nullif(new.raw_user_meta_data ->> 'avatar', ''), 'bot'));
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Clients may only change name / visibility; stats and counters are system-owned.
create or replace function public.guard_build_write() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.likes_count := 0;
    else
      new.user_id := old.user_id;
      new.score := old.score;
      new.rarity := old.rarity;
      new.value := old.value;
      new.power := old.power;
      new.chaos_mode := old.chaos_mode;
      new.build_time_seconds := old.build_time_seconds;
      new.likes_count := old.likes_count;
      new.created_at := old.created_at;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger builds_guard
before insert or update on public.builds
for each row execute function public.guard_build_write();

create or replace function public.refresh_achievements(target uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_builds int;
  v_best int;
  v_rank int;
  v_fastest int;
  v_likes int;
begin
  select count(*), coalesce(max(score), 0), coalesce(max(rarity_rank(rarity)), -1),
         coalesce(min(build_time_seconds) filter (where not chaos_mode), 2147483647)
    into v_builds, v_best, v_rank, v_fastest
    from builds where user_id = target;
  select coalesce(sum(likes_count), 0) into v_likes from builds where user_id = target;

  insert into user_achievements (user_id, achievement_id)
  select target, a.id from achievements a
  where (a.requirement_type = 'builds_count' and v_builds >= a.requirement_value)
     or (a.requirement_type = 'best_score' and v_best >= a.requirement_value)
     or (a.requirement_type = 'min_rarity' and v_rank >= a.requirement_value)
     or (a.requirement_type = 'likes_received' and v_likes >= a.requirement_value)
     or (a.requirement_type = 'speedrun' and v_fastest <= a.requirement_value)
  on conflict do nothing;
end $$;
revoke execute on function public.refresh_achievements(uuid) from public, anon, authenticated;

create or replace function public.on_build_inserted() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform refresh_achievements(new.user_id);
  return new;
end $$;

create trigger builds_achievements
after insert on public.builds
for each row execute function public.on_build_inserted();

create or replace function public.on_like_changed() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
begin
  if tg_op = 'INSERT' then
    update builds set likes_count = likes_count + 1 where id = new.build_id returning user_id into owner;
    if owner is not null then perform refresh_achievements(owner); end if;
    return new;
  else
    update builds set likes_count = greatest(likes_count - 1, 0) where id = old.build_id;
    return old;
  end if;
end $$;

create trigger likes_counter
after insert or delete on public.likes
for each row execute function public.on_like_changed();

-- Lets a signed-in user permanently delete their own account (cascades everything).
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ───────────────────────── ROW LEVEL SECURITY ─────────────────────────

alter table public.components enable row level security;
alter table public.profiles enable row level security;
alter table public.builds enable row level security;
alter table public.build_components enable row level security;
alter table public.likes enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.challenge_entries enable row level security;

create policy "components are public" on public.components for select using (true);
create policy "achievements are public" on public.achievements for select using (true);
create policy "challenges are public" on public.daily_challenges for select using (true);
create policy "unlocked achievements are public" on public.user_achievements for select using (true);

-- Profiles hold only public fields (no email). Rows are created by trigger.
create policy "profiles are public" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "public builds or own builds" on public.builds for select
  using (is_public or auth.uid() = user_id);
create policy "users create own builds" on public.builds for insert
  with check (auth.uid() = user_id);
create policy "users update own builds" on public.builds for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own builds" on public.builds for delete
  using (auth.uid() = user_id);

create policy "parts of visible builds" on public.build_components for select
  using (exists (select 1 from public.builds b where b.id = build_id and (b.is_public or b.user_id = auth.uid())));
create policy "users add parts to own builds" on public.build_components for insert
  with check (exists (select 1 from public.builds b where b.id = build_id and b.user_id = auth.uid()));
create policy "users remove parts from own builds" on public.build_components for delete
  using (exists (select 1 from public.builds b where b.id = build_id and b.user_id = auth.uid()));

create policy "likes on public builds are public" on public.likes for select
  using (auth.uid() = user_id or exists (select 1 from public.builds b where b.id = build_id and b.is_public));
create policy "users like public builds" on public.likes for insert
  with check (auth.uid() = user_id and exists (select 1 from public.builds b where b.id = build_id and b.is_public));
create policy "users remove own likes" on public.likes for delete
  using (auth.uid() = user_id);

create policy "entries are public" on public.challenge_entries for select using (true);
create policy "users enter active challenges with own builds" on public.challenge_entries for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.builds b where b.id = build_id and b.user_id = auth.uid() and b.is_public)
    and exists (select 1 from public.daily_challenges c where c.id = challenge_id and current_date between c.start_date and c.end_date)
  );
create policy "users withdraw own entries" on public.challenge_entries for delete
  using (auth.uid() = user_id);

-- ───────────────────────── GRANTS ─────────────────────────

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (username, avatar, bio, favorite_component) on public.profiles to authenticated;
grant insert, update, delete on public.builds to authenticated;
grant insert, delete on public.build_components, public.likes, public.challenge_entries to authenticated;
