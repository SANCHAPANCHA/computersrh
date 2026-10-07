-- Live chat, chat sanctions (progressive mute → permanent chat ban) and forum write lockdown.
-- Every write goes through server actions using the service role; clients can only read.

-- ───────────────────────── TABLES ─────────────────────────

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Denormalised so realtime payloads render without extra queries.
  username text not null,
  avatar text not null,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  was_censored boolean not null default false,
  created_at timestamptz not null default now()
);
create index chat_messages_created_idx on public.chat_messages (created_at desc);
create index chat_messages_user_idx on public.chat_messages (user_id, created_at desc);

create table public.chat_sanctions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  violation_count integer not null default 0,
  muted_until timestamptz,
  permanently_banned boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Stores the censored text only, never the original.
create table public.chat_violations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source text not null check (source in ('chat', 'forum_thread', 'forum_reply')),
  message_id uuid references public.chat_messages (id) on delete set null,
  source_id uuid,
  reason text not null,
  censored_text text not null,
  punishment text not null check (punishment in ('mute_1h', 'mute_24h', 'permanent')),
  created_at timestamptz not null default now()
);
create index chat_violations_user_idx on public.chat_violations (user_id, created_at desc);

-- ───────────────────────── ACCESS ─────────────────────────

alter table public.chat_messages enable row level security;
alter table public.chat_sanctions enable row level security;
alter table public.chat_violations enable row level security;

create policy "chat is public" on public.chat_messages for select using (true);
create policy "see own sanctions" on public.chat_sanctions for select using (auth.uid() = user_id);
create policy "see own violations" on public.chat_violations for select using (auth.uid() = user_id);

-- No insert/update/delete policies or grants for clients: only the service role writes.
revoke all on public.chat_messages, public.chat_sanctions, public.chat_violations from anon, authenticated;
grant select on public.chat_messages to anon, authenticated;
grant select on public.chat_sanctions, public.chat_violations to authenticated;
grant all on public.chat_messages, public.chat_sanctions, public.chat_violations to service_role;

-- The forum filter must not be bypassable through the REST API either.
revoke insert on public.forum_threads, public.forum_replies from authenticated;

-- ───────────────────────── GUARD ─────────────────────────

-- Applies to every role, service role included: muted/banned users cannot post, and
-- messages are rate limited (1 per 2 s per user; the advisory lock serialises a user's inserts).
create or replace function public.guard_chat_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  s public.chat_sanctions;
begin
  perform pg_advisory_xact_lock(hashtextextended('chat:' || new.user_id::text, 0));
  select * into s from chat_sanctions where user_id = new.user_id;
  if found and (s.permanently_banned or (s.muted_until is not null and s.muted_until > now())) then
    raise exception 'CHAT_MUTED' using errcode = 'P0001';
  end if;
  if exists (select 1 from chat_messages where user_id = new.user_id and created_at > now() - interval '2 seconds') then
    raise exception 'Slow down: one message every 2 seconds.' using errcode = 'P0001';
  end if;
  new.created_at := now();
  return new;
end $$;

create trigger chat_messages_guard
before insert on public.chat_messages
for each row execute function public.guard_chat_message();

-- ───────────────────────── PUNISHMENT LADDER ─────────────────────────

-- Atomically records a violation and escalates: 1st → 1 hour, 2nd → 24 hours, 3rd+ → permanent.
-- Keep in sync with lib/moderation/sanctions.ts.
create or replace function public.chat_apply_violation(
  p_user uuid, p_source text, p_source_id uuid, p_message_id uuid, p_reason text, p_censored text
) returns table (violation_count integer, muted_until timestamptz, permanently_banned boolean, punishment text)
language plpgsql security definer set search_path = public as $$
declare
  n integer;
  pun text;
  until_ts timestamptz;
begin
  insert into chat_sanctions (user_id) values (p_user) on conflict (user_id) do nothing;
  select s.violation_count + 1 into n from chat_sanctions s where s.user_id = p_user for update;
  pun := case when n <= 1 then 'mute_1h' when n = 2 then 'mute_24h' else 'permanent' end;
  until_ts := case pun when 'mute_1h' then now() + interval '1 hour' when 'mute_24h' then now() + interval '24 hours' else null end;

  update chat_sanctions s
    set violation_count = n,
        muted_until = until_ts,
        permanently_banned = (pun = 'permanent'),
        updated_at = now()
    where s.user_id = p_user;

  insert into chat_violations (user_id, source, source_id, message_id, reason, censored_text, punishment)
  values (p_user, p_source, p_source_id, p_message_id, left(p_reason, 200), left(p_censored, 2000), pun);

  return query select n, until_ts, (pun = 'permanent'), pun;
end $$;

revoke execute on function public.chat_apply_violation(uuid, text, uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.chat_apply_violation(uuid, text, uuid, uuid, text, text) to service_role;
revoke execute on function public.guard_chat_message() from public, anon, authenticated;

-- ───────────────────────── REALTIME ─────────────────────────

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;
