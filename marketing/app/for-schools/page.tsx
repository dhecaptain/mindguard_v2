import type { Metadata } from 'next'
import { PageHero, SectionHeading, Card, Check, Stat, CtaBand } from '@/components/ui'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { Icons } from '@/components/icons'

export const metadata: Metadata = {
  title: 'For schools (K-12) — MindGuard',
  description:
    'MindGuard helps K-12 counselling teams identify early signs of distress with consent built in. COPPA-aware, DPA-ready, human-in-the-loop.',
}

const PAINS = [
  {
    icon: <Icons.Compass />,
    title: 'One counsellor, hundreds of students',
    text: 'The national counsellor-to-student ratio is roughly 1:400. Meaningful check-ins with every student is not possible — signals get missed until it is too late.',
  },
  {
    icon: <Icons.Refresh />,
    title: 'Response is often reactive',
    text: 'Around 90% of youth who die by suicide have shown warning signs. The problem is not the absence of signals — it is surfacing them in time.',
  },
  {
    icon: <Icons.Scale />,
    title: 'New rules, new responsibilities',
    text: 'Schools increasingly run digital wellbeing programmes under COPPA, FERPA and state data-privacy rules. Consent and compliance are non-negotiable.',
  },
]

const HOW_HELPS = [
  {
    icon: <Icons.Clipboard />,
    title: 'Consent that runs itself',
    text: 'Upload your roster once. MindGuard detects minors, sends signed consent requests to the right parent or guardian, tracks every response and handles reminders and expiry.',
  },
  {
    icon: <Icons.Stethoscope />,
    title: 'Early-signal summaries for counsellors',
    text: 'For consented students, counsellors see a rolling risk view with low / moderate / high / critical tiers — a structured starting point for a real conversation.',
  },
  {
    icon: <Icons.Doc />,
    title: 'A defensible audit trail',
    text: 'Every consent event — sent, opened, accepted, declined, revoked — is timestamped and immutable. You can show exactly what was consented to and when.',
  },
  {
    icon: <Icons.Lock />,
    title: 'COPPA and FERPA aware by design',
    text: 'Minors are routed through parental consent. Student PII is encrypted at rest, analysed content is used only to produce a summary for review, and data never leaves your school without permission.',
  },
]

export default function ForSchoolsPage() {
  return (
    <div>
      <PageHero
        eyebrow="For schools"
        title="Catch the signals of distress — before a crisis"
        subtitle="MindGuard gives K-12 counselling teams early-signal support that respects student consent, parent involvement and your compliance obligations."
      />

      <section className="py-20 sm:py-24">
        <div className="mg-section">
          <Reveal>
            <SectionHeading
              title="The problem K-12 teams face"
              subtitle="The signals are there. The capacity to see them in time is not."
            />
          </Reveal>
          <Stagger className="grid md:grid-cols-3 gap-6">
            {PAINS.map((p) => (
              <StaggerItem key={p.title}>
                <Card icon={p.icon} title={p.title}>
                  {p.text}
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.12}>
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-3xl mx-auto text-center">
              <Stat value="1:400" label="Typical counsellor-to-student ratio" />
              <Stat value="90%" label="Of youth who die by suicide showed warning signs" />
              <Stat value="0.98" label="ROC-AUC of the Mental-RoBERTa model" />
            </div>
            <div className="mt-6 text-center">
              <a href="/request-demo" className="mt-4 inline-flex mg-btn-secondary">
                See what it looks like
              </a>
            </div>
            <p className="mt-5 text-center text-xs text-ink-soft">
              Sources: ASCA student-to-school-counsellor ratios · AFSP warning signs · Mental-RoBERTa model evaluation.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white border-y border-[rgba(23,33,29,0.08)]">
        <div className="mg-section">
          <Reveal>
            <SectionHeading title="How MindGuard helps" />
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 gap-6">
            {HOW_HELPS.map((h) => (
              <StaggerItem key={h.title}>
                <Card icon={h.icon} title={h.title}>
                  {h.text}
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mg-section grid md:grid-cols-2 gap-8">
          <Reveal>
            <div className="mg-card p-8 h-full">
              <h3 className="text-xl font-semibold text-ink mb-6">Built for COPPA and FERPA</h3>
              <ul className="flex flex-col gap-4">
                <Check>Minors can only participate with verified parental consent</Check>
                <Check>Age-of-majority threshold configurable per institution</Check>
                <Check>Student records treated as education records</Check>
                <Check>Consent revocation is one click and takes effect immediately</Check>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mg-card p-8 h-full">
              <h3 className="text-xl font-semibold text-ink mb-6">Administrator-friendly</h3>
              <ul className="flex flex-col gap-4">
                <Check>Bulk roster upload with validation and downloadable error report</Check>
                <Check>Consent tracker with filters, search, bulk resend and CSV export</Check>
                <Check>Reminders at day 3 and day 7, automatic expiry at day 30</Check>
                <Check>Data Processing Agreement available for your records</Check>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Give your counselling team an earlier warning"
        subtitle="See how the consent workflow, tracker and risk view work with your school's data in mind."
      />
    </div>
  )
}
