"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/posthog";
import { SemenResult, WHO_REFERENCE, classifyResult } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { FlaskConical, Plus, X, Info, CheckCircle, AlertTriangle, XCircle, MapPin, ArrowRight, ShoppingCart } from "lucide-react";

interface Props {
  initialResults: SemenResult[];
  userId: string;
  province: string;
}

const EXPLAINERS = [
  {
    metric: "sperm_count",
    label: "Sperm Count",
    normal: "≥ 16 million/mL",
    icon: "🔬",
    what: "The concentration of sperm per millilitre of semen.",
    why: "Higher count means more sperm available to reach and fertilize the egg.",
    improve: "CoQ10 supplementation, reducing heat exposure, and cutting alcohol can improve count over 2–3 months.",
  },
  {
    metric: "motility",
    label: "Motility (Movement)",
    normal: "≥ 42% moving",
    icon: "🏃",
    what: "The percentage of sperm that are swimming and moving.",
    why: "Sperm must swim to reach the egg — motility is often the most important factor.",
    improve: "Regular moderate exercise, L-carnitine supplements, and reducing oxidative stress (antioxidants) all support motility.",
  },
  {
    metric: "morphology",
    label: "Morphology (Shape)",
    normal: "≥ 4% normal forms",
    icon: "🔵",
    what: "The percentage of sperm with normal, properly-formed shape.",
    why: "Sperm with normal shape can penetrate the egg more effectively.",
    improve: "Folic acid, zinc, and avoiding cigarette smoke support normal morphology.",
  },
  {
    metric: "volume",
    label: "Semen Volume",
    normal: "≥ 1.4 mL",
    icon: "💧",
    what: "The total amount of semen produced in one ejaculation.",
    why: "Low volume can reduce the number of sperm delivered. Very high volume can dilute concentration.",
    improve: "Adequate hydration and abstinence for 2–5 days before a test are key factors.",
  },
];

const DOCTOR_QUESTIONS = [
  "What do my results mean in context — are these clinically significant?",
  "Which parameter should I focus on improving first?",
  "How long before improvements typically show in a retest?",
  "Should I see a urologist or reproductive endocrinologist?",
  "Does OHIP cover further investigation given my results?",
  "Is a repeat test recommended, and when?",
  "Are there any medications or exposures that could be affecting my results?",
];

