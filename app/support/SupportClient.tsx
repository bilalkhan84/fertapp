"use client";

import { useState } from "react";
import { track } from "@/lib/posthog";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Heart,
  Users,
  Brain,
  CheckCircle,
  Smartphone,
  ExternalLink,
} from "lucide-react";

const FAQS = [
  {
    q: "How long until I see improvement in my semen analysis?",
    a: "Sperm take approximately 74 days to fully mature (a process called spermatogenesis). This means lifestyle changes you make today will take roughly 2.5-3 months to show up in a retest. Don't get discouraged - the improvements are real, they just take time. Most men see meaningful changes after a full 90-day plan.",
  },
  {
    q: "My results say 'low motility.' Is this serious?",
    a: "Low motility (below 42% total motility by WHO standards) is one of the most common semen analysis findings. It can make conception harder, but it's also one of the most responsive to lifestyle changes. L-carnitine supplementation, regular moderate exercise, and reducing oxidative stress (less alcohol, more antioxidants) are specifically shown to improve motility. It's worth discussing with a urologist if motility is severely low (below 20%).",
  },
  {
    q: "Should both partners be tested at the same time?",
    a: "Yes - reproductive medicine strongly recommends testing both partners simultaneously. Male factor contributes to about 40-50% of infertility cases. Testing both reduces overall time to diagnosis and allows the care team to understand the complete picture.",
  },
  {
    q: "What does OHIP actually cover for male fertility?",
    a: "OHIP covers semen analysis (when ordered by a physician), hormone blood tests (FSH, LH, testosterone), urologist consultations with referral, and surgical procedures like varicocele repair when medically indicated. The Ontario Fertility Program (OFP) funds one IVF cycle per patient. Always confirm current coverage with your provider.",
  },
  {
    q: "I feel embarrassed talking to my doctor about this. Is that normal?",
    a: "Completely normal. Male fertility is still an under-discussed topic, and many men report feeling embarrassed or anxious when first confronting semen analysis results. Your doctor has had this conversation many times. Being direct and bringing your results to the appointment will make the conversation easier.",
  },
  {
    q: "Can supplements really make a difference?",
    a: "Yes, with realistic expectations. Research supports the use of antioxidants (CoQ10, Vitamin C, Vitamin E, zinc) and L-carnitine for improving sperm count, motility, and morphology. Improvements are typically modest to moderate and take 2-3 months to appear. Supplements are supportive, not a replacement for medical evaluation.",
  },
  {
    q: "My partner is frustrated with how long this is taking. How do we handle this?",
    a: "Fertility challenges put significant stress on relationships. Share your test results and plan with your partner so you're working together. Set joint check-ins rather than waiting for them to ask. Acknowledge that her testing and treatments may have physical and emotional costs you don't carry. Consider couples counselling as a proactive step.",
  },
  {
    q: "Is varicocele treatment worth it for fertility?",
    a: "For men with clinical varicocele (visible/palpable) and abnormal semen parameters, surgical repair (varicocelectomy) has strong evidence for improving sperm count and motility. It's OHIP-covered with a urologist referral. A urologist specializing in male fertility can assess whether it's likely to help in your specific case.",
  },
];

const PARTNER_TIPS = [
  {
    title: "Have the numbers conversation early",
    desc: "Share your semen analysis results with your partner. Keeping them in the dark creates distance and often more anxiety - for both of you.",
  },
  {
    title: "Use 'we' language about fertility",
    desc: "It's not 'your problem' - it's a shared challenge. Using joint language ('we're working on this') reduces shame and increases partnership.",
  },
  {
    title: "Explain the 90-day biology",
    desc: "Tell your partner that sperm take 74 days to mature - improvements take time, but you're actively working on it.",
  },
  {
    title: "Attend appointments together when possible",
    desc: "Clinic appointments are less overwhelming with support. If your partner can attend a consultation, it helps both of you ask better questions.",
  },
  {
    title: "Acknowledge the asymmetry",
    desc: "Female fertility treatment is often more invasive and physically taxing than male lifestyle changes. Acknowledging this openly builds trust.",
  },
];

const SUPPORT_GROUPS = [
  {
    name: "Fertility Matters Canada",
    type: "National org",
    desc: "Peer support network and online community for all Canadians going through fertility challenges.",
    url: "https://fertilitymatters.ca",
    badge: "Free",
  },
  {
    name: "My Fertility Matters",
    type: "Online community",
    desc: "Canadian forum and peer support - includes male factor subforum.",
    url: "https://myfertilitymatters.ca",
    badge: "Free",
  },
  {
    name: "Male Fertility Foundation",
    type: "UK org, global resource",
    desc: "Excellent educational resources and community specifically for men navigating fertility.",
    url: "https://malefertility.co.uk",
    badge: "Free",
  },
  {
    name: "Psychology Today Therapist Finder",
    type: "Therapist directory",
    desc: "Find Ontario therapists specializing in fertility-related anxiety and grief. Filter by 'infertility' specialty.",
    url: "https://www.psychologytoday.com/ca/therapists",
    badge: "Paid",
  },
];

interface Props {
  userId: string;
}

type FormType = "medical" | "app";

