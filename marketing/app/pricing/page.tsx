import type { Metadata } from 'next'
import { PageHero, SectionHeading, CtaBand } from '@/components/ui'
import { Reveal, Stagger, StaggerItem, HoverLift, FloatingOrb } from '@/components/motion'
import Faq from '@/components/Faq'
import { PricingCalculator } from '@/components/PricingCalculator'

export const metadata: Metadata = {
  title: 'Pricing — MindGuard',
  description:
    'MindGuard pricing: a free Pilot tier, School and District/University plans. Annual licensing, enterprise options, and a full feature comparison.',
}

const TIERS = [
  {
    name: 'Pilot',
    price: 'Free for 3 months',
    cadence: 'then $49 / month',
    blurb: 'A single school getting started with one counsellor.',
    features: ['Up to 100 students', '1 counsellor seat', 'Consent workflow & tracker', 'Email delivery & templates', 'Onboarding & training included'],
    cta: 'Start a pilot',
    featured: false,
  },
  {
    name: 'School / District',
    price: 'Custom Licensing',
    cadence: 'annual agreement',
    blurb: 'A K-12 school or district running a full wellbeing program.',
    features: ['Unlimited students', 'Up to 10 counsellors', 'Everything in Pilot', 'Bulk roster upload & CSV export', 'Automated reminders & audit trail', 'Dedicated onboarding manager'],
    cta: 'Request proposal',
    featured: true,
  },
  {
    name: 'University Campus',
    price: 'Institutional Plan',
    cadence: 'campus agreement',
    blurb: 'Multi-school districts or university systems at scale.',
    features: ['Multi-school / multi-campus', 'Unlimited counsellors', 'Everything in School', 'Full analytics & audit log', 'Data Processing Agreement', 'Dedicated success manager'],
    cta: 'Talk to sales',
    featured: false,
  },
]

