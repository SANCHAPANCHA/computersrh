# RH PC LAB

**BUILD YOUR DREAM RIG.** Build. Customize. Score. Share.

A retro pixel-art PC-building game and community platform. Pick fictional parts, watch your rig come together, fight the compatibility engine (or switch on Chaos Mode), boot it up, get a 0–100 score, then save it with an email account and share it on X.

> An unofficial community-made project inspired by [Computers RH](https://www.computersrh.xyz/).
> Not affiliated with or endorsed by Computers RH or Robinhood. Off-chain web app; there are no wallets, tokens or NFTs.

## Features

- **Builder (no account needed):** 11 steps (case → mouse), 136 fictional parts across 6 rarities (11–17 choices per step), sort by rarity, price or performance, rarity filters and a "compatible only" toggle. The live pixel-art visualizer changes with the case, GPU, cooler, RAM, monitor, keyboard, mouse and RGB colour. Drafts autosave to the browser.
- **Compatibility engine:** CPU↔motherboard socket, RAM type and capacity, case↔motherboard form factor, GPU length↔case, cooler socket, cooler height and radiator size↔case, NVMe↔M.2 slots, PSU capacity and headroom, plus cooler TDP warnings. Each conflict shows a `⚠ HARDWARE CONFLICT` card with the exact reason.
- **Chaos Mode:** turns the rules off. Conflicts cost score points.
- **Scoring:** 0–100 from compute, graphics, memory, storage, thermals, efficiency and CPU/GPU balance. Rig rarity comes from the score. Also shows a fictional value and power draw/headroom.
- **Boot sequence → final reveal:** a skippable retro POST screen, then a count-up score, rarity badge and stat bars.
- **Share card:** a 1200×630 PNG generated server-side with `next/og`. Download it, or share on X with a prefilled intent (nothing posts automatically). Unsaved rigs get a `/share?parts=…` link; saved rigs get `/build/[id]` with an OG image.
- **Accounts (Supabase, email only):** register, log in, email verification, forgot/reset password, log out, persistent sessions. If you click *Save build* while logged out, you sign up inside the modal and the build saves automatically, including after email verification (the build waits in localStorage and `/save` finishes the job).
- **Community:** public build pages, likes (one per user, with an animation), Explore tabs (Newest, Top score, Most liked, Legendary), leaderboards (Top score, Most builds, Most liked), profiles at `/u/[username]`, a dashboard, settings (username, 10 pixel avatars, bio, favourite part, password, delete account).
- **Game loop (accounts):** every player starts with the **same 5,000 credits**, builds their own main PC in the builder's "My PC" mode (`/builder?mode=rig`), then keeps upgrading it. The loop: daily check-in → credits, buy parts in `/shop`, buy or win duplicates and fuse them in `/inventory` (LV1–LV5, stats grow per category), PC level (STARTER → LEGENDARY), PC battles, repeat tomorrow. Mythic parts can only be won in the roulette.
- **Daily (`/daily`):** check-in with a 7-day streak (250 → 300 → 350 → 400 → 500 → 600 → 1000, a missed day resets to Day 1) and one free roulette spin per day (credits or parts of any rarity, drop rates shown on the page). Results are rolled on the server, and the reel animation spins up, slows down and stops on the prize.
- **PC Battles (`/battles`):** matchmaking against a real player within ±8 score, widening to ±15/±25 when nobody is close, with lab bots as the last fallback. The fight compares CPU, GPU, memory, thermals, power and balance, each with a small random swing. Rewards: win +150 / loss +30 credits for the first 10 battles each day, battle points, and win-streak bonuses at 3/5/10. A 10 s cooldown applies, and every battle is saved to the history.
- **Credits ledger:** every credit movement (starting balance, check-in, roulette, purchases, battles, challenge rewards) is a row in `credit_transactions`, shown on the dashboard. Daily challenge entries pay +200 once per challenge.
- **Forum + LIVE CHAT (`/forum`, `/community` redirects):** topics (NEWS / BUILDS / HELP / OFF-TOPIC) plus a global real-time chat room with an ONLINE counter (Supabase Realtime + Presence).
- **Chat moderation:** server-side censor (English + Russian) that catches mixed case, s p a c e d / d.o.t.t.e.d letters, repeated letters, leetspeak and Latin/Cyrillic look-alikes. Bad words are published as `***` and every violation is recorded. Punishment ladder (chat only, not an account ban): 1st violation 1 hour mute, 2nd 24 hours, 3rd permanent chat ban. Forum posts are censored too and count toward the same ladder. Word lists live in `data/moderation.ts`.
- **X NEWS (`/news` + home block):** a separate block for @ComputersRh posts. Each item shows the date, text, image, original link and a VIEW ON X button. See [X News setup](#x-news-setup).
- **Achievements:** 8 achievements unlocked by database triggers, with toasts on save.
- **Daily challenges:** 7 data-driven rule templates rotating daily (budget, power cap, case size, rarity cap, RAM, required parts). Entries are validated on the server.
- **Polish:** responsive layout with a sticky mobile step bar, reduced-motion support, keyboard focus styles, ARIA labels, and optional WebAudio SFX (muted by default, toggle in the header).

## Tech

Next.js 16 (App Router, Server Actions, `proxy.ts`), React 19, TypeScript, Tailwind CSS v4, Supabase (Auth + Postgres + RLS). Fonts (Pixelify Sans, Silkscreen, Space Mono; SIL OFL) are self-hosted in `assets/fonts`.

## File structure

```
app/                      routes (landing, builder, build/[id], share, explore, leaderboard,
                          challenges, achievements, dashboard, u/[username], settings, auth pages,
                          privacy, terms, api/card, auth/callback, not-found, error, loading)
components/
  ui/                     design system: RetroWindow, PixelButton, PixelInput/Select/Textarea,
                          PixelBadge, PixelProgressBar, PixelCard/StatBox, PixelModal, PixelToast,
                          PixelTabs, PixelIcon, PixelAvatar, States (empty/loading/error)
  layout/                 header, nav, mobile menu, footer, sky backdrop, sound toggle
  builder/                Builder, step strip, part cards, live panel, boot, reveal, save/share modals
  pc/                     PcVisualizer (pure SVG), PartVisual, BuildCard, BuildDetail, ScoreBars
  community/ account/ auth/ home/
lib/
  pc-engine/              game logic, no UI: catalog, compatibility, power, scoring, rarity,
                          value, validation, challenges, encode, specs (+ engine.test.ts)
  db/                     Supabase queries (server) and server actions
  supabase/               browser/server clients, session proxy, config
  share-card.tsx          next/og share-card renderer
data/                     components, achievements, challenge templates, presets, avatars
types/                    shared types
supabase/migrations/      schema + RLS, generated seed data
scripts/generate-seed.ts  regenerates the seed migration from data/*.ts
app/globals.css           design tokens + retro component styles
```

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in Supabase values (optional for the builder)
npm run dev                     # http://localhost:3000
```

The builder, scoring, boot sequence, reveal, share card and share links all work **without Supabase**. Account and community pages show a "community offline" notice until you connect it.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types + `tsc` |
| `npm test` | Game-engine tests (compatibility, scoring, presets, challenges) |
| `npm run db:seed:generate` | Rebuild the latest game-data migration from `data/` |

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Run the SQL.** Either:
   - **SQL editor:** run every file in `supabase/migrations/` **in filename order** (`20261006000000_init.sql` → … → `20261008000500_chat_moderation.sql`, 7 files). If you already ran the earlier ones, run only the new ones (`20261008000000_economy.sql`, `20261008000100_game_data_v3.sql`, `20261008000500_chat_moderation.sql`). Seed files are safe to re-run; or
   - **CLI:** `npx supabase link --project-ref <ref>` then `npx supabase db push`.
3. **Auth → URL configuration:** set *Site URL* to your deployed URL (e.g. `https://rhpclab.vercel.app`) and add `https://<your-domain>/auth/callback` (plus `http://localhost:3000/auth/callback` for local dev) to *Redirect URLs*.
4. **Auth → Providers → Email:** keep it enabled. "Confirm email" can be on (recommended) or off. Both flows are supported.
5. **Settings → API:** copy the Project URL and the anon/publishable key into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://rhpclab.vercel.app   # optional, used in share links
```

Supabase's built-in email sender is heavily rate-limited. For a public launch, configure custom SMTP under *Auth → SMTP settings*.

**Local Supabase (optional, needs Docker):** `npx supabase start` applies the migrations automatically and prints a local URL and anon key.

### Database overview

Tables: `profiles`, `components`, `builds`, `build_components`, `likes`, `achievements`, `user_achievements`, `daily_challenges`, `challenge_entries`, `forum_threads`, `forum_replies`, `x_posts`, `x_feed_state`, `game_config`, `wallets`, `credit_transactions`, `checkins`, `roulette_spins`, `inventory`, `rigs`, `battle_stats`, `battles`, `chat_messages`, `chat_sanctions`, `chat_violations`, plus a `leaderboard` view.

**Game security model:** players can only *read* their own game rows. Every credit, purchase, upgrade, spin, battle and chat message is decided by a Next.js Server Action (session checked, prices, rolls and scores computed on the server). It is then written through `game_*` / `chat_*` Postgres functions that only the **service role** can execute. Those functions are atomic, keep balances from going below 0, and allow one check-in and one spin per UTC day. A database trigger also blocks muted users. DevTools edits or direct REST calls get `permission denied`.

**Retuning the economy live:** edit the `economy` row in the `game_config` table (starting credits, check-in rewards, roulette weights, upgrade growth, battle rewards, PC level thresholds). Defaults live in `data/economy.ts`.

## X News setup

The news block has three modes and picks them automatically:

1. **API:** `X_BEARER_TOKEN` is set, so new posts are mirrored automatically (see below).
2. **Database (no API needed):** add posts as rows in `x_posts` from Supabase → SQL editor (or the Table Editor):

```sql
insert into public.x_posts (id, username, text, posted_at, media, metrics)
values ('1234567890123456789', 'ComputersRh', 'Post text here', '2026-10-07 12:00:00+00',
        '[{"type":"photo","url":"https://pbs.twimg.com/media/XXXX.jpg","alt":"description"}]'::jsonb, '{}'::jsonb);
```
   `id` is the number from the post URL (`x.com/ComputersRh/status/<id>`), which builds the VIEW ON X link. Use `'[]'::jsonb` for posts without images.
3. **Embed:** no token and no rows, so X's official embedded timeline is shown.

## Live X feed setup

X's free API tier can't read posts, so there are two modes:

| Mode | When | What visitors see |
| --- | --- | --- |
| **Mirrored (recommended)** | `X_BEARER_TOKEN` + `SUPABASE_SERVICE_ROLE_KEY` set | Posts in the lab's own retro cards (text, images, likes), a NEW badge on fresh posts, and Discuss buttons. Posts are stored in `x_posts`. |
| **Embed fallback** | no token | X's official embedded timeline plus an "Open @ComputersRh on X" button. Free, but X often shows nothing to logged-out visitors. |

To enable mirroring:

1. Create an app at [console.x.com](https://console.x.com), buy a small amount of credits (pay-per-use), and copy the app's **Bearer Token**.
2. Add the server-only env vars: `X_BEARER_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Settings → API → service_role). Never prefix them with `NEXT_PUBLIC_`.
3. Optional: `X_FEED_USERNAME` (default `ComputersRh`) and `X_FEED_POLL_SECONDS` (default 60, minimum 15).

**Cost control:** X bills per post returned (currently about $0.005 per post read). The server takes a database lock, so only one X request is made per poll interval across all server instances, and it asks only for posts newer than the last one it saw (`since_id`). Polls with no new posts return nothing billable, so the ongoing cost is roughly the account's posting volume, plus about 10 posts for the first backfill. Set a spending limit in the X console anyway.

- RLS on every table. Users can only change their own profile, builds, likes and challenge entries. Public reads cover profiles (username, avatar, bio; email lives only in `auth.users`), public builds and their parts, likes on public builds, achievements and the leaderboard.
- Triggers create a profile on sign-up (with a fun unique username), keep `likes_count` in sync, unlock achievements, and stop clients from editing scores or counters after insert.
- Unique case-insensitive usernames, one like per user per build (composite PK), one challenge entry per user per day.
- `delete_my_account()` lets a signed-in user delete their own auth user. Everything cascades.

## Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel (framework: Next.js; defaults are fine).
2. Add the env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and optionally `NEXT_PUBLIC_SITE_URL`.
3. Deploy, then add the production URL and `/auth/callback` to Supabase's redirect URLs (step 3 above).

## Known limitations

- Scores are computed by the Server Action from the submitted parts. Because inserts go through the user's own Supabase session, a determined user could write a fake score through the REST API. Moving saves to a service-role route or an Edge Function would close this before any prize-backed competition.
- Unsaved `/share` links trust the `by` name in the URL (it's shown as text, not linked).
- All parts, prices and rarities are fictional game data.
