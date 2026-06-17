"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
} from "lucide-react";

const FAQS = [
  {
    q: "How long until I see improvement in my semen analysis?",
    a: "Sperm take approximately 74 days to fully mature (a process called spermatogenesis). This means lifestyle changes you make today will take roughly 2.5–3 months to show up in a retest. Don't get discouraged — the improvements are real, they just take time. Most men see meaningful changes after a full 90-day plan.",
  },
  {
    q: "My results say 'low motility.' Is this serious?",
    a: "Low motility (below 42% total motility by WHO standards) is one of the most common semen analysis findings. It can make conception harder, but it's also one of the most responsive to lifestyle changes. L-carnitine supplementation, regular moderate exercise, and reducing oxidative stress (less alcohol, more antioxidants) are specifically shown to improve motility. It's worth discussing with a urologist if motility is severely low (below 20%).",
  },
  {
    q: "Should both partners be tested at the same time?",
    a: "Yes — reproductive medicine strongly recommends testing both partners simultaneously. Male factor contributes to about 40–50% of infertility cases. Testing both reduces overall time to diagnosis and allows the care team to understand the complete picture. This also means you may be evaluated together at a fertility clinic even if your family doctor initially sees you separately.",
  },
  {
    q: "What does OHIP actually cover for male fertility?",
    a: "OHIP covers semen analysis (when ordered by a physician), hormone blood tests (FSH, LH, testosterone), urologist consultations with referral, and surgical procedures like varicocele repair when medically indicated. The Ontario Fertility Program (OFP) funds one IVF cycle per patient, which includes ICSI — but fertility drugs, IUI, and additional IVF cycles are out of pocket. Always confirm current coverage with your provider.",
  },
  {
    q: "I feel embarrassed talking to my doctor about this. Is that normal?",
    a: "Completely normal. Male fertility is still an under-discussed topic, and many men report feeling embarrassed, anxious, or defensive when first confronting semen analysis results. Your doctor has had this conversation many times — there's nothing unusual about your situation. Being direct and bringing your results to the appointment will make the conversation easier and faster.",
  },
  {
    q: "Can supplements really make a difference?",
    a: "Yes, with realistic expectations. A large body of research supports the use of antioxidants (CoQ10, Vitamin C, Vitamin E, zinc) and L-carnitine for improving sperm count, motility, and morphology — particularly in men with oxidative stress-related infertility, which is very common. Improvements are typically modest to moderate and take 2–3 months to appear. Supplements are supportive, not a replacement for medical evaluation.",
  },
  {
    q: "My partner is frustrated with how long this is taking. How do we handle this?",
    a: "Fertility challenges put significant stress on relationships. Being honest and proactive — like using this plan — already puts you ahead. Some communication tips: share your test results and plan with your partner so you're working together, set joint check-ins rather than waiting for them to ask, acknowledge that her testing and treatments may have physical and emotional costs you don't carry, and consider couples counselling as a proactive step, not a crisis response.",
  },
  {
    q: "Is varicocele treatment worth it for fertility?",
    a: "For men with clinical varicocele (visible/palpable) and abnormal semen parameters, surgical repair (varicocelectomy) has strong evidence for improving sperm count and motility. It's OHIP-covered with a urologist referral. However, evidence is less clear for subclinical varicocele or men with normal semen parameters. A urologist specializing in male fertility can assess whether it's likely to help in your specific case.",
  },
];

const PARTNER_TIPS = [
  {
    title: "Have the numbers conversation early",
    desc: "Share your semen analysis results with your partner. Keeping them in the dark creates distance and often more anxiety — for both of you.",
  },
  {
    title: "Use 'we' language about fertility",
    desc: "It's not 'your problem' — it's a shared challenge. Using joint language ('we're working on this') reduces shame and increases partnership.",
  },
  {
    title: "Explain the 90-day biology",
    desc: "Tell your partner that sperm take 74 days to mature — improvements take time, but you're actively working on it. This reframes the timeline as progress, not delay.",
  },
  {
    title: "Attend appointments together when possible",
    desc: "Clinic appointments are less overwhelming with support. If your partner can attend a consultation, it helps both of you ask better questions and feel less alone.",
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
    desc: "Canadian forum and peer support — includes male factor subforum.",
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
    url: "https://www.psychologytoday.com/ca",
    badge: "Paid",
  },
];

interface Props {
  userId: string;
}

export default function SupportClient({ userId }: Props) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("support_requests").insert({
      user_id: userId,
      subject: form.subject,
      message: form.message,
    });
    track("support_submitted", { subject: form.subject });
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {/* FAQ */}
      <div>
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
      </div>

      {/* Partner communication */}
      <div>
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
      </div>

      {/* Support groups & therapy */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-blue-500" />
          <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide">
            Support Groups & Therapy
          </h2>
        </div>
        <div className="space-y-2.5">
          {SUPPORT_GROUPS.map((group) => (
            <a
              key={group.name}
              href={group.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("care_link_clicked", { resource: group.name })}
            >
              <Card padding="sm" className="hover:border-teal-200 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-charcoal-800 text-sm">{group.name}</h3>
                      <Badge label={group.badge} variant={group.badge === "Free" ? "green" : "gray"} />
                    </div>
                    <p className="text-xs text-charcoal-400 mb-1">{group.type}</p>
                    <p className="text-sm text-charcoal-600">{group.desc}</p>
                  </div>
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
              Fertility stress is real and significant. Cognitive Behavioral Therapy (CBT) and Acceptance and Commitment Therapy (ACT) have strong evidence for fertility-related anxiety and grief. Many Ontario therapists offer virtual sessions covered by private insurance.
            </p>
          </div>
        </div>
      </div>

      {/* Question submission form */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-teal-600" />
          <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide">
            Ask a Question
          </h2>
        </div>
        {submitted ? (
          <Card className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-charcoal-800 mb-1">Question submitted</h3>
            <p className="text-sm text-charcoal-500">We'll review it and add an answer to the FAQ if it's useful for others.</p>
            <button onClick={() => { setSubmitted(false); setForm({ subject: "", message: "" }); }} className="mt-4 text-sm text-teal-600 hover:underline">
              Ask another question
            </button>
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-charcoal-600 mb-4">
              Have a question that isn't answered above? Submit it here. We review all questions and update the FAQ regularly.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Subject</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Questions about varicocele treatment"
                  value={form.subject}
                  onChange={(e) => updateForm("subject", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Your Question</label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="Share as much context as you'd like. Your question is private."
                  value={form.message}
                  onChange={(e) => updateForm("message", e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-charcoal-400">
                Your question is private and linked only to your account. It will not be shared publicly without your permission.
              </p>
              <Button type="submit" loading={submitting} fullWidth>
                Submit Question
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