const COMPARISON: { feature: string; pilot: string; school: string; enterprise: string }[] = [
  { feature: 'Consent-first workflow', pilot: 'Yes', school: 'Yes', enterprise: 'Yes' },
  { feature: 'Parental consent routing for minors', pilot: 'Yes', school: 'Yes', enterprise: 'Yes' },
  { feature: 'Consent tracker with audit trail', pilot: 'Yes', school: 'Yes', enterprise: 'Yes' },
  { feature: 'Roster CSV upload', pilot: 'Yes', school: 'Yes', enterprise: 'Yes' },
  { feature: 'Multi-platform analysis', pilot: '4 platforms', school: 'All platforms', enterprise: 'All platforms' },
  { feature: 'Students included', pilot: 'Up to 100', school: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Counsellor seats', pilot: '1', school: 'Up to 10', enterprise: 'Unlimited' },
  { feature: 'Full analytics & reporting', pilot: '—', school: '—', enterprise: 'Yes' },
  { feature: 'Data Processing Agreement', pilot: 'On request', school: 'Included', enterprise: 'Included' },
  { feature: 'Onboarding & training', pilot: 'Included', school: 'Dedicated', enterprise: 'Dedicated' },
]

const FAQS = [
  {
    q: 'How long does implementation take?',
    a: 'A pilot can be up and running in days. You upload your student roster, consent requests go out automatically, and your counselling team is trained as part of onboarding. Larger districts and universities typically take a few weeks end-to-end.',
  },
  {
    q: 'Do you provide a Data Processing Agreement?',
    a: 'Yes. A DPA is available on request for Pilot customers and included with School and District/University plans. Download the template from our DPA page and contact us to sign an agreement tailored to your institution.',
  },
  {
    q: 'Where is our data stored?',
    a: 'Student PII is encrypted at rest and access is limited to institution-authorised staff. Data residency requirements for pilot institutions are supported on request — if your institution needs in-country storage, that shapes the deployment and we will scope it with you.',
  },
  {
    q: 'How often is the model updated?',
    a: 'We re-train and evaluate the risk model on an ongoing basis and ship improvements as they pass validation. The model remains a decision-support layer — counsellors always review outputs before acting.',
  },
  {
    q: 'What happens when we off-board?',
    a: 'Your roster and consent records can be exported at any time, and on request we delete all student PII from our systems. Off-boarding is documented in your agreement.',
  },
  {
    q: 'Do you work with single counsellors?',
    a: 'Yes — the Pilot tier is built exactly for that. One counsellor, up to 100 students, free for the first three months.',
  },
]

export default function PricingPage() {
  return (
    <div className="bg-[#FAFAFA] overflow-hidden">
      <PageHero
        eyebrow="Transparent Institutional Pricing"
        title="Simple pricing, serious support"
        subtitle="Start free with a pilot. Scale to a whole district or campus when you are ready."
      />

      {/* PRICING CARDS */}
      <section className="py-20 relative overflow-hidden">
        <FloatingOrb className="bg-emerald-200/30 -top-10 -right-10" size={400} duration={18} />
        <div className="relative max-w-6xl mx-auto px-6">
          <Stagger className="grid md:grid-cols-3 gap-6 items-stretch">
            {TIERS.map((t) => (
              <StaggerItem key={t.name} className="flex">
                <HoverLift className="flex-1 flex">
                  <div
                    className={`relative bg-white/90 backdrop-blur-md border rounded-2xl p-8 flex flex-col w-full shadow-sm hover:shadow-xl transition-all ${
                      t.featured ? 'border-emerald-500/60 ring-2 ring-emerald-500/20' : 'border-emerald-500/20'
                    }`}
                  >
                    {t.featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white shadow-md">
                        Most popular for districts
                      </span>
                    )}
                    <h3 className="text-xl font-extrabold text-slate-900">{t.name}</h3>
                    <div className="mt-4">
                      <div className="text-2xl font-extrabold text-slate-900 font-mono">{t.price}</div>
                      <div className="text-xs text-slate-500 mt-1">{t.cadence}</div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600 leading-relaxed">{t.blurb}</p>
                    <ul className="mt-6 flex flex-col gap-3 text-sm text-slate-600 flex-1">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              <path d="M2 6.5 4.5 9 10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <a
                        href="/demo"
                        className={`block text-center px-6 py-3.5 rounded-xl font-bold text-xs transition-all ${
                          t.featured
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:shadow-lg'
                            : 'border border-emerald-500/30 text-slate-800 hover:bg-emerald-50/50'
                        }`}
                      >
                        {t.cta} &rarr;
                      </a>
                    </div>
                  </div>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* INTERACTIVE CALCULATOR */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden bg-grid-pattern">
        <div className="max-w-6xl mx-auto px-6">
          <PricingCalculator />
        </div>
      </section>

      {/* FEATURE COMPARISON TABLE */}
      <section className="py-20 relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              title="Feature comparison"
              subtitle="The same consent-first foundation across every tier."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-x-auto rounded-2xl border border-emerald-500/20 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-emerald-500/15 text-left bg-slate-50">
                    <th className="px-6 py-4 font-bold text-slate-900">Feature</th>
                    <th className="px-6 py-4 font-bold text-slate-900">Pilot</th>
                    <th className="px-6 py-4 font-bold text-emerald-700 bg-emerald-50">School</th>
                    <th className="px-6 py-4 font-bold text-slate-900">District / University</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{row.feature}</td>
                      <td className="px-6 py-4 text-slate-600">{row.pilot}</td>
                      <td className="px-6 py-4 text-slate-600 bg-emerald-50/40 font-semibold">{row.school}</td>
                      <td className="px-6 py-4 text-slate-600">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-slate-50 border-t border-emerald-500/10">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <SectionHeading title="Frequently asked questions" />
          </Reveal>
          <Reveal delay={0.1}>
            <Faq items={FAQS} />
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Ready to estimate for your school or campus?"
        subtitle="Our team will scope your roster volume and prepare a formal compliance proposal."
      />
    </div>
  )
}

