import type { Metadata } from 'next'
import Link from 'next/link'
import { CtaButton, Stat, TrustBadge, Card, CtaBand, SectionHeading } from '@/components/ui'

export const metadata: Metadata = {
  title: 'MindGuard — Consent-first student wellbeing monitoring',
  description:
    'Catch the signals of distress — before a crisis. Consent-first AI decision support for school and university counsellors. Powered by Mental-RoBERTa, reviewed by humans, built for trust.',
}

const TRUST_ORGS = [
  { name: 'GVSU', note: 'Grand Valley State University' },
  { name: 'Grand Rapids DeepTech', note: 'DeepTech accelerator' },
  { name: 'Hugging Face', note: 'Model hosting' },
]

const PROBLEM = [
  {
    stat: '720k+',
    title: 'Lives lost every year',
    text: 'Around 720,000 people die by suicide annually worldwide. Most showed warning signs first.',
  },
  {
    stat: '1:400',
    title: 'Counsellor-to-student ratio',
    text: 'A single school counsellor can be responsible for hundreds of students. Meaningful check-ins with everyone is mathematically impossible.',
  },
  {
    stat: '90%',
    title: 'Reactive, not preventive',
    text: 'An estimated 90% of at-risk youth show warning signs — but a sign no one sees in time is not a sign.',
  },
]

const SOLUTION = [
  {
    icon: '📋',
    title: 'Consent workflow that runs itself',
    text: 'Upload your roster, and MindGuard routes signed consent requests to the right person — parents for minors, students for adults — with reminders, expiry and a full audit trail.',
  },
  {
    icon: '🧠',
    title: 'ML risk detection, human-reviewed',
    text: 'A purpose-trained model (Mental-RoBERTa, ROC-AUC 0.98) surfaces early signs of distress across platforms. Every output is a summary for a counsellor to review.',
  },
  {
    icon: '🔔',
    title: 'A rolling risk view for follow-up',
    text: 'Counsellors get a prioritised, four-tier risk view of consented students, with crisis resources one click away — a structured starting point for real conversations.',
  },
]

const COMMITMENTS = [
  { icon: '🛡️', title: 'Consent-first', text: 'No analysis without consent. One-click withdrawal, effective immediately.' },
  { icon: '🧑‍⚕️', title: 'Human-in-the-loop', text: 'Supports counsellors — never replaces them, never automates a decision.' },
  { icon: '🏫', title: 'FERPA / COPPA aware', text: 'Student records protected; minors routed through parental consent.' },
  { icon: '🗑️', title: 'Data minimisation', text: 'Only explicitly shared content is analysed; nothing stored between sessions.' },
]

const AWARDS = [
  { title: 'DeepTech Runner-Up', event: 'Grand Rapids DeepTech' },
  { title: 'Innovation Day Winner', event: 'GVSU Innovation Day' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-ink leading-tight max-w-4xl mx-auto">
            Catch the signals of distress —{' '}
            <span className="text-teal-600">before a crisis.</span>
          </h1>
          <p className="mt-6 text-lg text-slate max-w-2xl mx-auto">
            Consent-first AI decision support for school and university counsellors. Powered
            by Mental-RoBERTa, reviewed by humans, built for trust.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <CtaButton href="/demo">Request a demo</CtaButton>
            <CtaButton href="/product" variant="ghost">
              See how it works
            </CtaButton>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-10 border-y border-[#eef2f6] bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {TRUST_ORGS.map((org) => (
              <div key={org.name} className="flex flex-col items-center">
                <span className="text-lg font-extrabold text-slate/70">{org.name}</span>
                <span className="text-xs text-slate/60">{org.note}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <TrustBadge label="HIPAA-aligned" />
            <TrustBadge label="FERPA-compliant" />
            <TrustBadge label="COPPA-ready" />
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="The problem"
            subtitle="The signals are there. The capacity to see them in time is not."
          />
          <div className="grid gap-10 sm:grid-cols-3 max-w-4xl mx-auto text-center">
            {PROBLEM.map((p) => (
              <div key={p.stat}>
                <div className="text-4xl font-extrabold text-teal-600">{p.stat}</div>
                <div className="mt-2 font-bold text-ink">{p.title}</div>
                <p className="mt-3 text-sm text-slate leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="The solution"
            subtitle="Decision support that gives counsellors an earlier warning — without crossing into surveillance."
          />
          <div className="grid sm:grid-cols-3 gap-6">
            {SOLUTION.map((s) => (
              <Card key={s.title} icon={s.icon} title={s.title}>
                {s.text}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="Our commitment"
            subtitle="Four ethical safeguards we will not compromise."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMITMENTS.map((c) => (
              <Card key={c.title} icon={c.icon} title={c.title}>
                {c.text}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team + Awards */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div className="bg-white border border-[#eef2f6] rounded-2xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-xl font-bold text-white">
              DO
            </div>
            <h3 className="text-lg font-bold text-ink">Diana Opiyo</h3>
            <p className="text-sm text-teal-700 font-semibold mt-1">
              Founder, Lead Developer &amp; ML Engineer
            </p>
            <p className="mt-4 text-sm text-slate leading-relaxed">
              Built from research to production — training the model, designing the
              consent-first product, and shipping the platform.
            </p>
            <Link href="/about" className="mt-6 inline-block text-sm font-semibold text-teal-700 hover:underline">
              About us →
            </Link>
          </div>
          <div className="bg-white border border-[#eef2f6] rounded-2xl p-8">
            <h3 className="text-lg font-bold text-ink mb-6">Recognition</h3>
            <div className="flex flex-col gap-4">
              {AWARDS.map((a) => (
                <div key={a.title} className="flex items-center gap-4 rounded-xl border border-[#eef2f6] p-4">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-semibold text-ink text-sm">{a.title}</div>
                    <div className="text-xs text-slate">{a.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <CtaBand
        title="Ready to see MindGuard in action?"
        subtitle="We'll walk you through the consent workflow, the tracking dashboard and the multi-platform monitoring — with your school's data in mind."
      />
    </div>
  )
}
