/**
 * PostHog analytics wrapper
 * Set NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST in your .env
 *
 * Usage (client components only):
 *   import { track } from '@/lib/posthog'
 *   track('login_clicked')
 *   track('daily_action_toggled', { action: 'supplements', status: 'done' })
 */
"use client";

import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (
    initialized ||
    typeof window === "undefined" ||
    !process.env.NEXT_PUBLIC_POSTHOG_KEY
  ) {
    return;
  }

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    capture_pageview: false, // We fire pageviews manually via usePathname
    capture_pageleave: true,
    autocapture: false,      // Disable for healthcare — explicit tracking only
    persistence: "localStorage",
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });

  initialized = true;
}

export function track(
  event: AppEvent,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, traits);
}

export function resetUser() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

// ─────────────────────────────────────────────────────────────────────────────
// Typed event catalogue — add new events here to keep tracking consistent
// ─────────────────────────────────────────────────────────────────────────────
export type AppEvent =
  | "login_clicked"
  | "login_success"
  | "onboarding_started"
  | "onboarding_step_completed"
  | "onboarding_completed"
  | "result_uploaded"
  | "daily_action_toggled"
  | "care_link_clicked"
  | "support_submitted"
  | "week_completed"
  | "supplement_buy_clicked"
  | "recommendation_clicked"
  | "journey_step_clicked"
  | "journey_cta_clicked"
  | "results_to_plan_clicked"
  | "results_supplement_clicked"
  | "supplement_stack_buy_clicked"
  | "plan_to_coverage_clicked"
  | "care_talk_to_someone_clicked"
  | "care_find_specialist_clicked"
  | "care_shop_stack_clicked"
  | "pageview";
