"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/posthog";
import { Profile, FertilityPlan, SemenResult, DailyActions, ActionStatus, HeatStatus, WHO_REFERENCE, classifyResult } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  FlaskConical,
  HeartPulse,
  Pill,
  Moon,
  Thermometer,
  Dumbbell,
  ArrowRight,
  MapPin,
  TrendingUp,
  CheckCircle,
  ShoppingCart,
  Sparkles,
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

type Rec = {
  id: string;
  Icon: typeof Pill;
  iconColor: string;
  bgColor: string;
  title: string;
  body: string;
  cta: { label: string; href: string; external?: boolean };
};

function getRecommendations(result: SemenResult | null, todayActs: DailyActions | null): Rec[] {
  const recs: Rec[] = [];

  // Daily action issues — most immediately actionable
  if (todayActs?.heat_exposure_status === "exposed") {
    recs.push({
      id: "heat",
      Icon: Thermometer,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      title: "Minimize heat exposure",
      body: "Heat above 35°C reduces sperm production for weeks. Avoid hot tubs, saunas, and laptop on lap.",
      cta: { label: "Heat tips", href: "/plan" },
    });
  }

  if (todayActs?.supplements_status === "pending") {
    recs.push({
      id: "supplements-today",
      Icon: Pill,
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
      title: "Take your supplements today",
      body: "Not logged today. CoQ10 and Zinc work best taken consistently — even one missed day breaks the cycle.",
      cta: { label: "View supplement stack", href: "/plan" },
    });
  }

  if (todayActs?.sleep_status === "skipped") {
    recs.push({
      id: "sleep",
      Icon: Moon,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50",
      title: "Prioritize sleep tonight",
      body: "Poor sleep logged. Testosterone peaks during deep sleep — aim for 7–9 hours tonight.",
      cta: { label: "Sleep habit tips", href: "/plan" },
    });
  }

  if (todayActs?.exercise_status === "skipped") {
    recs.push({
      id: "exercise",
      Icon: Dumbbell,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      title: "Add movement today",
      body: "30+ min of moderate cardio boosts testosterone and improves motility. A walk counts.",
      cta: { label: "Exercise tips", href: "/plan" },
    });
  }

  // Result-based recommendations
  if (result) {
    const countCat = classifyResult(result.sperm_count ?? null, "sperm_count");
    const motilityCat = classifyResult(result.motility ?? null, "motility");
    const morphCat = classifyResult(result.morphology ?? null, "morphology");

    if (motilityCat === "low" || motilityCat === "borderline") {
      recs.push({
        id: "motility",
        Icon: ShoppingCart,
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
        title: "Boost motility: CoQ10 + cardio",
        body: `Motility at ${result.motility}% (${motilityCat}). CoQ10 and L-Carnitine fuel sperm movement — add them to your stack.`,
        cta: { label: "Buy CoQ10", href: "https://www.amazon.ca/s?k=CoQ10+Ubiquinol+200mg&i=hpc", external: true },
      });
    }

    if (countCat === "low" || countCat === "borderline") {
      recs.push({
        id: "count",
        Icon: FlaskConical,
        iconColor: "text-teal-600",
        bgColor: "bg-teal-50",
        title: "Low count — consider a specialist",
        body: `Count at ${result.sperm_count} M/mL (${countCat}). Stay on your supplement plan and ask your GP about a referral.`,
        cta: { label: "Find a clinic", href: "/care#specialists" },
      });
    }

    if (morphCat === "low" || morphCat === "borderline") {
      recs.push({
        id: "morphology",
        Icon: ShoppingCart,
        iconColor: "text-purple-600",
        bgColor: "bg-purple-50",
        title: "Support morphology with folate",
        body: `Morphology at ${result.morphology}% (${morphCat}). Add 5-MTHF methylfolate to reduce DNA fragmentation.`,
        cta: { label: "Buy Folate", href: "https://www.amazon.ca/s?k=5-MTHF+methylfolate+supplement&i=hpc", external: true },
      });
    }

    if (countCat === "normal" && motilityCat === "normal" && morphCat === "normal") {
      recs.push({
        id: "normal",
        Icon: CheckCircle,
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
        title: "Results in normal range",
        body: "Your key metrics meet WHO reference values. Stay consistent for your week 13 retest.",
        cta: { label: "View your plan", href: "/plan" },
      });
    }
  } else {
    recs.push({
      id: "add-results",
      Icon: FlaskConical,
      iconColor: "text-charcoal-400",
      bgColor: "bg-charcoal-100",
      title: "Add your baseline semen analysis",
      body: "Add your results to unlock personalized recommendations.",
      cta: { label: "Add results", href: "/results" },
    });
  }

  return recs.slice(0, 3);
}

