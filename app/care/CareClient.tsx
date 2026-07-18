"use client";

import Link from "next/link";
import { track } from "@/lib/posthog";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  Stethoscope,
  UserRound,
  Building2,
  FlaskConical,
  DollarSign,
  ArrowRight,
  Phone,
  Globe,
  CheckCircle,
  Info,
  MapPin,
} from "lucide-react";

const CARE_STEPS = [
  {
    step: 1,
    icon: FlaskConical,
    title: "Get a Semen Analysis",
    subtitle: "If you haven't yet",
    desc: "A semen analysis is typically the first test ordered for male fertility. Your family doctor can order it.",
    coverage: "Covered by OHIP when ordered by your doctor",
    action: "Ask your family doctor for a referral to a lab. LifeLabs and Dynacare both process semen analyses in Ontario.",
    covered: true,
  },
  {
    step: 2,
    icon: UserRound,
    title: "Family Doctor (GP/PCP)",
    subtitle: "First stop — always",
    desc: "Share your semen analysis results with your family doctor. They will order any additional blood work (FSH, LH, testosterone) and can refer you onward.",
    coverage: "Covered by OHIP",
    action: "Bring your analysis results and ask: 'Based on these results, should I see a urologist or go directly to a fertility clinic?'",
    covered: true,
  },
  {
    step: 3,
    icon: Stethoscope,
    title: "Urologist",
    subtitle: "Male fertility specialist",
    desc: "A urologist specializing in male fertility can diagnose and treat underlying causes — varicocele, hormonal issues, blockages. This is often the most productive step for abnormal results.",
    coverage: "Covered by OHIP with a referral",
    action: "Ask your GP for a referral to a urologist with andrology or male infertility experience.",
    covered: true,
  },
  {
    step: 4,
    icon: Building2,
    title: "Fertility Clinic",
    subtitle: "For IUI/IVF/ICSI",
    desc: "If natural conception isn't occurring or results are severely abnormal, a fertility clinic provides IUI, IVF, and ICSI. Ontario provides one cycle of IVF funding per patient.",
    coverage: "One IVF cycle funded by OHIP (via the Ontario Fertility Program). Drugs, additional cycles, and some diagnostics are not covered.",
    action: "Your GP or urologist can refer you, or you can self-refer to most Ontario fertility clinics.",
    covered: "partial",
  },
];

const COVERAGE_BASICS = [
  {
    item: "Semen Analysis (basic)",
    covered: true,
    notes: "Ordered by a licensed Ontario physician",
  },
  {
    item: "Follow-up semen analyses",
    covered: true,
    notes: "OHIP covers medically necessary repeats",
  },
  {
    item: "Hormone blood work (FSH, LH, Testosterone)",
    covered: true,
    notes: "Ordered by your GP or urologist",
  },
  {
    item: "Urologist consultation",
    covered: true,
    notes: "Requires referral from family doctor",
  },
  {
    item: "Varicocele treatment (surgery)",
    covered: true,
    notes: "When medically indicated",
  },
  {
    item: "One IVF cycle",
    covered: "partial",
    notes: "Ontario Fertility Program — one cycle funded, medication costs not included (~$5,000/cycle)",
  },
  {
    item: "IUI (intrauterine insemination)",
    covered: "partial",
    notes: "Covered by OHIP via the Ontario Fertility Program — no limit on the number of cycles. Fertility drugs (~$1,000/cycle) are not included.",
  },
  {
    item: "Sperm DNA fragmentation test",
    covered: false,
    notes: "Not OHIP-covered; ~$200–$400 privately",
  },
  {
    item: "Fertility drugs",
    covered: false,
    notes: "Significant out-of-pocket or private insurance",
  },
];

const REFERRAL_QUESTIONS = [
  "Is my semen analysis result clinically significant enough to warrant a referral?",
  "Should I see a urologist first, or go directly to a fertility clinic?",
  "Can you order hormone blood work (FSH, LH, testosterone, prolactin)?",
  "What does the Ontario Fertility Program cover, and do I qualify?",
  "How long is the waitlist for a urologist referral in our area?",
  "Would a sperm DNA fragmentation test change our approach?",
  "If my partner has already done fertility testing, how do we coordinate care?",
];

const ONTARIO_CLINICS = [
  { name: "Mount Sinai Fertility", city: "Toronto", phone: "416-586-4533", website: "https://www.mountsinaifertility.com" },
  { name: "TRIO Fertility", city: "Toronto", phone: "416-506-0804", website: "https://www.triofertility.com" },
  { name: "ReproMed", city: "Toronto", phone: "416-586-8224", website: "https://repromed.ca" },
  { name: "Hannam Fertility Centre", city: "Toronto", phone: "416-691-0555", website: "https://hannamfertility.com" },
  { name: "Lunenfeld-Tanenbaum Research Institute", city: "Toronto", website: "https://www.lunenfeld.ca" },
  { name: "Ottawa Fertility Centre", city: "Ottawa", phone: "613-798-9080", website: "https://ottawafertility.com" },
];

interface Props {
  province: string;
}

