# FertTrack — Project Knowledge Setup Guide

How to rebuild the FertTrack Project on your personal Claude account. Three steps.

## Step 1 — Create the Project
claude.ai (personal account) → **Projects** → **Create Project** → name it `FertTrack`.

## Step 2 — Paste the custom instructions
Open the Project → **Edit** → paste the contents of **`ferttrack-project-instructions.md`** into the *Custom instructions* box.

## Step 3 — Add Project knowledge
Upload the files below as Project knowledge. You don't need all 600 MB of the repo — just the files that give Claude context. Everything else regenerates from `package.json`.

### Always upload (context docs)
| File | Why |
|------|-----|
| `ferttrack-codebase-summary.md` | Architecture + data model overview (this is the most important one). |
| `supabase/schema.sql` | Source of truth for tables, RLS policies, triggers. |
| `types/index.ts` | All shared TS types + WHO reference logic. |
| `DEPLOY.md` | Stack rationale and full deployment steps. |
| `package.json` | Exact dependency versions. |

### Upload if you want Claude to edit specific features
Upload these per-feature when you're actively working on that area (Project knowledge has size limits, so add as needed rather than all at once):

- `app/dashboard/DashboardClient.tsx` — daily habit check-in + 90-day countdown
- `app/results/ResultsClient.tsx` — semen analysis entry + WHO breakdown
- `app/plan/PlanClient.tsx` — 13-week / 90-day program
- `app/care/CareClient.tsx` — Ontario OHIP / specialist guide
- `lib/supabase/server.ts` and `lib/supabase/client.ts` — Supabase client setup
- `middleware.ts` — session refresh
- `components/ui/*` — UI primitives (Button, Card, Badge, EmptyState, LoadingSkeleton)
- `components/layout/*` — AppLayout, Sidebar, BottomNav

### Don't upload
`node_modules/`, `.next/`, `tsconfig.tsbuildinfo`, `.git/`, `package-lock.json`, and anything containing real secrets (`.env*`). These are large, derived, or sensitive. (The portable project zip I made already excludes the heavy ones.)

---

## Marketing assets (in the folder)
These aren't code but are part of the project's context — upload them as knowledge if you'll keep iterating on go-to-market in the Project:

- **`linkedin-post.md`** — the launch/build-in-public LinkedIn post. Captures the product positioning, the four pillars in user-facing language, and the beta-feedback ask. Good context for Claude on tone and messaging.
- **`typeform-prompt.md`** — the full beta feedback form (AI-builder prompt + 15 manual questions). Tells Claude what user signals you're collecting and surfaces the most-requested features (trends/graphs, reminders, partner view, Android app).
- **`ferttrack-banner.png`** / **`ferttrack-banner.html`** — the launch banner image and its HTML source. Useful if you want Claude to restyle or regenerate marketing visuals.

## Note on ownership
This project references `lazertechnologies.com` infrastructure and was built in a work context. Before moving it to a personal account, confirm the code, the Supabase project, and any data are yours to take personally.
