import type { Metadata } from 'next'
import { PageHero, SectionHeading, Card, CtaButton } from '@/components/ui'

export const metadata: Metadata = {
  title: 'About — MindGuard',
  description:
    'The mission, research and people behind MindGuard — a consent-first, human-in-the-loop decision-support tool for counsellors.',
}

const MILESTONES = [
  {
    year: 'Research',
    title: 'Mental-RoBERTa',
    text: 'A transformer pre-trained on millions of mental-health domain posts and fine-tuned on 12,656 annotated examples — ROC-AUC 0.9813, 92.5% accuracy. The model is the engine; consent and human review are the guardrails.',
  },
  {
    year: 'Build',
    title: 'Consent-first by design',
    text: 'The product was architected around one idea: no student content is analysed without explicit, revocable, audited consent. That principle shapes every workflow, from roster upload to the consent portal.',
  },
  {
    year: 'Validate',
    title: 'Built with practitioners',
    text: 'Designed for the people on the front line — school psychologists, licensed counsellors and mental-health staff — who review every output and keep the human in the loop.',
  },
]

const AWARDS = [
  { title: 'DeepTech Runner-Up', event: 'Grand Rapids DeepTech' },
  { title: 'Innovation Day Winner', event: 'GVSU Innovation Day' },
]

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About"
        title="Why we built MindGuard"
        subtitle="A decision-support tool that helps counsellors catch the signals of distress earlier — without ever crossing the line into surveillance."
      />

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="Our mission"
            subtitle="Around 720,000 people die by suicide every year. Most showed warning signs first. The signals are there — counsellors just need the tools to see them in time."
          />
          <div className="max-w-3xl mx-auto text-center text-lg text-slate leading-relaxed">
            <p>
              MindGuard exists to give school and university counsellors an earlier warning —
              powered by a purpose-trained model, governed by consent, and always reviewed by
              a human. We build for trust because nothing else works in a counselling room.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading title="From research to product" />
          <div className="grid md:grid-cols-3 gap-6">
            {MILESTONES.map((m) => (
              <Card key={m.year} title={m.title}>
                <div className="mb-3 text-xs font-bold uppercase tracking-wide text-teal-600">{m.year}</div>
                {m.text}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading title="Recognition" />
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {AWARDS.map((a) => (
              <div key={a.title} className="bg-white border border-[#eef2f6] rounded-2xl p-8 text-center">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="text-lg font-bold text-ink">{a.title}</h3>
                <p className="text-sm text-slate mt-1">{a.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading title="The team" />
          <div className="max-w-xl mx-auto bg-white border border-[#eef2f6] rounded-2xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-600 text-2xl font-bold text-white">
              DO
            </div>
            <h3 className="text-lg font-bold text-ink">Diana Opiyo</h3>
            <p className="text-sm text-teal-700 font-semibold mt-1">
              Founder, Lead Developer &amp; ML Engineer
            </p>
            <p className="mt-4 text-sm text-slate leading-relaxed">
              Diana built MindGuard from research to production — training Mental-RoBERTa,
              designing the consent-first product, and leading the engineering that ships it.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-ink mb-8">Work with us</h2>
          <CtaButton href="/demo">Request a demo</CtaButton>
        </div>
      </section>
    </div>
  )
}