export default function ResultsClient({ initialResults, userId, province }: Props) {
  const [results, setResults] = useState<SemenResult[]>(initialResults);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    result_date: new Date().toISOString().split("T")[0],
    sperm_count: "",
    motility: "",
    morphology: "",
    volume: "",
    lab_name: "",
    notes: "",
  });

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("semen_results")
      .insert({
        user_id: userId,
        result_date: form.result_date,
        sperm_count: form.sperm_count ? parseFloat(form.sperm_count) : null,
        motility: form.motility ? parseFloat(form.motility) : null,
        morphology: form.morphology ? parseFloat(form.morphology) : null,
        volume: form.volume ? parseFloat(form.volume) : null,
        lab_name: form.lab_name || null,
        notes: form.notes || null,
      })
      .select()
      .single();

    if (!error && data) {
      setResults((prev) => [data, ...prev]);
      track("result_uploaded");
      setShowForm(false);
      setForm({
        result_date: new Date().toISOString().split("T")[0],
        sperm_count: "", motility: "", morphology: "", volume: "", lab_name: "", notes: "",
      });
    }
    setSubmitting(false);
  }

  const latest = results[0] ?? null;
  const categoryColors = { normal: "green", borderline: "yellow", low: "red" } as const;
  const categoryIcons = {
    normal: <CheckCircle size={16} className="text-green-500" />,
    borderline: <AlertTriangle size={16} className="text-yellow-500" />,
    low: <XCircle size={16} className="text-red-500" />,
  };

  return (
    <div className="space-y-6">
      {/* Non-Ontario notice */}
      {province !== "Ontario" && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
          <MapPin size={17} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>You indicated you&apos;re in {province}.</strong> FertTrack is currently focused on Ontario — full analysis and coverage for your province is coming soon. You can still log and track your results here.
          </p>
        </div>
      )}

      {/* Add result button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "ghost" : "primary"} size="md">
          {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add Result</>}
        </Button>
      </div>

      {/* Add result form */}
      {showForm && (
        <Card>
          <h3 className="font-semibold text-charcoal-800 mb-4">Enter Semen Analysis Result</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Test Date</label>
                <input type="date" className="input" value={form.result_date}
                  onChange={(e) => updateForm("result_date", e.target.value)} required />
              </div>
              <div>
                <label className="label">Lab Name (optional)</label>
                <input type="text" className="input" placeholder="e.g. Mount Sinai" value={form.lab_name}
                  onChange={(e) => updateForm("lab_name", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Sperm Count (M/mL)</label>
                <input type="number" className="input" placeholder="e.g. 20" step="0.1" min="0" value={form.sperm_count}
                  onChange={(e) => updateForm("sperm_count", e.target.value)} />
              </div>
              <div>
                <label className="label">Motility (%)</label>
                <input type="number" className="input" placeholder="e.g. 45" step="0.1" min="0" max="100" value={form.motility}
                  onChange={(e) => updateForm("motility", e.target.value)} />
              </div>
              <div>
                <label className="label">Morphology (%)</label>
                <input type="number" className="input" placeholder="e.g. 5" step="0.1" min="0" max="100" value={form.morphology}
                  onChange={(e) => updateForm("morphology", e.target.value)} />
              </div>
              <div>
                <label className="label">Volume (mL)</label>
                <input type="number" className="input" placeholder="e.g. 2.5" step="0.1" min="0" value={form.volume}
                  onChange={(e) => updateForm("volume", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="Anything from your doctor, abstinence period, etc."
                value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
            </div>
            <Button type="submit" loading={submitting} fullWidth>Save Result</Button>
          </form>
        </Card>
      )}

      {/* Latest result snapshot */}
      {latest && (
        <div>
          <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">
            Latest Result — {new Date(latest.result_date).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["sperm_count", "motility", "morphology", "volume"] as const).map((key) => {
              const val = latest[key];
              const ref = WHO_REFERENCE[key];
              const cat = classifyResult(val, key);
              return (
                <Card key={key} padding="sm" className="text-center">
                  <p className="text-xs text-charcoal-500 mb-0.5">{ref.label}</p>
                  <p className="text-2xl font-bold text-charcoal-900">{val ?? "—"}</p>
                  <p className="text-xs text-charcoal-400 mb-2">{ref.unit}</p>
                  <div className="flex items-center justify-center gap-1">
                    {categoryIcons[cat]}
                    <Badge label={cat === "normal" ? "Normal" : cat === "borderline" ? "Borderline" : "Low"} variant={categoryColors[cat]} />
                  </div>
                  <p className="text-xs text-charcoal-400 mt-1.5">Normal ≥ {ref.min}{ref.unit}</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Next step: results → plan (+ targeted supplement) */}
      {latest && (() => {
        // Find the weakest metric to personalize the hand-off to the plan.
        const order = { low: 0, borderline: 1, normal: 2 } as const;
        const metrics = (["sperm_count", "motility", "morphology", "volume"] as const)
          .map((key) => ({ key, cat: classifyResult(latest[key], key) }))
          .filter((m) => latest[m.key] !== null && latest[m.key] !== undefined)
          .sort((a, b) => order[a.cat] - order[b.cat]);
        const weakest = metrics[0];
        const allNormal = !weakest || weakest.cat === "normal";

        const focusCopy: Record<string, { line: string; supplement: string; shopHref: string }> = {
          sperm_count: {
            line: "Your sperm count needs attention — your plan's early weeks focus on the habits that rebuild it.",
            supplement: "CoQ10 + Zinc stack",
            shopHref: "https://www.amazon.ca/s?k=CoQ10+Ubiquinol+200mg&i=hpc&tag=ferttrack-20",
          },
          motility: {
            line: "Your motility is the metric to work on — weeks 3–6 of your plan target exactly that.",
            supplement: "CoQ10 + L-Carnitine stack",
            shopHref: "https://www.amazon.ca/s?k=CoQ10+L-Carnitine+supplement&i=hpc&tag=ferttrack-20",
          },
          morphology: {
            line: "Your morphology has room to improve — your plan pairs folate with the habits that support it.",
            supplement: "5-MTHF Methylfolate",
            shopHref: "https://www.amazon.ca/s?k=5-MTHF+methylfolate+supplement&i=hpc&tag=ferttrack-20",
          },
          volume: {
            line: "Your volume is below range — your plan's hydration and timing habits directly support it.",
            supplement: "Zinc + Omega-3 stack",
            shopHref: "https://www.amazon.ca/s?k=zinc+omega+3+mens+supplement&i=hpc&tag=ferttrack-20",
          },
        };
        const focus = weakest && !allNormal ? focusCopy[weakest.key] : null;

        return (
          <div className="space-y-3">
            <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 p-5">
              <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">Next step</p>
              <p className="text-white text-base font-bold mt-1">Your results shape your plan</p>
              <p className="text-teal-100 text-sm mt-1 leading-relaxed">
                {focus
                  ? focus.line
                  : "Everything's in range — your plan keeps it that way through your week-13 retest."}
              </p>
              <Link
                href="/plan"
                onClick={() => track("results_to_plan_clicked", { weakest: weakest?.key ?? "none" })}
                className="mt-3.5 flex items-center justify-center gap-1.5 w-full bg-white text-teal-700 hover:bg-teal-50 text-sm font-semibold rounded-xl py-2.5 transition-colors"
              >
                See your 90-day plan <ArrowRight size={14} />
              </Link>
            </div>

            {focus && weakest && (
              <Card padding="sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal-800">
                      Targeted for your {WHO_REFERENCE[weakest.key].label.toLowerCase()}
                    </p>
                    <p className="text-xs text-charcoal-500">{focus.supplement}</p>
                  </div>
                  <a
                    href={focus.shopHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("results_supplement_clicked", { metric: weakest.key })}
                    className="flex-shrink-0 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 px-3.5 py-2 rounded-lg transition-colors"
                  >
                    Shop
                  </a>
                </div>
              </Card>
            )}
          </div>
        );
      })()}

      {/* History table */}
      {results.length > 1 && (
        <div>
          <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">
            History
          </h2>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-charcoal-100">
                  <tr>
                    {["Date", "Count (M/mL)", "Motility (%)", "Morphology (%)"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-50">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-charcoal-50 transition-colors">
                      <td className="px-4 py-3 text-charcoal-700 whitespace-nowrap">{new Date(r.result_date).toLocaleDateString("en-CA")}</td>
                      <td className="px-4 py-3 text-charcoal-800 font-medium">{r.sperm_count ?? "—"}</td>
                      <td className="px-4 py-3 text-charcoal-800 font-medium">{r.motility ?? "—"}</td>
                      <td className="px-4 py-3 text-charcoal-800 font-medium">{r.morphology ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {results.length === 0 && !showForm && (
        <EmptyState
          icon={FlaskConical}
          title="No results yet"
          description="Add your first semen analysis to start tracking your fertility health."
          actionLabel="Add Result"
          onAction={() => setShowForm(true)}
        />
      )}

      {/* Plain-language explainers */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">
          What Do These Numbers Mean?
        </h2>
        <div className="space-y-3">
          {EXPLAINERS.map((ex) => (
            <Card key={ex.metric}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{ex.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-charcoal-800 text-sm">{ex.label}</h3>
                    <Badge label={`Normal: ${ex.normal}`} variant="teal" />
                  </div>
                  <p className="text-sm text-charcoal-600 mb-1"><strong className="text-charcoal-700">What it is:</strong> {ex.what}</p>
                  <p className="text-sm text-charcoal-600 mb-1"><strong className="text-charcoal-700">Why it matters:</strong> {ex.why}</p>
                  <p className="text-sm text-charcoal-600"><strong className="text-charcoal-700">How to improve:</strong> {ex.improve}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Questions for your doctor */}
      <Card className="bg-teal-50 border-teal-100">
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-teal-600" />
          <h3 className="font-semibold text-teal-900">Questions to Ask Your Doctor</h3>
        </div>
        <ul className="space-y-2">
          {DOCTOR_QUESTIONS.map((q, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-teal-800">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-200 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
              {q}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
