"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/posthog";
import { OnboardingFormData } from "@/types";
import { Leaf, ArrowRight, ArrowLeft, Check } from "lucide-react";
import Button from "@/components/ui/Button";

const TOTAL_STEPS = 7;

const initialData: OnboardingFormData = {
  trying_timeline: "",
  age_range: "",
  province: "Ontario",
  has_semen_analysis: false,
  biggest_goal: "",
  hardest_action: "",
  wants_care_guidance: true,
};

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

function OptionCard({ label, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all duration-150",
        selected
          ? "border-teal-500 bg-teal-50 text-teal-800"
          : "border-charcoal-200 bg-white text-charcoal-800 hover:border-charcoal-300",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
            selected ? "border-teal-500 bg-teal-500" : "border-charcoal-300",
          ].join(" ")}
        >
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
        <div>
          <div className="font-medium text-sm">{label}</div>
          {description && (
            <div className="text-xs text-charcoal-500 mt-0.5">{description}</div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingFormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Fire onboarding_started on mount (only once)
  useState(() => {
    track("onboarding_started");
  });

  function update(field: keyof OnboardingFormData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    track("onboarding_step_completed", { step });
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Save onboarding responses
    await supabase.from("onboarding_responses").insert({
      user_id: user.id,
      ...data,
    });

    // Create starter 90-day plan
    await supabase.from("fertility_plans").insert({
      user_id: user.id,
      title: "Your 90-Day Fertility Plan",
      day_number: 1,
      progress_percent: 0,
      status: "active",
      start_date: new Date().toISOString().split("T")[0],
    });

    // Mark onboarding complete
    await supabase
      .from("profiles")
      .update({ onboarding_complete: true, province: data.province })
      .eq("id", user.id);

    track("onboarding_completed", {
      timeline: data.trying_timeline,
      has_analysis: data.has_semen_analysis,
      goal: data.biggest_goal,
    });

    router.push("/dashboard");
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-teal-600 flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-charcoal-900 text-sm">FertTrack</span>
        </div>
        <span className="text-xs text-charcoal-400 font-medium">
          {step} of {TOTAL_STEPS}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-5 max-w-lg mx-auto w-full">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-5 py-8">
        {step === 1 && (
          <StepShell
            title="Where are you in your fertility journey?"
            subtitle="This helps us personalize your plan."
          >
            {[
              { value: "now", label: "Trying to conceive now", description: "Actively trying with my partner" },
              { value: "within_year", label: "Planning within the year", description: "Getting prepared before trying" },
              { value: "planning", label: "Planning for the future", description: "Just want to understand my health" },
            ].map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                description={o.description}
                selected={data.trying_timeline === o.value}
                onClick={() => update("trying_timeline", o.value)}
              />
            ))}
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Where are you located?" subtitle="We tailor care and coverage guidance by province.">
            {["Ontario", "British Columbia", "Alberta", "Quebec", "Other province"].map((prov) => (
              <OptionCard
                key={prov}
                label={prov}
                selected={data.province === prov}
                onClick={() => update("province", prov)}
              />
            ))}
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="What's your age range?" subtitle="Sperm health changes with age — we use this for context.">
            {["20–25", "26–30", "31–35", "36–40", "40+"].map((r) => (
              <OptionCard
                key={r}
                label={r}
                selected={data.age_range === r}
                onClick={() => update("age_range", r)}
              />
            ))}
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title="Do you already have a semen analysis result?"
            subtitle="You can upload it on your Results page."
          >
            {[
              { value: true, label: "Yes, I have a result", description: "I can enter my numbers" },
              { value: false, label: "Not yet", description: "I'll get one or update it later" },
            ].map((o) => (
              <OptionCard
                key={String(o.value)}
                label={o.label}
                description={o.description}
                selected={data.has_semen_analysis === o.value}
                onClick={() => update("has_semen_analysis", o.value)}
              />
            ))}
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title="What's your biggest goal right now?" subtitle="We'll focus your plan on what matters most to you.">
            {[
              { value: "understand_results", label: "Understand my semen analysis", description: "Make sense of the numbers" },
              { value: "improve_numbers", label: "Improve my sperm health", description: "Build better habits" },
              { value: "navigate_care", label: "Navigate Ontario fertility care", description: "Find the right specialists" },
              { value: "support", label: "Find support and guidance", description: "Connect with resources" },
            ].map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                description={o.description}
                selected={data.biggest_goal === o.value}
                onClick={() => update("biggest_goal", o.value)}
              />
            ))}
          </StepShell>
        )}

        {step === 6 && (
          <StepShell title="What's hardest to change right now?" subtitle="No judgment — this helps us set realistic goals.">
            {[
              { value: "diet", label: "Eating healthier", description: "Diet and nutrition" },
              { value: "exercise", label: "Exercising consistently", description: "Getting regular movement" },
              { value: "sleep", label: "Getting enough sleep", description: "7–9 hours per night" },
              { value: "stress", label: "Managing stress", description: "Work, relationship pressures" },
              { value: "alcohol", label: "Reducing alcohol", description: "Cutting back on drinking" },
              { value: "heat", label: "Avoiding heat exposure", description: "Hot tubs, laptops on lap" },
            ].map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                description={o.description}
                selected={data.hardest_action === o.value}
                onClick={() => update("hardest_action", o.value)}
              />
            ))}
          </StepShell>
        )}

        {step === 7 && (
          <StepShell
            title="Would you like Ontario care & coverage guidance?"
            subtitle="We'll explain your likely next steps in the Ontario healthcare system."
          >
            {[
              { value: true, label: "Yes, include care guidance", description: "Referrals, clinics, and OHIP coverage" },
              { value: false, label: "No thanks, just the plan", description: "I'll explore that later" },
            ].map((o) => (
              <OptionCard
                key={String(o.value)}
                label={o.label}
                description={o.description}
                selected={data.wants_care_guidance === o.value}
                onClick={() => update("wants_care_guidance", o.value)}
              />
            ))}
          </StepShell>
        )}
      </div>

      {/* Footer nav */}
      <div className="sticky bottom-0 bg-offwhite border-t border-charcoal-100 px-5 py-4 max-w-lg mx-auto w-full">
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="ghost" onClick={prevStep} size="lg">
              <ArrowLeft size={16} />
              Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button onClick={nextStep} size="lg" fullWidth>
              Continue
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={submitting}
              size="lg"
              fullWidth
            >
              Build my plan
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-charcoal-900 mb-1.5">{title}</h2>
      <p className="text-sm text-charcoal-500 mb-6">{subtitle}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
