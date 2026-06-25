# FertTrack — Codebase Summary (Project Knowledge)

> Upload this file to the new Project as knowledge. It gives Claude the architecture and data model without needing the full repo.

## Overview
FertTrack is a Next.js 15 (App Router) web app for male fertility tracking, in beta. It helps men understand semen analysis results, build the daily habits that influence fertility, follow a 90-day improvement program, and navigate care/coverage in Ontario. Audience: men 30–50. Tone: warm, non-clinical, non-diagnostic.

## Tech stack
- **Next.js 15** (App Router), **React 19**, **TypeScript 5**
- **Tailwind CSS 3** for styling
- **Supabase** (Postgres + Auth) via `@supabase/ssr`; **Google OAuth**; **Row-Level Security** on every table keyed to `auth.uid()`
- **PostHog** for product analytics
- **Netlify** for hosting
- **lucide-react** for icons

## Directory map
```
app/
  page.tsx              # Root: redirects to /dashboard (signed in) or /login
  layout.tsx            # Root layout + PostHog provider
  globals.css           # Tailwind base + global styles
  login/page.tsx        # Google OAuth sign-in
  onboarding/page.tsx   # First-run questionnaire -> onboarding_responses
  auth/callback/route.ts# OAuth code exchange -> session
  dashboard/            # page.tsx + DashboardClient.tsx (daily habit check-in, 90-day countdown)
  results/              # page.tsx + ResultsClient.tsx (semen analysis entry + WHO breakdown)
  plan/                 # page.tsx + PlanClient.tsx (13-week / 90-day program)
  care/                 # page.tsx + CareClient.tsx (Ontario OHIP + specialist guide)
  account/              # page.tsx + AccountClient.tsx (profile/settings)
  support/              # page.tsx + SupportClient.tsx (support request form)
  api/support/route.ts  # Support request submission handler

components/
  PostHogProvider.tsx
  layout/  AppLayout.tsx, Sidebar.tsx, BottomNav.tsx
  ui/      Button.tsx, Card.tsx, Badge.tsx, EmptyState.tsx, LoadingSkeleton.tsx

lib/
  supabase/server.ts    # Server-side Supabase client (server components, route handlers)
  supabase/client.ts    # Browser Supabase client (client components)
  posthog.ts            # PostHog init

types/index.ts          # All DB types + WHO_REFERENCE + classifyResult()
middleware.ts           # Supabase session refresh on every request
supabase/schema.sql     # Tables, RLS policies, triggers (source of truth)
```

## Page/route pattern
Each feature route is a **server component** (`page.tsx`, fetches data via the server Supabase client) paired with a **client component** (`<Route>Client.tsx`, handles interactivity). Follow this split for new features.

## Data model (Supabase / Postgres)
All tables have RLS enabled, scoped to the authenticated user via `auth.uid()`.

- **profiles** — `id` (= auth.users.id), email, full_name, avatar_url, province (default Ontario), onboarding_complete. Auto-created on signup by the `handle_new_user()` trigger.
- **onboarding_responses** — trying_timeline, age_range, province, has_semen_analysis, biggest_goal, hardest_action, wants_care_guidance.
- **fertility_plans** — title, day_number, progress_percent, status (active/paused/completed), start_date, and `week_1_complete` … `week_13_complete` booleans. `updated_at` auto-maintained by trigger.
- **semen_results** — result_date, sperm_count, motility, morphology, volume, notes, lab_name. (Full CRUD incl. delete.)
- **daily_actions** — action_date (unique per user/day), supplements_status, sleep_status, heat_exposure_status, exercise_status. `updated_at` auto-maintained.
- **support_requests** — subject, message, status (open/in_review/resolved); user_id nullable (set null on user delete).

## WHO reference logic (`types/index.ts`)
```
sperm_count ≥ 16 million/mL
motility    ≥ 42%
morphology  ≥ 4%
volume      ≥ 1.4 mL
```
`classifyResult(value, metric)` returns: `normal` (≥ threshold), `borderline` (≥ 70% of threshold), or `low` (below). Reuse this — don't hard-code thresholds elsewhere.

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
(See `.env.example` in the repo. Never commit real keys.)

## Deployment notes
Supabase Auth + DB (chosen over Firebase for native `auth.uid()` RLS and a single SDK). Google OAuth configured in Supabase. Hosted on Netlify. Full setup steps are in `DEPLOY.md`. `next.config.ts` currently ignores TS/ESLint errors at build time to ship fast.
