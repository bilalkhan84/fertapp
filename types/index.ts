// ─────────────────────────────────────────────────────────────────────────────
// Database types (mirrors Supabase schema)
// ─────────────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  province: string;
  onboarding_complete: boolean;
  created_at: string;
}

export interface OnboardingResponse {
  id: string;
  user_id: string;
  trying_timeline: "now" | "within_year" | "planning" | null;
  age_range: "20-25" | "26-30" | "31-35" | "36-40" | "40+" | null;
  province: string;
  has_semen_analysis: boolean;
  biggest_goal: "understand_results" | "improve_numbers" | "navigate_care" | "support" | null;
  hardest_action: "diet" | "exercise" | "sleep" | "stress" | "alcohol" | "heat" | null;
  wants_care_guidance: boolean;
  created_at: string;
}

export interface FertilityPlan {
  id: string;
  user_id: string;
  title: string;
  day_number: number;
  progress_percent: number;
  status: "active" | "paused" | "completed";
  start_date: string;
  week_1_complete: boolean;
  week_2_complete: boolean;
  week_3_complete: boolean;
  week_4_complete: boolean;
  week_5_complete: boolean;
  week_6_complete: boolean;
  week_7_complete: boolean;
  week_8_complete: boolean;
  week_9_complete: boolean;
  week_10_complete: boolean;
  week_11_complete: boolean;
  week_12_complete: boolean;
  week_13_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface SemenResult {
  id: string;
  user_id: string;
  result_date: string;
  sperm_count: number | null;
  motility: number | null;
  morphology: number | null;
  volume: number | null;
  notes: string | null;
  lab_name: string | null;
  created_at: string;
}

export type ActionStatus = "pending" | "done" | "skipped";
export type HeatStatus = "pending" | "avoided" | "exposed";

export interface DailyActions {
  id: string;
  user_id: string;
  action_date: string;
  supplements_status: ActionStatus;
  sleep_status: ActionStatus;
  heat_exposure_status: HeatStatus;
  exercise_status: ActionStatus;
  created_at: string;
  updated_at: string;
}

export interface SupportRequest {
  id: string;
  user_id: string | null;
  subject: string;
  message: string;
  status: "open" | "in_review" | "resolved";
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding form state
// ─────────────────────────────────────────────────────────────────────────────
export interface OnboardingFormData {
  trying_timeline: string;
  age_range: string;
  province: string;
  has_semen_analysis: boolean;
  biggest_goal: string;
  hardest_action: string;
  wants_care_guidance: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// WHO reference ranges for semen analysis
// ─────────────────────────────────────────────────────────────────────────────
export const WHO_REFERENCE = {
  sperm_count: { min: 16, unit: "million/mL", label: "Sperm Count" },
  motility: { min: 42, unit: "%", label: "Total Motility" },
  morphology: { min: 4, unit: "%", label: "Normal Morphology" },
  volume: { min: 1.4, unit: "mL", label: "Volume" },
} as const;

export type ResultCategory = "normal" | "borderline" | "low";

export function classifyResult(
  value: number | null,
  metric: keyof typeof WHO_REFERENCE
): ResultCategory {
  if (value === null) return "borderline";
  const ref = WHO_REFERENCE[metric];
  if (value >= ref.min) return "normal";
  if (value >= ref.min * 0.7) return "borderline";
  return "low";
}
