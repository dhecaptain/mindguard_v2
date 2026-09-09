import type { Metadata } from 'next'
import { PageHero, SectionHeading, Card, Check, CtaBand, Eyebrow } from '@/components/ui'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { Icons } from '@/components/icons'
import { MultiPlatformPreview } from '@/components/MultiPlatformPreview'
import { ShieldCheck, Heart, UserCheck, Search, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Product — MindGuard',
  description:
    'How MindGuard works: a consent-first, human-in-the-loop AI decision-support system for school and university counsellors, powered by Mental-RoBERTa.',
}

const JOURNEY = [
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

const CONSENT_POINTS = [
  'Clear, revocable consent is recorded before any analysis',
  'Adults consent for themselves; parents consent for minors',
  'Withdrawal is one click and stops analysis immediately',
  'The human counsellor reviews every output',
]

export default function ProductPage() {
  return (
    <div>
      <PageHero
        eyebrow="Product"
        title="Decision support your counsellors can defend"
        subtitle="MindGuard helps trained practitioners identify early signs of distress in consented digital content — powered by Mental-RoBERTa, reviewed by humans, built for trust."
      />

      {/* How it works — narrative */}
      <section className="py-20 sm:py-28">
        <div className="mg-section">
          <Reveal>
            <SectionHeading
              title="How MindGuard works"
              subtitle="A 4-stage consent and decision-support pipeline designed for school and university counsellors."
            />
          </Reveal>
          <Stagger className="grid md:grid-cols-2 gap-6">
            {JOURNEY.map((s) => (
              <StaggerItem key={s.step}>
                <div className="mg-card mg-card-hover h-full p-8">
                  <div className="display text-6xl text-forest-100">{s.step}</div>
                  <h3 className="mt-4 text-xl font-semibold text-ink">{s.title}</h3>
                  <p className="mt-3 text-[0.95rem] text-ink-soft leading-relaxed">{s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Product visual — kept dark & premium (single console) */}
      <section className="py-20 bg-white">
        <div className="mg-section">
          <Reveal>
            <SectionHeading
              title="One wellbeing view across digital touchpoints"
              subtitle="Preview how MindGuard securely processes signals across Google Docs, Canvas LMS, School Email, and consented social channels."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <MultiPlatformPreview />
          </Reveal>
        </div>
      </section>

      {/* Consent-first feature strip */}
      <section className="py-20 sm:py-24 bg-forest text-white">
        <div className="mg-section grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <Eyebrow>Consent-first philosophy</Eyebrow>
              <h2 className="display text-3xl sm:text-4xl text-white mt-4">
                Consent is the product
              </h2>
              <p className="mt-5 text-white/70 leading-relaxed">
                We built the line we are willing to stand behind. MindGuard is not a monitoring
                wiretap — it only analyses content a student explicitly chooses to share, and only
                after consent is in place. AI detects signals. Humans provide care.
              </p>
              <ul className="mt-8 grid sm:grid-cols-1 gap-4">
                {CONSENT_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-white/85">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6.5 4.5 9 10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[0.95rem]">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <UserCheck className="w-6 h-6" />, t: 'Human oversight', d: 'Every output reviewed by a counsellor.' },
                { icon: <Eye className="w-6 h-6" />, t: 'Explainable', d: 'Summaries a professional can defend.' },
                { icon: <Search className="w-6 h-6" />, t: 'Early signals', d: 'Meaningful patterns, surfaced sooner.' },
                { icon: <Heart className="w-6 h-6" />, t: 'Built for care', d: 'Starting points for real conversations.' },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl bg-white/[0.06] border border-white/15 p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-forest-100">
                    {c.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{c.t}</h3>
                  <p className="mt-1 text-xs text-white/60 leading-relaxed">{c.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Commitments */}
      <section className="py-20 sm:py-28">
        <div className="mg-section">
          <Reveal>
            <SectionHeading
              title="Our commitment — in four parts"
              subtitle="Everything MindGuard does is governed by four safeguards we will not compromise."
            />
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 gap-6">
            {COMMITMENTS.map((c) => (
              <StaggerItem key={c.title}>
                <Card icon={c.icon} title={c.title}>
                  {c.text}
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* What MindGuard is vs not */}
      <section className="py-20 sm:py-24 bg-white border-y border-[rgba(23,33,29,0.08)]">
        <div className="mg-section grid md:grid-cols-2 gap-8">
          <Reveal>
            <div className="mg-card p-8 h-full">
              <h3 className="text-xl font-semibold text-ink mb-6">What MindGuard is</h3>
              <ul className="flex flex-col gap-4">
                <Check>An early-signal tool that helps counsellors prioritise follow-ups</Check>
                <Check>A consent-first workflow with a full audit trail</Check>
                <Check>A structured, evidence-based starting point for conversations</Check>
                <Check>A 4-tier risk view (low / moderate / high / critical) with crisis resources</Check>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mg-card p-8 h-full">
              <h3 className="text-xl font-semibold text-ink mb-6">What MindGuard is not</h3>
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

      {/* Under the hood */}
      <section className="py-20 sm:py-28">
        <div className="mg-section">
          <Reveal>
            <SectionHeading
              title="Under the hood"
              subtitle="A purpose-trained model, reviewed by humans."
            />
          </Reveal>
          <Stagger className="grid sm:grid-cols-3 gap-6">
            <StaggerItem>
              <Card title="Mental-RoBERTa Model" icon={<ShieldCheck className="w-6 h-6" />}>
                A transformer pre-trained on millions of mental-health domain posts and fine-tuned
                on 12,656 annotated examples. ROC-AUC 0.9813, 92.5% accuracy.
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card title="Human-reviewed outputs" icon={<UserCheck className="w-6 h-6" />}>
                Risk scores surface as summaries for counsellors — the human keeps the decision. No
                automated escalation, no un-reviewed flags.
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card title="Session-only analysis" icon={<Icons.Lock />}>
                Analysed content is not stored between sessions. Roster PII is encrypted at rest and
                access is limited to institution-authorised staff.
              </Card>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <CtaBand
        title="See MindGuard in action"
        subtitle="Request a dedicated institutional walkthrough with your data, or launch the app directly to explore."
      />
    </div>
  )
}
