# RH PC LAB

**BUILD YOUR DREAM RIG.** Build. Customize. Score. Share.

A retro pixel-art PC-building game and community platform. Pick fictional parts, watch your rig come together, fight the compatibility engine (or switch on Chaos Mode), boot it up, get a 0–100 score, then save it with an email account and share it on X.

> An unofficial community-made project inspired by [Computers RH](https://www.computersrh.xyz/).
> Not affiliated with or endorsed by Computers RH or Robinhood. Off-chain web app; there are no wallets, tokens or NFTs.

## Features

- **Builder (no account needed):** 11 steps (case → mouse), 67 fictional parts across 6 rarities, live pixel-art visualizer that changes with the case, GPU, cooler, RAM, monitor, keyboard, mouse and RGB colour. Drafts autosave to the browser.
- **Compatibility engine:** CPU↔motherboard socket, RAM type and capacity, case↔motherboard form factor, GPU length↔case, cooler socket, cooler height and radiator size↔case, NVMe↔M.2 slots, PSU capacity and headroom, plus cooler TDP warnings. Each conflict shows a `⚠ HARDWARE CONFLICT` card with the exact reason.
- **Chaos Mode:** turns the rules off. Conflicts cost score points.
- **Scoring:** 0–100 from compute, graphics, memory, storage, thermals, efficiency and CPU/GPU balance. Rig rarity comes from the score. Also shows a fictional value and power draw/headroom.
- **Boot sequence → final reveal:** a skippable retro POST screen, then a count-up score, rarity badge and stat bars.
- **Share card:** a 1200×630 PNG generated server-side with `next/og`. Download it, or share on X with a prefilled intent (nothing posts automatically). Unsaved rigs get a `/share?parts=…` link; saved rigs get `/build/[id]` with an OG image.
- **Accounts (Supabase, email only):** register, log in, email verification, forgot/reset password, log out, persistent sessions. If you click *Save build* while logged out, you sign up inside the modal and the build saves automatically, including after email verification (the build waits in localStorage and `/save` finishes the job).
- **Community:** public build pages, likes (one per user, with an animation), Explore tabs (Newest, Top score, Most liked, Legendary), leaderboards (Top score, Most builds, Most liked), profiles at `/u/[username]`, a dashboard, settings (username, 10 pixel avatars, bio, favourite part, password, delete account).
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
| `npm run db:seed:generate` | Rebuild `supabase/migrations/*_seed_game_data.sql` from `data/` |

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Run the SQL.** Either:
   - **SQL editor:** paste and run `supabase/migrations/20261006000000_init.sql`, then `supabase/migrations/20261006000100_seed_game_data.sql`; or
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

Tables: `profiles`, `components`, `builds`, `build_components`, `likes`, `achievements`, `user_achievements`, `daily_challenges`, `challenge_entries`, plus a `leaderboard` view.

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
