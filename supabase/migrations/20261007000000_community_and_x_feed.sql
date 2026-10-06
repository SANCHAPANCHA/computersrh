-- Community board (threads + replies) and a stored copy of @ComputersRh posts.

-- ───────────────────────── COMMUNITY ─────────────────────────

create table public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('news', 'builds', 'help', 'offtopic')),
  title text not null check (char_length(btrim(title)) between 3 and 90),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  x_url text check (x_url ~ '^https://(x|twitter)\.com/[A-Za-z0-9_]{1,15}/status/[0-9]{1,25}$'),
  build_id uuid references public.builds (id) on delete set null,
  reply_count integer not null default 0,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index forum_threads_activity_idx on public.forum_threads (last_activity_at desc);
create index forum_threads_category_idx on public.forum_threads (category, last_activity_at desc);
create index forum_threads_user_idx on public.forum_threads (user_id);

create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index forum_replies_thread_idx on public.forum_replies (thread_id, created_at);
create index forum_replies_user_idx on public.forum_replies (user_id, created_at desc);

-- Clients can't forge counters/timestamps, and posting is rate limited.
-- Not security definer: current_user must be the caller's role.
create or replace function public.guard_forum_thread() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') then
    if exists (select 1 from forum_threads where user_id = new.user_id and created_at > now() - interval '60 seconds') then
      raise exception 'Slow down: one new topic per minute.' using errcode = 'P0001';
    end if;
    new.reply_count := 0;
    new.created_at := now();
    new.last_activity_at := now();
  end if;
  return new;
end $$;

create trigger forum_threads_guard
before insert on public.forum_threads
for each row execute function public.guard_forum_thread();

-- Not security definer: current_user must be the caller's role.
create or replace function public.guard_forum_reply() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') then
    if exists (select 1 from forum_replies where user_id = new.user_id and created_at > now() - interval '8 seconds') then
      raise exception 'Slow down: wait a few seconds between messages.' using errcode = 'P0001';
    end if;
    new.created_at := now();
  end if;
  return new;
end $$;

create trigger forum_replies_guard
before insert on public.forum_replies
for each row execute function public.guard_forum_reply();

create or replace function public.on_forum_reply_changed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update forum_threads set reply_count = reply_count + 1, last_activity_at = new.created_at where id = new.thread_id;
    return new;
  else
    update forum_threads set reply_count = greatest(reply_count - 1, 0) where id = old.thread_id;
    return old;
  end if;
end $$;

create trigger forum_replies_counter
after insert or delete on public.forum_replies
for each row execute function public.on_forum_reply_changed();

alter table public.forum_threads enable row level security;
alter table public.forum_replies enable row level security;

create policy "topics are public" on public.forum_threads for select using (true);
create policy "users start own topics" on public.forum_threads for insert
  with check (auth.uid() = user_id and (build_id is null or exists (select 1 from public.builds b where b.id = build_id and b.is_public)));
create policy "users delete own topics" on public.forum_threads for delete using (auth.uid() = user_id);

create policy "replies are public" on public.forum_replies for select using (true);
create policy "users reply as themselves" on public.forum_replies for insert with check (auth.uid() = user_id);
create policy "users delete own replies" on public.forum_replies for delete using (auth.uid() = user_id);

grant select on public.forum_threads, public.forum_replies to anon, authenticated;
grant insert, delete on public.forum_threads, public.forum_replies to authenticated;

-- Live chat: stream new replies and topics to subscribed browsers.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.forum_replies, public.forum_threads;
  end if;
end $$;

-- ───────────────────────── X FEED ─────────────────────────
-- Written only by the server (service role) from the X API; read by everyone.

create table public.x_posts (
  id text primary key,
  username text not null,
  text text not null,
  posted_at timestamptz not null,
  media jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now()
);
create index x_posts_user_time_idx on public.x_posts (username, posted_at desc);

create table public.x_feed_state (
  username text primary key,
  user_id text,
  since_id text,
  checked_at timestamptz not null default 'epoch'
);

alter table public.x_posts enable row level security;
alter table public.x_feed_state enable row level security;
create policy "x posts are public" on public.x_posts for select using (true);
-- x_feed_state has no policies: only the service role can touch it.
revoke all on public.x_feed_state from anon, authenticated;

-- Atomically claim the right to poll X (one poller per interval across all servers).
create or replace function public.claim_x_poll(p_username text, p_interval_seconds int) returns table (user_id text, since_id text)
language plpgsql security definer set search_path = public as $$
begin
  insert into x_feed_state (username) values (lower(p_username)) on conflict (username) do nothing;
  return query
    update x_feed_state s set checked_at = now()
    where s.username = lower(p_username) and s.checked_at < now() - make_interval(secs => p_interval_seconds)
    returning s.user_id, s.since_id;
end $$;
revoke execute on function public.claim_x_poll(text, int) from public, anon, authenticated;