function WelcomeIllustration() {
  return (
    <svg
      viewBox="0 0 110 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-24 h-24 flex-shrink-0"
      aria-hidden="true"
    >
      {/* Background soft circles */}
      <circle cx="90" cy="18" r="32" fill="white" fillOpacity="0.07" />
      <circle cx="14" cy="82" r="20" fill="white" fillOpacity="0.05" />

      {/* DNA helix — left accent */}
      <circle cx="19" cy="22" r="2.5" fill="white" fillOpacity="0.55" />
      <circle cx="28" cy="31" r="2"   fill="white" fillOpacity="0.45" />
      <circle cx="19" cy="40" r="2.5" fill="white" fillOpacity="0.55" />
      <circle cx="28" cy="49" r="2"   fill="white" fillOpacity="0.45" />
      <line x1="19" y1="22" x2="28" y2="31" stroke="white" strokeOpacity="0.28" strokeWidth="1" />
      <line x1="28" y1="31" x2="19" y2="40" stroke="white" strokeOpacity="0.28" strokeWidth="1" />
      <line x1="19" y1="40" x2="28" y2="49" stroke="white" strokeOpacity="0.28" strokeWidth="1" />

      {/* Person — head */}
      <circle cx="68" cy="28" r="14" fill="white" fillOpacity="0.92" />
      {/* Subtle smile */}
      <path d="M63 33 Q68 38 73 33" stroke="rgba(13,148,136,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Person — shoulders / body */}
      <path d="M46 78 Q48 58 68 58 Q88 58 90 78 Z" fill="white" fillOpacity="0.92" />

      {/* Growth plant — right accent */}
      <line x1="96" y1="92" x2="96" y2="65" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      <path d="M96 79 C90 74 86 67 89 61" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M96 73 C102 68 106 61 103 55" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="60" r="3" fill="white" fillOpacity="0.5" />
      <circle cx="103" cy="54" r="3" fill="white" fillOpacity="0.5" />

      {/* Sparkle dots */}
      <circle cx="42" cy="11" r="2"   fill="white" fillOpacity="0.55" />
      <circle cx="56" cy="7"  r="1.5" fill="white" fillOpacity="0.4" />
      <circle cx="38" cy="88" r="1.5" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

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
  const [selectedDay, setSelectedDay] = useState<"yesterday" | "today" | "tomorrow">("today");
  const [yesterdayActions, setYesterdayActions] = useState<DailyActions | null>(null);
  const [yesterdayLoadState, setYesterdayLoadState] = useState<"idle" | "loading" | "done">("idle");

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  useEffect(() => {
    if (yesterdayLoadState === "loading") {
      const supabase = createClient();
      supabase
        .from("daily_actions")
        .select("*")
        .eq("user_id", userId)
        .eq("action_date", yesterdayStr)
        .maybeSingle()
        .then(({ data }) => {
          setYesterdayActions(data ?? null);
          setYesterdayLoadState("done");
        });
    }
  }, [yesterdayLoadState, userId, yesterdayStr]);

  function selectDay(day: "yesterday" | "today" | "tomorrow") {
    setSelectedDay(day);
    if (day === "yesterday" && yesterdayLoadState === "idle") {
      setYesterdayLoadState("loading");
    }
  }

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
      {/* Hero: greeting + illustration + plan progress */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 px-5 pt-5 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Day {dayNumber} of 90
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight">
              Good morning,<br />{firstName}
            </h1>
            <p className="text-teal-200 text-sm mt-1.5">
              {profile?.province ?? "Ontario"}
            </p>
            <p className="text-teal-100 text-xs mt-2 italic opacity-80">
              {dayNumber <= 7
                ? "You're just getting started — every habit builds the foundation."
                : dayNumber <= 30
                ? "Building momentum — your supplements are starting to work."
                : dayNumber <= 60
                ? "Halfway there — sperm you're making now will be tested at week 13."
                : "Final stretch — your retest is just a few weeks away."}
            </p>
          </div>
          <WelcomeIllustration />
        </div>
        {plan && (
          <>
            <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progress, 2)}%` }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <p className="text-teal-200 text-xs">{progress}% complete</p>
              <Link
                href="/plan"
                className="flex items-center gap-1 text-xs font-medium text-teal-100 hover:text-white transition-colors"
              >
                View plan <ArrowRight size={12} />
              </Link>
            </div>
          </>
        )}
      </div>

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

      {/* Recommended Next Steps */}
      {(() => {
        const recs = getRecommendations(latestResult, actions);
        if (recs.length === 0) return null;
        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-teal-500" />
              <h2 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wide">
                Recommended Next Steps
              </h2>
            </div>
            <div className="space-y-2.5">
              {recs.map(({ id, Icon, iconColor, bgColor, title, body, cta }) => (
                <Card key={id} padding="sm">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={17} className={iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal-800 mb-0.5">{title}</p>
                      <p className="text-xs text-charcoal-500 leading-relaxed mb-2">{body}</p>
                      {cta.external ? (
                        <a
                          href={cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track("recommendation_clicked", { id, cta: cta.label })}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ShoppingCart size={11} />
                          {cta.label}
                        </a>
                      ) : (
                        <Link
                          href={cta.href}
                          onClick={() => track("recommendation_clicked", { id, cta: cta.label })}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                        >
                          {cta.label} <ArrowRight size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-2.5 px-1">
              <Link href="/support" className="text-xs text-charcoal-400 hover:text-teal-600 transition-colors">
                Have a question about your results? → Ask our team
              </Link>
            </div>
          </div>
        );
      })()}

      {/* Daily actions with 3-day navigator */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wide">
            Daily Actions
          </h2>
          <TrendingUp size={15} className="text-charcoal-400" />
        </div>

        {/* Day selector */}
        <div className="flex gap-1.5 mb-3 bg-charcoal-100 rounded-2xl p-1">
          {(["yesterday", "today", "tomorrow"] as const).map((day) => (
            <button
              key={day}
              onClick={() => selectDay(day)}
              className={[
                "flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize",
                selectedDay === day
                  ? "bg-white text-charcoal-800 shadow-sm"
                  : "text-charcoal-500 hover:text-charcoal-700",
              ].join(" ")}
            >
              {day === "today" ? "Today" : day === "yesterday" ? "Yesterday" : "Tomorrow"}
            </button>
          ))}
        </div>

        {actionError && selectedDay === "today" && (
          <p className="text-xs text-red-500 mb-2 px-1">{actionError}</p>
        )}

        {/* Yesterday — read-only */}
        {selectedDay === "yesterday" && (
          <div className="space-y-2.5">
            {yesterdayLoadState !== "done" ? (
              <Card padding="sm" className="text-center py-6">
                <p className="text-xs text-charcoal-400">Loading yesterday&apos;s data…</p>
              </Card>
            ) : !yesterdayActions ? (
              <Card padding="sm" className="text-center py-6">
                <p className="text-sm text-charcoal-500">No actions logged for yesterday</p>
                <p className="text-xs text-charcoal-400 mt-1">Actions you track today will appear here tomorrow</p>
              </Card>
            ) : (
              actionItems.map(({ field, label, icon: Icon, tip }) => {
                const currentStatus = yesterdayActions?.[field] ?? "pending";
                const statusInfo = STATUS_LABELS[currentStatus as string] ?? STATUS_LABELS.pending;
                return (
                  <Card key={field} padding="sm" className="opacity-80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-charcoal-50 flex items-center justify-center flex-shrink-0">
                        <Icon size={17} className="text-charcoal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-700">{label}</p>
                        <p className="text-xs text-charcoal-400 truncate">{tip}</p>
                      </div>
                      <span
                        className={[
                          "px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 min-w-[72px] text-center",
                          statusInfo.color === "green" ? "bg-green-100 text-green-700" :
                          statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700" :
                          statusInfo.color === "red" ? "bg-red-100 text-red-700" :
                          "bg-charcoal-100 text-charcoal-500",
                        ].join(" ")}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Today — interactive */}
        {selectedDay === "today" && (
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
        )}

        {/* Tomorrow — preview (read-only, all pending) */}
        {selectedDay === "tomorrow" && (
          <div className="space-y-2.5">
            <p className="text-xs text-charcoal-400 px-1 mb-2">Preview — actions unlock tomorrow</p>
            {actionItems.map(({ field, label, icon: Icon, tip }) => (
              <Card key={field} padding="sm" className="opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-charcoal-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-charcoal-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-600">{label}</p>
                    <p className="text-xs text-charcoal-400 truncate">{tip}</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-charcoal-100 text-charcoal-400 flex-shrink-0 min-w-[72px] text-center">
                    Pending
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Care section — prominent cards with descriptions */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wide mb-3">
          Ontario Care
        </h2>
        <div className="space-y-2.5">
          {[
            {
              href: "/care",
              label: "Coverage Guide",
              desc: "See what OHIP covers — from baseline semen analysis to your funded IVF cycle.",
              icon: HeartPulse,
              iconBg: "bg-rose-50",
              iconColor: "text-rose-500",
            },
            {
              href: "/care#specialists",
              label: "Find a Specialist",
              desc: "Ontario fertility clinics and urologists with direct phone and website links.",
              icon: MapPin,
              iconBg: "bg-teal-50",
              iconColor: "text-teal-600",
            },
            {
              href: "/results",
              label: "Results Explainer",
              desc: "Add your semen analysis to get a plain-language breakdown of every number.",
              icon: FlaskConical,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-500",
            },
          ].map(({ href, label, desc, icon: Icon, iconBg, iconColor }) => (
            <Link
              key={href}
              href={href}
              onClick={() => track("care_link_clicked", { label })}
            >
              <Card padding="sm" className="hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal-800">{label}</p>
                    <p className="text-xs text-charcoal-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-charcoal-300 flex-shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
