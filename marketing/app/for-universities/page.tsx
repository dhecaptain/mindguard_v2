import type { Metadata } from 'next'
import { PageHero, SectionHeading, Card, Check, CtaButton } from '@/components/ui'

export const metadata: Metadata = {
  title: 'For universities — MindGuard',
  description:
    'MindGuard helps university counselling services identify early signs of distress in consented digital content — with Title IX and student-consent considerations built in.',
}

const CHALLENGES = [
  {
    icon: '🎓',
    title: 'A campus mental-health crisis',
    text: 'Universities face rising demand for counselling support at a time when students spend most of their lives online. Early signals often appear in digital spaces before they reach a waiting room.',
  },
  {
    icon: '⚖️',
    title: 'Title IX and duty of care',
    text: 'Institutions have legal responsibilities around student welfare and non-discrimination. Wellbeing support must be proactive without being invasive or discriminatory.',
  },
  {
    icon: '👥',
    title: 'Overstretched counselling services',
    text: 'With limited counsellor capacity, prioritisation is everything. Staff need help surfacing the students most in need — not more dashboards to babysit.',
  },
  {
    icon: '🔏',
    title: 'Adult students, real consent',
    text: 'University students are adults. Participation is opt-in and consent is personal — MindGuard routes consent to the student, not a parent, and honours withdrawal at any time.',
  },
]

const FEATURES = [
  {
    icon: '🧠',
    title: 'A rolling risk view for consented students',
    text: 'Aggregated risk summaries across the platforms students actually use, so counselling teams can prioritise outreach and triage caseloads.',
  },
  {
    icon: '🧑‍⚕️',
    title: 'Integration with counselling workflows',
    text: 'Designed to sit alongside existing services — referrals, team handoff and secure communication live in the counsellor workspace, not in a spreadsheet.',
  },
  {
    icon: '📜',
    title: 'A complete consent and audit trail',
    text: 'Every accept, decline and withdrawal is timestamped and immutable. When a student asks what happened to their data, you have the answer.',
  },
  {
    icon: '🌍',
    title: 'Crisis resources, localised',
    text: 'Built-in crisis-resource lookup by country and US state, so a counsellor can act immediately when a student needs help now.',
  },
]

export default function ForUniversitiesPage() {
  return (
    <div>
      <PageHero
        eyebrow="For universities"
        title="Support students where they actually are"
        subtitle="MindGuard helps university counselling services identify early signs of distress in consented digital content — ethically, transparently, and in step with Title IX responsibilities."
      />

      {/* Challenges */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="The challenges universities face"
            subtitle="Demand is up, capacity is flat, and the signals are digital."
          />
          <div className="grid sm:grid-cols-2 gap-6">
            {CHALLENGES.map((c) => (
              <Card key={c.title} icon={c.icon} title={c.title}>
                {c.text}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading title="Built for counselling services" />
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} icon={f.icon} title={f.title}>
                {f.text}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Consent for adults */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div className="bg-white border border-[#eef2f6] rounded-2xl p-8">
            <h3 className="text-xl font-bold text-ink mb-6">Adult students, adult consent</h3>
            <ul className="flex flex-col gap-4">
              <Check>Consent is personal — university students are routed consent directly</Check>
              <Check>Students review the terms and decide with full transparency</Check>
              <Check>One-click withdrawal at any time, no questions asked</Check>
              <Check>Withdrawal cancels future analysis immediately and marks past analyses accordingly</Check>
            </ul>
          </div>
          <div className="bg-white border border-[#eef2f6] rounded-2xl p-8">
            <h3 className="text-xl font-bold text-ink mb-6">Title IX-aware by design</h3>
            <ul className="flex flex-col gap-4">
              <Check>Non-discriminatory: the same consent rules apply to every student</Check>
              <Check>Human-in-the-loop outputs avoid automated, potentially biased decisions</Check>
              <Check>Access limited to institution-authorised counselling staff</Check>
              <Check>Full audit trail for transparency and accountability</Check>
            </ul>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-teal-600 text-white p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Bring an early-warning layer to your counselling service
          </h2>
          <p className="text-teal-50 mb-8 max-w-xl mx-auto">
            See how MindGuard fits your campus workflow — from consent to triage to referral.
          </p>
          <CtaButton href="/demo">Request a demo</CtaButton>
        </div>
      </div>
    </div>
  )
}
