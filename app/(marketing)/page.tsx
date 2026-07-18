import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ClipboardList, LineChart, CalendarCheck, Compass } from "lucide-react";
import Button from "@/components/ui/Button";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import {
  PhoneFrame,
  DashboardScreen,
  ResultsScreen,
  PlanScreen,
  CareScreen,
} from "@/components/marketing/PhoneMockup";

const features = [
  {
    title: "A daily check-in that takes 30 seconds",
    description:
      "Track the four habits that actually move the needle — supplements, sleep, heat exposure, and exercise — with a live countdown to your 90-day retest.",
    screen: <DashboardScreen />,
  },
  {
    title: "Your semen analysis, decoded",
    description:
      "Enter your results and get a plain-language breakdown against WHO reference ranges — no medical degree required, and never a diagnosis.",
    screen: <ResultsScreen />,
  },
  {
    title: "A plan built around your biology",
    description:
      "Sperm takes about 13 weeks to mature. Your 90-day plan is structured week by week around that cycle, so you know exactly what to focus on and when.",
    screen: <PlanScreen />,
  },
  {
    title: "Navigate Ontario care with confidence",
    description:
      "Understand OHIP coverage, find a fertility specialist, and know what to ask at your first appointment.",
    screen: <CareScreen />,
  },
];

const steps = [
  {
    icon: ClipboardList,
    title: "Log your results",
    description:
      "Enter your semen analysis values and get an instant, plain-language breakdown.",
  },
  {
    icon: Compass,
    title: "Get your 90-day plan",
    description:
      "We build a week-by-week plan around the ~13-week sperm maturation cycle.",
  },
  {
    icon: CalendarCheck,
    title: "Check in daily",
    description:
      "A simple daily habit check-in keeps supplements, sleep, heat, and exercise on track.",
  },
  {
    icon: LineChart,
    title: "Track your progress",
    description:
      "Watch your consistency build toward your retest — and know what to expect from Ontario care along the way.",
  },
];

const faqs = [
  {
    question: "What is FertTrack?",
    answer:
      "FertTrack is a web app that helps men understand and improve their fertility. It covers understanding your semen analysis, building the daily habits that influence fertility, following a 90-day improvement plan, and navigating fertility care in Ontario.",
  },
  {
    question: "Is FertTrack a diagnosis or medical advice?",
    answer:
      "No. FertTrack is informational and non-diagnostic — it helps you understand your results and build better habits, but it never replaces a conversation with a clinician. Always talk to a doctor about your specific results and care.",
  },
  {
    question: "How does FertTrack use WHO reference ranges?",
    answer:
      "When you log a semen analysis, we compare your sperm count, motility, morphology, and volume against World Health Organization reference thresholds and explain what each result means in plain language.",
  },
  {
    question: "Is FertTrack free?",
    answer:
      "FertTrack is currently in beta and free to use while we gather feedback from early users. Pricing may change as we move out of beta — check back here for updates.",
  },
  {
    question: "Is FertTrack only for Ontario?",
    answer:
      "The Care & Coverage guide is currently built around Ontario's OHIP system, but the daily habit tracking, results breakdown, and 90-day plan are useful no matter where you live. We plan to expand regional coverage over time.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your data is protected with row-level security so only you can access it, and it's never sold or shared with third parties. We use it only to personalize your dashboard and plan.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-charcoal-900 tracking-tight max-w-3xl mx-auto leading-[1.1]">
          Your fertility, finally explained.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-charcoal-500 max-w-xl mx-auto leading-relaxed">
          Understand your semen analysis, build the daily habits that matter,
          and follow a 90-day plan built around your biology.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="secondary">
              See How It Works
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight">
            Everything you need in one place
          </h2>
          <p className="mt-4 text-charcoal-500 leading-relaxed">
            Four pillars, one app — built for men who want a clear roadmap,
            not just a lab report.
          </p>
        </div>

        <div className="space-y-20 sm:space-y-28">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={[
                "grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center",
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : "",
              ].join(" ")}
            >
              <div className={i % 2 === 1 ? "md:text-left" : ""}>
                <h3 className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight leading-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 text-charcoal-500 leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </div>
              <PhoneFrame>{feature.screen}</PhoneFrame>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="bg-white border-y border-charcoal-100 py-16 sm:py-24"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-charcoal-500 leading-relaxed">
              From your first result to your 90-day retest.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="relative mx-auto w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-teal-600" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-charcoal-900">{step.title}</h3>
                <p className="mt-1.5 text-sm text-charcoal-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight">
            Frequently asked questions
          </h2>
        </div>
        <FaqAccordion items={faqs} />
      </section>

      {/* Final CTA */}
      <section className="bg-teal-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Start your 90 days today
          </h2>
          <p className="mt-4 text-teal-50 max-w-md mx-auto leading-relaxed">
            Free during beta. Understand your results and build the habits
            that matter — in a few minutes.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
