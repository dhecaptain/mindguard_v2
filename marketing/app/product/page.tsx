import type { Metadata } from 'next'
import { PageHero, SectionHeading, Card, Check, CtaButton, CtaBand } from '@/components/ui'
import { Reveal, Stagger, StaggerItem, FloatingOrb, HoverLift } from '@/components/motion'
import { Icons } from '@/components/icons'
import { MultiPlatformPreview } from '@/components/MultiPlatformPreview'

export const metadata: Metadata = {
  title: 'Product — MindGuard',
  description:
    'How MindGuard works: a consent-first, human-in-the-loop AI decision-support system for school and university counsellors, powered by Mental-RoBERTa.',
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Set up your roster',
    text: 'Upload your student roster once. MindGuard determines adult vs. minor status and routes consent requests to the right person — the student, the parent, or both.',
  },
  {
    step: '02',
    title: 'Consent is requested and recorded',
    text: 'Students and parents receive a signed, one-time consent link. Every view, accept, decline and revoke is timestamped in an immutable audit trail.',
  },
  {
    step: '03',
    title: 'Monitoring runs only for consented students',
    text: 'For consented students, MindGuard analyses content they explicitly share and produces risk summaries a trained counsellor reviews — never an automated decision.',
  },
  {
    step: '04',
    title: 'Counsellors act, with crisis resources',
    text: 'High-risk signals surface in a rolling risk view with built-in crisis resources by country and US state. The counsellor remains the human in the loop.',
  },
]

const COMMITMENTS = [
  {
    icon: <Icons.Shield />,
    title: 'Consent-first',
    text: 'No content is analysed until consent is given — by the student if adult, by a parent or guardian if minor. Consent can be withdrawn with one click, and withdrawal stops analysis immediately.',
  },
  {
    icon: <Icons.Users />,
    title: 'Human-in-the-loop',
    text: 'MindGuard is decision support, not a decision maker. It surfaces signals and suggests crisis resources; a trained counsellor reviews every output before any action.',
  },
  {
    icon: <Icons.School />,
    title: 'FERPA / COPPA aware',
    text: 'Built for the regulatory reality of schools: student records are protected, minors are routed through parental consent, and institutions stay in control of their data.',
  },
  {
    icon: <Icons.Trash />,
    title: 'Data minimisation',
    text: 'Only content a student explicitly shares is analysed. PII is encrypted at rest, the analysed content is not stored between sessions, and data is never sold or shared outside the school.',
  },
]

export default function ProductPage() {
  return (
    <div className="bg-[#FAFAFA]">
      <PageHero
        eyebrow="Product Architecture"
        title="Decision support your counsellors can defend"
        subtitle="MindGuard helps trained practitioners identify early signs of distress in consented digital content — powered by Mental-RoBERTa, reviewed by humans, built for trust."
      />

      {/* HOW IT WORKS */}
      <section className="relative py-24 overflow-hidden">
        <FloatingOrb className="bg-emerald-200 opacity-30 -top-20 -right-20" size={400} />
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading title="How MindGuard Works" subtitle="A 4-stage consent and decision-support pipeline designed for school and university counsellors." />
          </Reveal>
          <Stagger className="grid md:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((s) => (
              <StaggerItem key={s.step}>
                <div className="relative bg-white/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-7 shadow-sm hover:border-emerald-500/40 transition-all">
                  <div className="text-5xl font-extrabold text-emerald-500/20 mb-4 font-mono">{s.step}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* INTERACTIVE MULTI-PLATFORM PREVIEW */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden bg-grid-pattern">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              title="One wellbeing view across digital touchpoints"
              subtitle="Preview how MindGuard securely processes signals across Google Docs, Canvas LMS, School Email, and Consented Social Channels."
            />
          </Reveal>
          <MultiPlatformPreview />
        </div>
      </section>

      {/* COMMITMENTS */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              title="Our commitment — in four parts"
              subtitle="Everything MindGuard does is governed by four safeguards we will not compromise."
            />
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 gap-6">
            {COMMITMENTS.map((c) => (
              <StaggerItem key={c.title}>
                <HoverLift>
                  <Card icon={c.icon} title={c.title}>
                    {c.text}
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* WHAT MINDGUARD IS vs NOT */}
      <section className="py-24 bg-slate-50 border-y border-emerald-500/10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <Reveal>
            <div className="bg-white border border-emerald-500/20 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">What MindGuard is</h3>
              <ul className="flex flex-col gap-4">
                <Check>An early-signal tool that helps counsellors prioritise follow-ups</Check>
                <Check>A consent-first workflow with a full audit trail</Check>
                <Check>A structured, evidence-based starting point for conversations</Check>
                <Check>A 4-tier risk view (low / moderate / high / critical) with crisis resources</Check>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="bg-white border border-emerald-500/20 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">What MindGuard is not</h3>
              <ul className="flex flex-col gap-4">
                <Check>Not a diagnosis tool — it never labels a student</Check>
                <Check>Not a monitoring wiretap — only explicitly shared content is analysed</Check>
                <Check>Not an automated decision maker — every output needs human review</Check>
                <Check>Not a replacement for counsellors, crisis services, or clinical care</Check>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* UNDER THE HOOD */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              title="Under the hood"
              subtitle="A purpose-trained model, reviewed by humans."
            />
          </Reveal>
          <Stagger className="grid sm:grid-cols-3 gap-6">
            <StaggerItem>
              <Card title="Mental-RoBERTa Model">
                A transformer pre-trained on millions of mental-health domain posts and
                fine-tuned on 12,656 annotated examples. ROC-AUC 0.9813, 92.5% accuracy.
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card title="Human-reviewed outputs">
                Risk scores surface as summaries for counsellors — the human keeps the
                decision. No automated escalation, no un-reviewed flags.
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card title="Session-only analysis">
                Analysed content is not stored between sessions. Roster PII is encrypted at
                rest and access is limited to institution-authorised staff.
              </Card>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <CtaBand
        title="Experience the live MindGuard platform"
        subtitle="Explore the live application or request a dedicated institutional walkthrough with your data."
      />
    </div>
  )
}
