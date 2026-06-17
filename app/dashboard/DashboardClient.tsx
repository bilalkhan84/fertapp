"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/posthog";
import { Profile, FertilityPlan, SemenResult, DailyActions, ActionStatus, HeatStatus, WHO_REFERENCE, classifyResult } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  CalendarDays,
  FlaskConical,
  HeartPulse,
  Pill,
  Moon,
  Thermometer,
  Dumbbell,
  ArrowRight,
  MapPin,
  TrendingUp,
} from "lucide-react";

interface Props {
  profile: Profile | null;
  plan: FertilityPlan | null;
  latestResult: SemenResult | null;
  todayActions: DailyActions | null;
  userId: string;
  today: string;
}

const STATUS_CYCLE: { [key: string]: ActionStatus } = {
  pending: "done",
  done: "skipped",
  skipped: "pending",
};

const HEAT_CYCLE: { [key: string]: HeatStatus } = {
  pending: "avoided",
  avoided: "exposed",
  exposed: "pending",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "gray" },
  done: { label: "Done", color: "green" },
  skipped: { label: "Skipped", color: "yellow" },
  avoided: { label: "Avoided ✓", color: "green" },
  exposed: { label: "Exposed", color: "red" },
};

export default function DashboardClient({
  profile,
  plan,
  latestResult,
  todayActions: initialActions,
  userId,
  today,
}: Props) {
  const [actions, setActions] = useState<DailyActions | null>(initialActions);
  const [updating, setUpdating] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const dayNumber = plan?.day_number ?? 1;
  const progress = plan?.progress_percent ?? 0;

  async function toggleAction(field: keyof Pick<DailyActions, "supplements_status" | "sleep_status" | "heat_exposure_status" | "exercise_status">) {
    setUpdating(field);
    setActionError(null);
    const supabase = createClient();
    const currentStatus = actions?.[field] ?? "pending";
    const nextStatus =
      field === "heat_exposure_status"
        ? HEAT_CYCLE[currentStatus as HeatStatus]
        : STATUS_CYCLE[currentStatus as ActionStatus];

    // Optimistic update
    const previousActions = actions;
    if (actions) {
      setActions({ ...actions, [field]: nextStatus });
    }

    track("daily_action_toggled", { action: field, status: nextStatus });

    if (!actions) {
      // Create today's record
      const { data, error } = await supabase
        .from("daily_actions")
        .insert({ user_id: userId, action_date: today, [field]: nextStatus })
        .select()
        .single();
      if (error || !data) {
        setActionError("Couldn't save — please try again.");
      } else {
        setActions(data);
      }
    } else {
      const { data, error } = await supabase
        .from("daily_actions")
        .update({ [field]: nextStatus })
        .eq("id", actions.id)
        .select()
        .single();
      if (error || !data) {
        // Revert optimistic update
        setActions(previousActions);
        setActionError("Couldn't save — please try again.");
      } else {
        setActions(data);
      }
    }
    setUpdating(null);
  }

  const actionItems = [
    {
      field: "supplements_status" as const,
      label: "Daily Supplements",
      icon: Pill,
      tip: "CoQ10, Zinc, Vitamin D, Omega-3",
    },
    {
      field: "sleep_status" as const,
      label: "Sleep Target (7–9 hrs)",
      icon: Moon,
      tip: "Sleep quality directly impacts testosterone",
    },
    {
      field: "heat_exposure_status" as const,
      label: "Heat Exposure",
      icon: Thermometer,
      tip: "Avoid hot tubs, saunas, laptop on lap",
    },
    {
      field: "exercise_status" as const,
      label: "Movement (30+ min)",
      icon: Dumbbell,
      tip: "Moderate cardio improves sperm motility",
    },
  ];

  const resultMetrics = [
    { key: "sperm_count" as const, label: "Sperm Count", value: latestResult?.sperm_count, unit: "M/mL", min: WHO_REFERENCE.sperm_count.min },
    { key: "motility" as const, label: "Motility", value: latestResult?.motility, unit: "%", min: WHO_REFERENCE.motility.min },
    { key: "morphology" as const, label: "Morphology", value: latestResult?.morphology, unit: "%", min: WHO_REFERENCE.morphology.min },
  ];

  const categoryColors = { normal: "green", borderline: "yellow", low: "red" } as const;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900">
          Good morning, {firstName}
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin size={13} className="text-teal-500" />
          <p className="text-sm text-charcoal-500">
            {profile?.province ?? "Ontario"} • Day {dayNumber} of 90
          </p>
        </div>
      </div>

      {/* Plan progress card */}
      <Card className="bg-gradient-to-br from-teal-600 to-teal-700 border-0 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-teal-100 text-xs font-medium uppercase tracking-wide mb-1">
              Your Fertility Plan
            </p>
            <h2 className="text-lg font-bold">90-Day Plan</h2>
            <p className="text-teal-200 text-sm mt-0.5">
              Day {dayNumber} of 90 · {progress}% complete
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Link
            href="/plan"
            className="flex items-center gap-1.5 text-sm font-medium text-teal-100 hover:text-white transition-colors"
          >
            View plan <ArrowRight size={14} />
          </Link>
        </div>
      </Card>

      {/* Result metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wide">
            Latest Results
          </h2>
          <Link
            href="/results"
            className="text-xs text-teal-600 font-medium hover:text-teal-700"
          >
            {latestResult ? "Update" : "Add results"} →
          </Link>
        </div>
        {latestResult ? (
          <div className="grid grid-cols-3 gap-3">
            {resultMetrics.map(({ key, label, value, unit }) => {
              const category = classifyResult(value ?? null, key);
              return (
                <Card key={key} padding="sm" className="text-center">
                  <p className="text-xs text-charcoal-500 font-medium mb-1">{label}</p>
                  <p className="text-xl font-bold text-charcoal-900">
                    {value !== null && value !== undefined ? value : "—"}
                  </p>
                  <p className="text-xs text-charcoal-400 mb-2">{unit}</p>
                  <Badge
                    label={category === "normal" ? "Normal" : category === "borderline" ? "Borderline" : "Low"}
                    variant={categoryColors[category]}
                  />
                </Card>
              );
            })}
          </div>
        ) : (
          <Card padding="sm" className="text-center py-6">
            <FlaskConical className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
            <p className="text-sm text-charcoal-500">No results yet</p>
            <Link href="/results" className="text-sm text-teal-600 font-medium hover:underline mt-1 block">
              Add your semen analysis →
            </Link>
          </Card>
        )}
      </div>

      {/* Today's actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wide">
            Today's Actions
          </h2>
          <TrendingUp size={15} className="text-charcoal-400" />
        </div>
        {actionError && (
          <p className="text-xs text-red-500 mb-2 px-1">{actionError}</p>
        )}
        <div className="space-y-2.5">
          {actionItems.map(({ field, label, icon: Icon, tip }) => {
            const currentStatus = actions?.[field] ?? "pending";
            const statusInfo = STATUS_LABELS[currentStatus as string] ?? STATUS_LABELS.pending;
            return (
              <Card key={field} padding="sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-800">{label}</p>
                    <p className="text-xs text-charcoal-400 truncate">{tip}</p>
                  </div>
                  <button
                    onClick={() => toggleAction(field)}
                    disabled={updating === field}
                    className={[
                      "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 min-w-[72px] text-center",
                      statusInfo.color === "green" ? "bg-green-100 text-green-700 active:bg-green-200" :
                      statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700 active:bg-yellow-200" :
                      statusInfo.color === "red" ? "bg-red-100 text-red-700 active:bg-red-200" :
                      "bg-charcoal-100 text-charcoal-600 active:bg-charcoal-200",
                    ].join(" ")}
                  >
                    {updating === field ? "…" : statusInfo.label}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Care links */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wide mb-3">
          Ontario Care
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            { href: "/care", label: "Coverage Guide", desc: "OHIP & fertility funding", icon: HeartPulse },
            { href: "/care#specialists", label: "Find a Specialist", desc: "Urologist & fertility clinic", icon: MapPin },
            { href: "/results", label: "Results Explainer", desc: "Plain-language breakdown", icon: FlaskConical },
          ].map(({ href, label, desc, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => track("care_link_clicked", { label })}>
              <Card padding="sm" className="hover:border-teal-200 hover:shadow-md transition-all cursor-pointer h-full">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal-800">{label}</p>
                    <p className="text-xs text-charcoal-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
