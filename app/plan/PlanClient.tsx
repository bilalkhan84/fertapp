"use client";

import Link from "next/link";
import { track } from "@/lib/posthog";
import { FertilityPlan } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { CheckCircle, Circle, Pill, Dumbbell, Moon, Thermometer, FlaskConical, Calendar, ShoppingCart, MapPin, ArrowRight } from "lucide-react";

interface Props {
  initialPlan: FertilityPlan | null;
  userId: string;
  province: string;
}

const WEEKLY_PHASES = [
  {
    weeks: "Weeks 1-4",
    phase: "Foundation",
    color: "teal",
    goals: [
      "Start your supplement stack (CoQ10, Zinc, Vitamin D, Omega-3)",
      "Establish a consistent 7-9 hour sleep schedule",
      "Remove heat sources: no hot tubs, saunas, or laptop on lap",
      "Cut alcohol to fewer than 5 drinks per week",
    ],
    why: "Sperm take ~74 days to mature (spermatogenesis). Changes you make now will show up in your retest results in 3 months.",
    weeks_range: [1, 2, 3, 4],
  },
  {
    weeks: "Weeks 5-8",
    phase: "Build",
    color: "blue",
    goals: [
      "Add 30+ minutes of moderate cardio 4x per week",
      "Incorporate antioxidant-rich foods (berries, leafy greens, nuts)",
      "Practice daily stress management (10 min meditation or breathwork)",
      "Cut alcohol to fewer than 3 drinks per week",
    ],
    why: "By week 5, your initial supplements are working. Adding exercise now boosts testosterone naturally and improves sperm motility.",
    weeks_range: [5, 6, 7, 8],
  },
  {
    weeks: "Weeks 9-12",
    phase: "Optimize",
    color: "purple",
    goals: [
      "Continue all habits from previous phases",
      "Maintain sleep quality - this is when HGH and testosterone peak",
      "Book your follow-up semen analysis for week 13",
      "Review and adjust any supplements with your doctor",
    ],
    why: "By this phase you've completed most of one full sperm development cycle. Results now should reflect your improvements.",
    weeks_range: [9, 10, 11, 12],
  },
  {
    weeks: "Week 13",
    phase: "Retest",
    color: "green",
    goals: [
      "Complete your 3-month semen analysis retest",
      "Abstain for 2-5 days before the test",
      "Use the same lab as your baseline test for accurate comparison",
      "Review results with your doctor or reproductive specialist",
    ],
    why: "Comparing your week 13 results to baseline shows exactly what your 90 days of work achieved - and informs what to do next.",
    weeks_range: [13],
  },
];

const SUPPLEMENTS = [
  {
    name: "CoQ10 (Ubiquinol)",
    dose: "200-600 mg/day",
    why: "Powerful antioxidant that protects sperm DNA and improves motility",
    timing: "With meals",
    buyUrl: "https://www.amazon.ca/s?k=CoQ10+Ubiquinol+200mg&i=hpc&tag=ferttrack-20",
  },
  {
    name: "Zinc",
    dose: "25-45 mg/day",
    why: "Essential for testosterone production and sperm morphology",
    timing: "With food",
    buyUrl: "https://www.amazon.ca/s?k=Zinc+supplement+30mg+bisglycinate&i=hpc&tag=ferttrack-20",
  },
  {
    name: "Vitamin D3",
    dose: "2000-4000 IU/day",
    why: "Low Vitamin D is linked to poor sperm quality. Most Canadians are deficient.",
    timing: "With fat-containing meal",
    buyUrl: "https://www.amazon.ca/s?k=Vitamin+D3+2000IU+supplement&i=hpc&tag=ferttrack-20",
  },
  {
    name: "Omega-3 (Fish Oil)",
    dose: "1-3 g EPA+DHA/day",
    why: "Supports sperm membrane fluidity and anti-inflammatory action",
    timing: "With meals",
    buyUrl: "https://www.amazon.ca/s?k=Omega-3+fish+oil+EPA+DHA+supplement&i=hpc&tag=ferttrack-20",
  },
  {
    name: "Folate (or 5-MTHF)",
    dose: "400-800 mcg/day",
    why: "Reduces sperm DNA fragmentation and supports morphology",
    timing: "Daily, any time",
    buyUrl: "https://www.amazon.ca/s?k=5-MTHF+methylfolate+supplement&i=hpc&tag=ferttrack-20",
  },
  {
    name: "L-Carnitine",
    dose: "1-3 g/day",
    why: "Directly supports sperm energy metabolism and motility",
    timing: "Before exercise or meals",
    buyUrl: "https://www.amazon.ca/s?k=L-Carnitine+supplement+1000mg&i=hpc&tag=ferttrack-20",
  },
];

