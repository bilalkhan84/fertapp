-- ─────────────────────────────────────────────────────────────────────────────
-- FertApp — Supabase Schema + RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (usually already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- Created automatically when a user signs up via a trigger
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  avatar_url    TEXT,
  province      TEXT DEFAULT 'Ontario',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- ONBOARDING RESPONSES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trying_timeline     TEXT,           -- 'now' | 'within_year' | 'planning'
  age_range           TEXT,           -- '20-25' | '26-30' | '31-35' | '36-40' | '40+'
  province            TEXT DEFAULT 'Ontario',
  has_semen_analysis  BOOLEAN DEFAULT FALSE,
  biggest_goal        TEXT,           -- 'understand_results' | 'improve_numbers' | 'navigate_care' | 'support'
  hardest_action      TEXT,           -- 'diet' | 'exercise' | 'sleep' | 'stress' | 'alcohol' | 'heat'
  wants_care_guidance BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding"
  ON onboarding_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding"
  ON onboarding_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding"
  ON onboarding_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- FERTILITY PLANS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fertility_plans (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT DEFAULT '90-Day Fertility Plan',
  day_number       INTEGER DEFAULT 1,
  progress_percent INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'active',  -- 'active' | 'paused' | 'completed'
  start_date       DATE DEFAULT CURRENT_DATE,
  week_1_complete  BOOLEAN DEFAULT FALSE,
  week_2_complete  BOOLEAN DEFAULT FALSE,
  week_3_complete  BOOLEAN DEFAULT FALSE,
  week_4_complete  BOOLEAN DEFAULT FALSE,
  week_5_complete  BOOLEAN DEFAULT FALSE,
  week_6_complete  BOOLEAN DEFAULT FALSE,
  week_7_complete  BOOLEAN DEFAULT FALSE,
  week_8_complete  BOOLEAN DEFAULT FALSE,
  week_9_complete  BOOLEAN DEFAULT FALSE,
  week_10_complete BOOLEAN DEFAULT FALSE,
  week_11_complete BOOLEAN DEFAULT FALSE,
  week_12_complete BOOLEAN DEFAULT FALSE,
  week_13_complete BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fertility_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plans"
  ON fertility_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON fertility_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON fertility_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER fertility_plans_updated_at
  BEFORE UPDATE ON fertility_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- SEMEN RESULTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS semen_results (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  sperm_count   NUMERIC(8,2),  -- millions per mL (WHO normal ≥16)
  motility      NUMERIC(5,2),  -- percentage (WHO normal ≥42%)
  morphology    NUMERIC(5,2),  -- percentage normal forms (WHO normal ≥4%)
  volume        NUMERIC(5,2),  -- mL (WHO normal ≥1.4)
  notes         TEXT,
  lab_name      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE semen_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own results"
  ON semen_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
  ON semen_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own results"
  ON semen_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own results"
  ON semen_results FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- DAILY ACTIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_actions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  supplements_status  TEXT DEFAULT 'pending',   -- 'pending' | 'done' | 'skipped'
  sleep_status        TEXT DEFAULT 'pending',
  heat_exposure_status TEXT DEFAULT 'pending',  -- 'avoided' | 'exposed' | 'pending'
  exercise_status     TEXT DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, action_date)
);

ALTER TABLE daily_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily actions"
  ON daily_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily actions"
  ON daily_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily actions"
  ON daily_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER daily_actions_updated_at
  BEFORE UPDATE ON daily_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- SUPPORT REQUESTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_requests (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT DEFAULT 'open',  -- 'open' | 'in_review' | 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own support requests"
  ON support_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own support requests"
  ON support_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
