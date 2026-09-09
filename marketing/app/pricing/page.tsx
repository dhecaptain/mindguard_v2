import type { Metadata } from 'next'
import { PageHero, CtaBand } from '@/components/ui'
import { Reveal } from '@/components/motion'
import { PricingCalculator } from '@/components/PricingCalculator'
import { Faq } from '@/components/Faq'
import { ShieldCheck, Scale, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing — MindGuard',
  description:
    'Transparent, institution-friendly pricing for MindGuard student wellbeing intelligence. Pilot plan free for 3 months. No hidden per-student fees.',
}

const ASSURANCES = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'No hidden per-student fees',
    text: 'Pricing is a clear annual license per institution. No surprises as your roster grows.',
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: 'Built for procurement',
    text: 'DPA, W-9, SOC 2 readiness and a clear quote make approval with IT and legal easier.',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Onboarding included',
    text: 'Every plan includes onboarding, roster setup, consent-flow configuration and staff training.',
  },
]

const FAQS = {
  title: 'Frequently asked questions',
  subtitle: 'Answers about pricing, pilots, and how the quote process works.',
  items: [
    {
      q: 'Is there really a free plan?',
      a: 'Yes. The Pilot tier is free for your first 3 months — up to 100 students at a single school — and includes full consent dispatch, the risk triage engine and onboarding training. After the pilot, you can continue, upgrade, or end without obligation.',
    },
    {
      q: 'How is pricing structured?',
      a: 'Pricing is a straightforward annual license per institution. There are no per-student or per-seat fees that scale unpredictably. Each institution receives a tailored proposal based on size and needs.',
    },
    {
      q: 'Do you offer discounts for non-profits or smaller districts?',
      a: 'We work with a range of institutions and can tailor proposals. Get in touch for a quote and we will find a structure that fits your budget.',
    },
    {
      q: 'What does onboarding include?',
      a: 'Every plan includes assistance with roster upload, consent-flow configuration, staff training, and a documented handoff. District and university plans include a dedicated onboarding manager.',
    },
  ],
}

export default function PricingPage() {
  return (
    <div>
      <PageHero
        eyebrow="Pricing"
        title="Simple, institution-friendly pricing"
        subtitle="A clear annual license. No hidden per-student fees. A free pilot so you can see it work before you commit."
      />

      <section className="pb-20 sm:pb-24">
        <div className="mg-section">
          <PricingCalculator />
        </div>
      </section>

      <section className="py-16 bg-white border-y border-[rgba(23,33,29,0.08)]">
        <div className="mg-section">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6">
            {ASSURANCES.map((a) => (
              <div key={a.title} className="text-center">
                <div className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                  {a.icon}
                </div>
                <h3 className="text-base font-semibold text-ink">{a.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mg-section">
          <Reveal>
            <Faq {...FAQS} />
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Let's scope the right plan for you"
        subtitle="Tell us about your institution and we'll send a tailored proposal — no pressure, no obligation."
      />
    </div>
  )
}