function QuestionForm({ userId, type }: { userId: string; type: FormType }) {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subject: form.subject, message: form.message, type }),
      });
      track("support_submitted", { subject: form.subject, type });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-charcoal-800 mb-1">Message sent</h3>
        <p className="text-sm text-charcoal-500">
          {type === "app"
            ? "Thanks for the feedback! We'll look into it."
            : "We'll review your question and may add it to the FAQ."}
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ subject: "", message: "" }); }}
          className="mt-4 text-sm text-teal-600 hover:underline"
        >
          Send another message
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-sm text-charcoal-600 mb-4">
        {type === "app"
          ? "Found a bug, have a feature request, or want to give us feedback about the app? Let us know here."
          : "Have a question that isn't answered above? Submit it here. We review all questions and update the FAQ regularly."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            {type === "app" ? "Subject" : "Subject"}
          </label>
          <input
            type="text"
            className="input"
            placeholder={type === "app" ? "e.g. Bug on dashboard page" : "e.g. Questions about varicocele treatment"}
            value={form.subject}
            onChange={(e) => updateForm("subject", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">
            {type === "app" ? "Details" : "Your Question"}
          </label>
          <textarea
            className="input min-h-[100px] resize-none"
            placeholder={
              type === "app"
                ? "Describe the issue or feature request in as much detail as possible."
                : "Share as much context as you'd like. Your question is private."
            }
            value={form.message}
            onChange={(e) => updateForm("message", e.target.value)}
            required
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-charcoal-400">
          Your message is private and linked only to your account.
        </p>
        <Button type="submit" loading={submitting} fullWidth>
          {type === "app" ? "Send Feedback" : "Submit Question"}
        </Button>
      </form>
    </Card>
  );
}

export default function SupportClient({ userId }: Props) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* FAQ */}
      <section>
        <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">
          Common Questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <Card key={i} padding="none">
              <button
                className="w-full flex items-start justify-between gap-3 p-4 text-left"
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              >
                <span className="text-sm font-medium text-charcoal-800 flex-1 pr-2">{faq.q}</span>
                {openFAQ === i
                  ? <ChevronUp size={18} className="text-charcoal-400 flex-shrink-0 mt-0.5" />
                  : <ChevronDown size={18} className="text-charcoal-400 flex-shrink-0 mt-0.5" />}
              </button>
              {openFAQ === i && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-sm text-charcoal-600 leading-relaxed border-t border-charcoal-100 pt-3">{faq.a}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Partner communication */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-rose-500" />
          <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide">
            Talking to Your Partner
          </h2>
        </div>
        <div className="space-y-2.5">
          {PARTNER_TIPS.map((tip) => (
            <Card key={tip.title} padding="sm">
              <h3 className="font-semibold text-charcoal-800 text-sm mb-1">{tip.title}</h3>
              <p className="text-sm text-charcoal-600">{tip.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Support groups & therapy */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-blue-500" />
          <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide">
            Support Groups &amp; Therapy
          </h2>
        </div>
        <div className="space-y-2">
          {SUPPORT_GROUPS.map((group) => (
            <a
              key={group.name}
              href={group.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("care_link_clicked", { resource: group.name })}
              className="block"
            >
              <Card padding="sm" className="hover:border-teal-200 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-charcoal-800 text-sm">{group.name}</h3>
                      <Badge label={group.badge} variant={group.badge === "Free" ? "green" : "gray"} />
                    </div>
                    <p className="text-xs text-charcoal-400 mb-1">{group.type}</p>
                    <p className="text-sm text-charcoal-600">{group.desc}</p>
                  </div>
                  <ExternalLink size={14} className="text-charcoal-300 flex-shrink-0 mt-1" />
                </div>
              </Card>
            </a>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <Brain size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Consider talking to a therapist</p>
            <p className="text-sm text-blue-700">
              Fertility stress is real and significant. Cognitive Behavioral Therapy (CBT) and Acceptance and
              Commitment Therapy (ACT) have strong evidence for fertility-related anxiety and grief. Many Ontario
              therapists offer virtual sessions covered by private insurance.
            </p>
          </div>
        </div>
      </section>

      {/* Ask a medical/general question */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-teal-600" />
          <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide">
            Ask a Question
          </h2>
        </div>
        <QuestionForm userId={userId} type="medical" />
      </section>

      {/* App feedback / bug report */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={16} className="text-charcoal-500" />
          <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide">
            App Feedback &amp; Bug Reports
          </h2>
        </div>
        <QuestionForm userId={userId} type="app" />
      </section>

      {/* Legal disclaimer */}
      <div className="p-4 bg-charcoal-50 rounded-2xl border border-charcoal-100">
        <p className="text-xs text-charcoal-500 leading-relaxed">
          <strong className="text-charcoal-600">Medical Disclaimer:</strong> FertTrack is for informational
          purposes only. The content on this app does not constitute medical advice, diagnosis, or treatment.
          Supplement recommendations and lifestyle suggestions are based on general research and do not replace
          personalized medical care. Always consult a licensed healthcare provider before beginning any supplement
          regimen or making significant changes to your health routine. Results may vary.
        </p>
        <p className="text-xs text-charcoal-500 mt-2 leading-relaxed">
          <strong className="text-charcoal-600">Privacy:</strong> Questions and messages submitted through this
          form are stored securely and reviewed only by the FertTrack team. Your data will never be sold or
          shared with third parties.
        </p>
      </div>
    </div>
  );
}
