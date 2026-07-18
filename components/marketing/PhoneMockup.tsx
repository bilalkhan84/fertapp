import { ReactNode } from "react";
import { Flame, Moon, Dumbbell, Pill, CheckCircle2, MapPin, Stethoscope } from "lucide-react";

/**
 * Device frame wrapping a recreated screen. These are illustrative
 * recreations of FertTrack's real screens (not photos) — swap the
 * children for actual screenshots whenever you have them.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px] select-none">
      <div className="relative rounded-[2.5rem] border-[8px] border-charcoal-900 bg-charcoal-900 shadow-xl overflow-hidden aspect-[9/19.5]">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-charcoal-900 rounded-b-2xl z-10" />
        <div className="absolute inset-0 bg-offwhite overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

function ScreenHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="pt-8 px-4 pb-3">
      <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">
        {subtitle}
      </p>
      <h3 className="text-base font-bold text-charcoal-900 mt-0.5">{title}</h3>
    </div>
  );
}

export function DashboardScreen() {
  const items = [
    { icon: Pill, label: "Supplements", done: true },
    { icon: Moon, label: "Sleep", done: true },
    { icon: Flame, label: "Heat exposure", done: false },
    { icon: Dumbbell, label: "Exercise", done: false },
  ];
  return (
    <div className="h-full">
      <ScreenHeader title="Today's check-in" subtitle="Day 42 of 90" />
      <div className="px-4">
        <div className="progress-bar mb-4">
          <div className="progress-bar-fill" style={{ width: "47%" }} />
        </div>
        <div className="space-y-2">
          {items.map(({ icon: Icon, label, done }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 bg-white rounded-xl border border-charcoal-100 px-3 py-2.5"
            >
              <div
                className={[
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  done ? "bg-teal-100" : "bg-charcoal-100",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "w-3.5 h-3.5",
                    done ? "text-teal-600" : "text-charcoal-400",
                  ].join(" ")}
                />
              </div>
              <span className="text-xs font-medium text-charcoal-800 flex-1">
                {label}
              </span>
              {done && <CheckCircle2 className="w-4 h-4 text-teal-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResultsScreen() {
  const rows = [
    { label: "Sperm count", value: 62, status: "normal" as const },
    { label: "Motility", value: 78, status: "normal" as const },
    { label: "Morphology", value: 55, status: "borderline" as const },
    { label: "Volume", value: 90, status: "normal" as const },
  ];
  const barColor = {
    normal: "bg-teal-500",
    borderline: "bg-yellow-400",
    low: "bg-red-400",
  };
  return (
    <div className="h-full">
      <ScreenHeader title="Your results" subtitle="WHO reference breakdown" />
      <div className="px-4 space-y-3.5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-charcoal-700">
                {row.label}
              </span>
              <span className="text-[10px] font-semibold text-charcoal-400 uppercase">
                {row.status}
              </span>
            </div>
            <div className="progress-bar h-1.5">
              <div
                className={["h-full rounded-full", barColor[row.status]].join(" ")}
                style={{ width: `${row.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlanScreen() {
  const weeks = Array.from({ length: 13 }, (_, i) => i + 1);
  return (
    <div className="h-full">
      <ScreenHeader title="90-day plan" subtitle="Week 6 of 13" />
      <div className="px-4">
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {weeks.map((w) => (
            <div
              key={w}
              className={[
                "aspect-square rounded-md flex items-center justify-center text-[9px] font-semibold",
                w < 6
                  ? "bg-teal-500 text-white"
                  : w === 6
                  ? "bg-teal-100 text-teal-700 ring-2 ring-teal-500"
                  : "bg-charcoal-100 text-charcoal-400",
              ].join(" ")}
            >
              {w}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-3">
          <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider mb-1">
            This week
          </p>
          <p className="text-xs text-charcoal-700 leading-relaxed">
            Keep testicular temperature down — swap hot baths for short, cool
            showers.
          </p>
        </div>
      </div>
    </div>
  );
}

export function CareScreen() {
  const steps = [
    { icon: MapPin, label: "OHIP coverage near you" },
    { icon: Stethoscope, label: "Find a fertility specialist" },
    { icon: CheckCircle2, label: "What to ask at your first visit" },
  ];
  return (
    <div className="h-full">
      <ScreenHeader title="Care & coverage" subtitle="Ontario guide" />
      <div className="px-4 space-y-2">
        {steps.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 bg-white rounded-xl border border-charcoal-100 px-3 py-3"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <span className="text-xs font-medium text-charcoal-800">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