export default function CareClient({ province }: Props) {
  return (
    <div className="space-y-6">
      {/* Province banner */}
      {province === "Ontario" ? (
        <div className="flex items-start gap-3 px-4 py-3 bg-teal-50 border border-teal-100 rounded-2xl">
          <MapPin size={17} className="text-teal-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-teal-800">
            <strong>You&apos;re in Ontario</strong> — you have access to some of the best fertility care in Canada, plus the Ontario Fertility Program which funds one IVF cycle.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
          <MapPin size={17} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">You indicated you&apos;re in {province}</p>
            <p className="text-sm text-amber-700">
              FertTrack is currently focused on Ontario care and coverage — we&apos;ll be expanding to your province soon.
              For now, please speak with your family doctor or visit your provincial health authority for fertility care guidance.
              The pathway below reflects Ontario and is a useful reference for questions to ask your own provider.
            </p>
          </div>
        </div>
      )}

      {/* Care pathway */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">
          Your Likely Care Path
        </h2>
        <div className="space-y-3">
          {CARE_STEPS.map(({ step, icon: Icon, title, subtitle, desc, coverage, action, covered }) => (
            <Card key={step}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Icon size={18} className="text-teal-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-charcoal-400">STEP {step}</span>
                    <h3 className="font-semibold text-charcoal-800 text-sm">{title}</h3>
                    <Badge label={subtitle} variant="gray" />
                    {covered === true && <Badge label="OHIP Covered" variant="green" />}
                    {covered === "partial" && <Badge label="Partially Covered" variant="yellow" />}
                    {covered === false && <Badge label="Not Covered" variant="red" />}
                  </div>
                  <p className="text-sm text-charcoal-600 mb-2">{desc}</p>
                  <div className="flex items-start gap-2 bg-charcoal-50 rounded-xl p-3">
                    <Info size={14} className="text-charcoal-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-charcoal-600 mb-0.5">Coverage: {coverage}</p>
                      <p className="text-xs text-charcoal-500">{action}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Coverage table */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">
          Ontario Coverage Quick Reference
        </h2>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-charcoal-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wide">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wide">OHIP</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wide hidden sm:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {COVERAGE_BASICS.map((row) => (
                  <tr key={row.item} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-4 py-3 text-charcoal-700 text-xs">{row.item}</td>
                    <td className="px-4 py-3">
                      {row.covered === true && <CheckCircle size={16} className="text-green-500" />}
                      {row.covered === "partial" && <Badge label="Partial" variant="yellow" />}
                      {row.covered === false && <span className="text-xs text-red-500 font-medium">No</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal-500 hidden sm:table-cell">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-charcoal-400 mt-2 px-1">
          Coverage details change. Always confirm with your provider and OHIP directly. Last reviewed 2025.
        </p>
      </div>

      {/* Specialist matching */}
      <div id="specialists">
        <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">
          Ontario Fertility Clinics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ONTARIO_CLINICS.map((clinic) => (
            <Card key={clinic.name} padding="sm">
              <h3 className="font-semibold text-charcoal-800 text-sm">{clinic.name}</h3>
              <p className="text-xs text-charcoal-500 mt-0.5 mb-3">{clinic.city}, ON</p>
              <div className="flex items-center gap-2 flex-wrap">
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 bg-charcoal-100 hover:bg-charcoal-200 active:bg-charcoal-300 px-3 py-1.5 rounded-lg transition-colors"
                    onClick={() => track("care_link_clicked", { clinic: clinic.name, action: "phone" })}
                  >
                    <Phone size={12} />
                    {clinic.phone}
                  </a>
                )}
                <a
                  href={clinic.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 px-3 py-1.5 rounded-lg transition-colors"
                  onClick={() => track("care_link_clicked", { clinic: clinic.name, action: "website" })}
                >
                  <Globe size={12} />
                  Visit website
                </a>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-3 p-4 bg-charcoal-50 rounded-2xl">
          <p className="text-xs text-charcoal-500">
            <strong className="text-charcoal-600">Note:</strong> Most Ontario fertility clinics accept self-referrals for initial consultations. You can call directly without waiting for a GP referral, though OHIP coverage may require one. Wait times vary from 2 weeks to 3+ months.
          </p>
        </div>
      </div>

      {/* Questions to ask */}
      <Card className="bg-teal-50 border-teal-100">
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-teal-600" />
          <h3 className="font-semibold text-teal-900">Questions to Ask Your Doctor</h3>
        </div>
        <ul className="space-y-2">
          {REFERRAL_QUESTIONS.map((q, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-teal-800">
              <ArrowRight size={14} className="text-teal-500 mt-0.5 flex-shrink-0" />
              {q}
            </li>
          ))}
        </ul>
      </Card>

      {/* External resources */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wide mb-3">
          Official Resources
        </h2>
        <div className="space-y-2.5">
          {[
            { label: "Ontario Fertility Program (MOHLTC)", href: "https://www.ontario.ca/page/fertility-treatments", desc: "Official government page for funded IVF cycle eligibility" },
            { label: "OHIP Coverage Tool", href: "https://www.ontario.ca/page/health-care-in-ontario", desc: "Check what OHIP covers for your situation" },
            { label: "Canadian Fertility & Andrology Society", href: "https://cfas.ca", desc: "Professional body — find certified fertility specialists" },
          ].map((r) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("care_link_clicked", { href: r.href })}
            >
              <Card padding="sm" className="hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-teal-700">{r.label}</p>
                    <p className="text-xs text-charcoal-500 mt-0.5">{r.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-charcoal-400 flex-shrink-0 mt-0.5" />
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
