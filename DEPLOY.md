# FertTrack — Deployment Guide

## Architecture Decision

**This app uses Supabase Auth + Supabase DB (not Firebase).**

Why Supabase Auth was chosen over Firebase Auth:
- Google OAuth is built into Supabase — no extra SDK needed
- RLS policies use `auth.uid()` natively — no token bridging
- Single SDK, single set of environment variables
- Middleware session refresh is handled by `@supabase/ssr`
- Zero complexity difference vs same Firebase + Supabase bridging overhead

---

## Prerequisites

1. **Supabase project** — [app.supabase.com](https://app.supabase.com)
2. **Google OAuth credentials** — [console.cloud.google.com](https://console.cloud.google.com)
3. **PostHog project** — [app.posthog.com](https://app.posthog.com) (optional but recommended)
4. **Netlify account** — [netlify.com](https://netlify.com)

---

## Step 1: Supabase Setup

### 1a. Create project
1. Go to [app.supabase.com](https://app.supabase.com) → New Project
2. Note your **Project URL** and **anon public key** (Settings → API)

### 1b. Run database schema
1. Supabase Dashboard → SQL Editor → New Query
2. Paste the full contents of `supabase/schema.sql`
3. Run the query — this creates all tables, RLS policies, and triggers

### 1c. Enable Google OAuth
1. Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Add your Google OAuth **Client ID** and **Client Secret**
4. (You'll create these in Step 2)

### 1d. Configure redirect URLs
1. Supabase → Authentication → URL Configuration
2. **Site URL**: `https://your-app.netlify.app`
3. **Redirect URLs**: Add `https://your-app.netlify.app/auth/callback`
4. For local dev also add: `http://localhost:3000/auth/callback`

---

## Step 2: Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or use existing)
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: **Web application**
5. Authorized redirect URIs — add both:
   - `https://your-project.supabase.co/auth/v1/callback`
   - (Supabase provides this URL in their Google provider settings)
6. Copy **Client ID** and **Client Secret** → paste into Supabase Google provider settings

---

## Step 3: Local Development

```bash
# Clone and install
npm install

# Create .env.local from example
cp .env.example .env.local
# Fill in your actual values

# Run dev server
npm run dev
```

Your `.env.local` should contain:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ Never commit `.env.local` — it's in `.gitignore`
> ⚠️ Never use the Supabase `service_role` key in browser code

---

## Step 4: Deploy to Netlify

### 4a. Install Netlify Next.js plugin
Already included in `netlify.toml`. Netlify will auto-install `@netlify/plugin-nextjs` on first deploy.

### 4b. Connect repo to Netlify
1. Netlify Dashboard → Add new site → Import from Git
2. Connect your GitHub/GitLab repo
3. Build command: `npm run build`
4. Publish directory: `.next`

### 4c. Set environment variables in Netlify
Netlify → Site → Environment Variables → Add variable:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog → Project Settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` |
| `NEXT_PUBLIC_APP_URL` | Your Netlify domain, e.g. `https://ferttrack.netlify.app` |

### 4d. Update Supabase redirect URLs
After your Netlify domain is known, go back to:
- Supabase → Authentication → URL Configuration
- Update **Site URL** and **Redirect URLs** with your real Netlify domain

---

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never in client-side code
- [ ] All tables have RLS enabled (verify in Supabase → Table Editor → RLS column)
- [ ] `.env.local` is in `.gitignore`
- [ ] Google OAuth redirect URIs are restricted to your actual domains
- [ ] Supabase redirect URLs are restricted (no wildcards in production)

---

## PostHog Events Tracked

| Event | When |
|---|---|
| `login_clicked` | Google sign-in button pressed |
| `login_success` | OAuth completes (fire from auth callback) |
| `onboarding_started` | Onboarding page mounts |
| `onboarding_step_completed` | Each step's Continue clicked |
| `onboarding_completed` | Final submit |
| `result_uploaded` | Semen result saved |
| `daily_action_toggled` | Action status changed on dashboard |
| `care_link_clicked` | Care page links and resources clicked |
| `support_submitted` | Support question form submitted |
| `week_completed` | Plan week marked complete |
| `pageview` | Every route change |

---

## File Structure

```
fert-app/
├── app/
│   ├── layout.tsx              # Root layout + PostHog
│   ├── page.tsx                # Redirects to /login or /dashboard
│   ├── globals.css
│   ├── auth/callback/route.ts  # OAuth callback handler
│   ├── login/page.tsx
│   ├── onboarding/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx            # Server component (data fetching)
│   │   └── DashboardClient.tsx # Client component (interactivity)
│   ├── results/
│   │   ├── page.tsx
│   │   └── ResultsClient.tsx
│   ├── plan/
│   │   ├── page.tsx
│   │   └── PlanClient.tsx
│   ├── care/
│   │   ├── page.tsx
│   │   └── CareClient.tsx
│   └── support/
│       ├── page.tsx
│       └── SupportClient.tsx
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx         # Desktop sidebar
│   │   └── BottomNav.tsx       # Mobile bottom nav
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSkeleton.tsx
│   └── PostHogProvider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client (anon key)
│   │   └── server.ts           # Server client (anon key + cookies)
│   └── posthog.ts
├── types/index.ts
├── middleware.ts               # Auth protection + session refresh
├── supabase/schema.sql         # Full schema + RLS
├── .env.example
├── netlify.toml
├── next.config.ts
├── tailwind.config.ts
└── package.json
```