const HABITS = [
  { icon: Thermometer, title: "Avoid Heat Exposure", color: "red", tips: ["Keep laptop off your lap - use a desk", "Skip hot tubs and saunas", "Wear loose-fitting underwear (boxers)", "Avoid sitting for long periods without breaks"] },
  { icon: Moon, title: "Prioritize Sleep", color: "blue", tips: ["Aim for 7-9 hours per night", "Keep a consistent bedtime (+/- 30 min)", "Testosterone peaks during deep sleep", "No screens 30 min before bed"] },
  { icon: Dumbbell, title: "Exercise Regularly", color: "green", tips: ["30-45 min moderate cardio 4x per week", "Avoid extreme endurance training (marathon training can reduce testosterone)", "Strength training 2x per week", "Walking counts - any movement helps"] },
  { icon: Pill, title: "Reduce Toxins", color: "yellow", tips: ["Limit alcohol to <3 drinks/week", "Quit smoking - nicotine directly damages sperm", "Avoid recreational drugs", "Be cautious with plastic food containers (BPA)"] },
];

function WeekBadge({ week, complete, current }: { week: number; complete: boolean; current: boolean }) {
  return (
    <div className={[
      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
      complete
        ? "bg-teal-500 text-white"
        : current
        ? "bg-teal-100 text-teal-700 ring-2 ring-teal-400"
        : "bg-charcoal-100 text-charcoal-500",
    ].join(" ")}>
      {complete ? <CheckCircle size={14} /> : week}
    </div>
  );
}

