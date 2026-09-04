import type { Metadata } from 'next'
import { PageHero, SectionHeading, Card, Check, CtaButton, CtaBand } from '@/components/ui'
import { Reveal, Stagger, StaggerItem, FloatingOrb, HoverLift } from '@/components/motion'
import { Icons } from '@/components/icons'


export const metadata: Metadata = {
  title: 'For universities — MindGuard',
  description:
    'MindGuard helps university counselling services identify early signs of distress in consented digital content — with Title IX and student-consent considerations built in.',
}

const CHALLENGES = [
  {
    icon: <Icons.Graduation />,
    title: 'A campus mental-health crisis',
    text: 'Universities face rising demand for counselling support at a time when students spend most of their lives online. Early signals often appear in digital spaces before they reach a waiting room.',
  },
  {
    icon: <Icons.Scale />,
    title: 'Title IX and duty of care',
    text: 'Institutions have legal responsibilities around student welfare and non-discrimination. Wellbeing support must be proactive without being invasive or discriminatory.',
  },
  {
    icon: <Icons.Users />,
    title: 'Overstretched counselling services',
    text: 'With limited counsellor capacity, prioritisation is everything. Staff need help surfacing the students most in need — not more dashboards to babysit.',
  },
  {
    icon: <Icons.Lock />,
    title: 'Adult students, real consent',
    text: 'University students are adults. Participation is opt-in and consent is personal — MindGuard routes consent to the student, not a parent, and honours withdrawal at any time.',
  },
]

const FEATURES = [
  {
    icon: <Icons.Brain />,
    title: 'A rolling risk view for consented students',
    text: 'Aggregated risk summaries across the platforms students actually use, so counselling teams can prioritise outreach and triage caseloads.',
  },
  {
    icon: <Icons.Users />,
    title: 'Integration with counselling workflows',
    text: 'Designed to sit alongside existing services — referrals, team handoff and secure communication live in the counsellor workspace, not in a spreadsheet.',
  },
  {
    icon: <Icons.DocCheck />,
    title: 'A complete consent and audit trail',
    text: 'Every accept, decline and withdrawal is timestamped and immutable. When a student asks what happened to their data, you have the answer.',
  },
  {
    icon: <Icons.Globe />,
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

      <section className="relative py-20 overflow-hidden">
        <FloatingOrb className="bg-indigo-100 opacity-30 -top-16 -right-16" size={380} />
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              title="The challenges universities face"
              subtitle="Demand is up, capacity is flat, and the signals are digital."
            />
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 gap-6">
            {CHALLENGES.map((c) => (
              <StaggerItem key={c.title}>
                <HoverLift className="h-full">
                  <Card icon={c.icon} title={c.title}>
                    {c.text}
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative py-20 bg-[#f7f9fb] overflow-hidden">
        <FloatingOrb className="bg-teal-100 opacity-30 -bottom-20 -left-20" size={420} duration={20} />
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading title="Built for counselling services" />
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <HoverLift className="h-full">
                  <Card icon={f.icon} title={f.title}>
                    {f.text}
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <Reveal>
            <div className="bg-white border border-[#eef2f6] rounded-2xl p-8">
              <h3 className="text-xl font-bold text-ink mb-6">Adult students, adult consent</h3>
              <ul className="flex flex-col gap-4">
                <Check>Consent is personal — university students are routed consent directly</Check>
                <Check>Students review the terms and decide with full transparency</Check>
                <Check>One-click withdrawal at any time, no questions asked</Check>
                <Check>Withdrawal cancels future analysis immediately and marks past analyses accordingly</Check>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="bg-white border border-[#eef2f6] rounded-2xl p-8">
              <h3 className="text-xl font-bold text-ink mb-6">Title IX-aware by design</h3>
              <ul className="flex flex-col gap-4">
                <Check>Non-discriminatory: the same consent rules apply to every student</Check>
                <Check>Human-in-the-loop outputs avoid automated, potentially biased decisions</Check>
                <Check>Access limited to institution-authorised counselling staff</Check>
                <Check>Full audit trail for transparency and accountability</Check>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Bring an early-warning layer to your counselling service"
        subtitle="See how MindGuard fits your campus workflow — from consent to triage to referral."
      />
    </div>
  )
}

