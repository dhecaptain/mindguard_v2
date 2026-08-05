import type { Metadata } from 'next'
import { PageHero, SectionHeading, Card, Check, CtaBand, CtaButton } from '@/components/ui'

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

const PLATFORMS = [
  'Reddit',
  'Bluesky',
  'Mastodon',
  'YouTube',
  'TikTok',
  'Twitter / X',
  'Facebook',
  'WhatsApp exports',
  'CSV & JSON archives',
]

const COMMITMENTS = [
  {
    icon: '🛡️',
    title: 'Consent-first',
    text: 'No content is analysed until consent is given — by the student if adult, by a parent or guardian if minor. Consent can be withdrawn with one click, and withdrawal stops analysis immediately.',
  },
  {
    icon: '🧑‍⚕️',
    title: 'Human-in-the-loop',
    text: 'MindGuard is decision support, not a decision maker. It surfaces signals and suggests crisis resources; a trained counsellor reviews every output before any action.',
  },
  {
    icon: '🏫',
    title: 'FERPA / COPPA aware',
    text: 'Built for the regulatory reality of schools: student records are protected, minors are routed through parental consent, and institutions stay in control of their data.',
  },
  {
    icon: '🗑️',
    title: 'Data minimisation',
    text: 'Only content a student explicitly shares is analysed. PII is encrypted at rest, the analysed content is not stored between sessions, and data is never sold or shared outside the school.',
  },
]

export default function ProductPage() {
  return (
    <div>
      <PageHero
        eyebrow="Product"
        title="Decision support your counsellors can defend"
        subtitle="MindGuard helps trained practitioners identify early signs of distress in consented digital content — powered by Mental-RoBERTa, reviewed by humans, built for trust."
      />

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading title="How it works" />
          <div className="grid md:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="relative bg-white border border-[#eef2f6] rounded-2xl p-6">
                <div className="text-5xl font-extrabold text-teal-50 mb-4">{s.step}</div>
                <h3 className="font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="One wellbeing view across the platforms students actually use"
            subtitle="Analyse content across nine platforms and file formats in a single session."
          />
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {PLATFORMS.map((p) => (
              <span
                key={p}
                className="rounded-full border border-[#e5e7eb] bg-white px-5 py-2 text-sm font-semibold text-ink"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Four commitments */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="Our commitment — in four parts"
            subtitle="Everything MindGuard does is governed by four safeguards we will not compromise."
          />
          <div className="grid sm:grid-cols-2 gap-6">
            {COMMITMENTS.map((c) => (
              <Card key={c.title} icon={c.icon} title={c.title}>
                {c.text}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What it is / is not */}
      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div className="bg-white border border-[#eef2f6] rounded-2xl p-8">
            <h3 className="text-xl font-bold text-ink mb-6">What MindGuard is</h3>
            <ul className="flex flex-col gap-4">
              <Check>An early-signal tool that helps counsellors prioritise follow-ups</Check>
              <Check>A consent-first workflow with a full audit trail</Check>
              <Check>A structured, evidence-based starting point for conversations</Check>
              <Check>A 4-tier risk view (low / moderate / high / critical) with crisis resources</Check>
            </ul>
          </div>
          <div className="bg-white border border-[#eef2f6] rounded-2xl p-8">
            <h3 className="text-xl font-bold text-ink mb-6">What MindGuard is not</h3>
            <ul className="flex flex-col gap-4">
              <Check>Not a diagnosis tool — it never labels a student</Check>
              <Check>Not a monitoring wiretap — only explicitly shared content is analysed</Check>
              <Check>Not an automated decision maker — every output needs human review</Check>
              <Check>Not a replacement for counsellors, crisis services, or clinical care</Check>
            </ul>
          </div>
        </div>
      </section>

      {/* Under the hood */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="Under the hood"
            subtitle="A purpose-trained model, reviewed by humans."
          />
          <div className="grid sm:grid-cols-3 gap-6">
            <Card title="Mental-RoBERTa">
              A transformer pre-trained on millions of mental-health domain posts and
              fine-tuned on 12,656 annotated examples. ROC-AUC 0.9813, 92.5% accuracy.
            </Card>
            <Card title="Human-reviewed outputs">
              Risk scores surface as summaries for counsellors — the human keeps the
              decision. No automated escalation, no un-reviewed flags.
            </Card>
            <Card title="Session-only analysis">
              Analysed content is not stored between sessions. Roster PII is encrypted at
              rest and access is limited to institution-authorised staff.
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-20 flex flex-col items-center gap-4">
        <CtaButton href="/demo">Request a demo</CtaButton>
        <CtaButton href="/security" variant="ghost">
          Read the security &amp; compliance overview
        </CtaButton>
      </div>
    </div>
  )
}