export default function PlanClient({ initialPlan, userId: _userId, province }: Props) {
  const plan = initialPlan;

  // Compute current day dynamically from start_date so progress advances automatically
  const currentDay = (() => {
    if (!plan?.start_date) return plan?.day_number ?? 1;
    const start = new Date(plan.start_date);
    const now = new Date();
    const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(days, 1), 91);
  })();
  const currentWeek = Math.min(Math.ceil(currentDay / 7), 13);
  const progress = Math.round((currentDay / 91) * 100);

  // Weeks up to and including the current week are marked complete
  function isWeekComplete(weekNum: number): boolean {
    return weekNum < currentWeek;
  }

  return (
    <div className="space-y-6">
      {/* Non-Ontario notice */}
      {province !== "Ontario" && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
          <MapPin size={17} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>You indicated you&apos;re in {province}.</strong> FertTrack is currently focused on Ontario — full coverage for your province is coming soon. The plan below is what Ontario users follow and is a useful reference wherever you are.
          </p>
        </div>
      )}

      {/* Progress header */}
      {plan && (
        <Card className="bg-gradient-to-br from-charcoal-800 to-charcoal-900 text-white border-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-charcoal-300 text-xs font-medium uppercase tracking-wide mb-1">Active Plan</p>
              <h2 className="text-lg font-bold">{plan.title}</h2>
              <p className="text-charcoal-400 text-sm mt-0.5">Day {currentDay} - Week {currentWeek} of 13</p>
            </div>
            <Badge label={`${progress}% done`} variant="teal" />
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 rounded-full transition-all duration-500" style={{ width: `${Math.max(progress, 2)}%` }} />
          </div>
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {Array.from({ length: 13 }, (_, i) => i + 1).map((w) => (
              <WeekBadge key={w} week={w} complete={isWeekComplete(w)} current={w === currentWeek} />
            ))}
          </div>
        </Card>
      )}

      {/* Weekly phases */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">Phase Breakdown</h2>
        <div className="space-y-3">
          {WEEKLY_PHASES.map((phase) => {
            const phaseComplete = phase.weeks_range.every((w) => isWeekComplete(w));
            const phaseActive = phase.weeks_range.some((w) => w === currentWeek);
            return (
              <Card key={phase.weeks}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">{phase.weeks}</span>
                      <Badge label={phase.phase} variant={phaseComplete ? "green" : phaseActive ? "teal" : "gray"} />
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {phase.goals.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-charcoal-700">
                          {phaseComplete
                            ? <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                            : <Circle size={14} className="text-charcoal-300 mt-0.5 flex-shrink-0" />}
                          {g}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-charcoal-500 bg-charcoal-50 rounded-xl p-3 leading-relaxed">
                      <span className="font-semibold text-charcoal-600">Why: </span>{phase.why}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Supplement stack */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">
          <span className="flex items-center gap-2"><Pill size={15} /> Supplement Stack</span>
        </h2>
        <Card padding="sm" className="mb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Pill size={16} className="text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-charcoal-800">Your full stack in one order</p>
              <p className="text-xs text-charcoal-500">CoQ10 · Zinc · Vitamin D3 · Omega-3 · Folate · L-Carnitine</p>
            </div>
          </div>
          <a
            href="https://www.amazon.ca/s?k=male+fertility+supplement+stack+CoQ10+zinc&i=hpc&tag=ferttrack-20"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("supplement_stack_buy_clicked")}
            className="mt-3 flex items-center justify-center gap-1.5 w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors"
          >
            <ShoppingCart size={14} /> Buy this week&apos;s stack
          </a>
        </Card>
        <div className="space-y-2.5">
          {SUPPLEMENTS.map((s) => (
            <Card key={s.name} padding="sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Pill size={16} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-charcoal-800 text-sm">{s.name}</h3>
                    <Badge label={s.dose} variant="teal" />
                    <Badge label={s.timing} variant="gray" />
                  </div>
                  <p className="text-xs text-charcoal-500 mt-1 mb-2">{s.why}</p>
                  <a
                    href={s.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("supplement_buy_clicked", { supplement: s.name })}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ShoppingCart size={12} />
                    Buy on Amazon.ca
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-xs text-charcoal-400 mt-3 px-1">
          Always discuss supplements with your doctor before starting, especially if you take other medications.
          Amazon.ca links are for convenience - compare prices and read reviews before purchasing.
        </p>
      </div>

      {/* Next step: plan → coverage */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 p-5">
        <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">While you build habits</p>
        <p className="text-white text-base font-bold mt-1">Determine your coverage</p>
        <p className="text-teal-100 text-sm mt-1 leading-relaxed">
          Most of your journey is OHIP-covered. Find out what&apos;s funded before your retest.
        </p>
        <Link
          href="/care"
          onClick={() => track("plan_to_coverage_clicked")}
          className="mt-3.5 flex items-center justify-center gap-1.5 w-full bg-white text-teal-700 hover:bg-teal-50 text-sm font-semibold rounded-xl py-2.5 transition-colors"
        >
          Check my coverage <ArrowRight size={14} />
        </Link>
      </div>

      {/* Habit goals */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">Habit Goals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HABITS.map(({ icon: Icon, title, color, tips }) => (
            <Card key={title}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${color}-100`}>
                  <Icon size={16} className={`text-${color}-600`} />
                </div>
                <h3 className="font-semibold text-charcoal-800 text-sm">{title}</h3>
              </div>
              <ul className="space-y-1.5">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-charcoal-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Retest schedule */}
      <Card className="bg-teal-50 border-teal-100">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical size={18} className="text-teal-600" />
          <h3 className="font-semibold text-teal-900">Retest Schedule</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "Baseline", timing: "Start of plan (now)", desc: "Record your starting numbers in Results" },
            { label: "Week 13 Retest", timing: "~90 days after start", desc: "Full semen analysis - use the same lab for accuracy" },
            { label: "Ongoing (if needed)", timing: "Every 3-6 months", desc: "Continue tracking with your specialist's guidance" },
          ].map((r) => (
            <div key={r.label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={13} className="text-teal-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-teal-900">{r.label} <span className="font-normal text-teal-700">- {r.timing}</span></p>
                <p className="text-xs text-teal-700 mt-0.5">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
