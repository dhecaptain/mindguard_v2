'use client'
import Link from 'next/link'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { CtaBand } from '@/components/ui'
import { NewHero } from '@/components/NewHero'
import { TrustMarquee } from '@/components/TrustMarquee'
import { ProblemCounterSection } from '@/components/ProblemCounterSection'
import {
  ShieldCheck,
  Heart,
  ClipboardCheck,
  Brain,
  Lock,
  Users,
  UserCheck,
  Search,
  MessageCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react'

const JOURNEY = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Student / person',
    text: 'A student who is struggling — and who, with consent, chooses to share digital content with their school.',
    tone: 'text-forest',
  },
  {
    icon: <ClipboardCheck className="w-6 h-6" />,
    title: 'Consent',
    text: 'Clear, revocable consent is recorded first — by the student if adult, by a parent or guardian if minor.',
    tone: 'text-forest',
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'MindGuard signal',
    text: 'A purpose-trained model surfaces an early, explainable signal for a trained professional to review.',
    tone: 'text-forest',
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: 'Counsellor / support team',
    text: 'A counsellor reviews the summary and decides the next step — with built-in crisis resources on hand.',
    tone: 'text-forest',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Human support',
    text: 'A real conversation and a real pathway to care. AI detected the signal. A human provides the care.',
    tone: 'text-forest',
  },
]

const STEPS = [
  {
    num: '01',
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Consent',
    text: 'Participation is always opt-in. Roster uploads route signed, single-use consent requests to the right person — parents for minors, students for adults.',
  },
  {
    num: '02',
    icon: <Search className="w-6 h-6" />,
    title: 'Understand',
    text: 'For consented students, MindGuard analyses the content they explicitly share and returns an explainable risk view for a counsellor to interpret.',
  },
  {
    num: '03',
    icon: <Eye className="w-6 h-6" />,
    title: 'Identify patterns',
    text: 'Meaningful patterns — not secret surveillance — surface as structured, human-readable summaries that help prioritise a counsellor\u2019s caseload.',
  },
  {
    num: '04',
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'Support',
    text: 'A trained counsellor uses the summary as a starting point for a real conversation, with crisis resources one click away when urgent.',
  },
]

const SAFEGUARDS = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Consent-first',
    text: 'No content is analysed until consent is given — and withdraw is one click, stopping analysis immediately.',
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: 'Human oversight',
    text: 'Every output is reviewed by a trained counsellor. MindGuard never makes an automated decision.',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Privacy by design',
    text: 'Student PII is encrypted at rest and access is limited to institution-authorised staff.',
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'Explainable signals',
    text: 'Risk surfaces as summaries a professional can interpret and defend — not a black-box verdict.',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: 'Minimal data',
    text: 'Only explicitly shared, consented content is processed. Nothing is stored between sessions.',
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Secure infrastructure',
    text: 'Built for FERPA and COPPA, with a full immutable audit trail behind every consent event.',
  },
]

export default function HomeAnimated() {
  return (
    <div>
      <NewHero />
      <TrustMarquee />
      <ProblemCounterSection />

      {/* Human-centered story: AI detects signals, humans provide care */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mg-section">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-14">
              <p className="mg-eyebrow mb-4">From signal to support</p>
              <h2 className="display text-3xl sm:text-4xl text-ink">
                AI detects signals. Humans provide care.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-ink-soft leading-relaxed max-w-2xl mx-auto">
                MindGuard was built on a simple principle: technology should never replace the
                people who care — it should help them notice sooner.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-5 gap-3">
            {JOURNEY.map((j, i) => (
              <Reveal key={j.title} delay={i * 0.06} className="h-full">
                <div className="relative h-full">
                  <div className="h-full mg-card p-6 text-center">
                    <div className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest-50 text-forest-600">
                      {j.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-ink">{j.title}</h3>
                    <p className="mt-2 text-xs text-ink-soft leading-relaxed">{j.text}</p>
                  </div>
                  {i < JOURNEY.length - 1 && (
                    <span className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 text-ink-soft/50" aria-hidden>
                      →
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-12 max-w-2xl mx-auto rounded-2xl border border-[rgba(23,74,58,0.16)] bg-forest-50 p-6 text-center">
              <p className="text-base text-forest-800 leading-relaxed">
                <strong>Care is human.</strong> MindGuard&apos;s only job is to help a counsellor know
                who needs them most — earlier.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Product story: From signal to support */}
      <section className="py-20 sm:py-28 bg-mist">
        <div className="mg-section">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-14">
              <p className="mg-eyebrow mb-4">How it works</p>
              <h2 className="display text-3xl sm:text-4xl text-ink">From signal to support</h2>
              <p className="mt-5 text-base text-ink-soft leading-relaxed max-w-2xl mx-auto">
                Four calm, deliberate steps — each one guarded by consent and human review.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.07} className="h-full">
                <div className="mg-card h-full p-7">
                  <div className="display text-5xl text-forest-100 mb-5">{s.num}</div>
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2.5 text-sm text-ink-soft leading-relaxed">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ethical AI safeguards */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mg-section">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-14">
              <p className="mg-eyebrow mb-4">Ethical safeguards by design</p>
              <h2 className="display text-3xl sm:text-4xl text-ink">
                Trust is part of the product
              </h2>
              <p className="mt-5 text-base text-ink-soft leading-relaxed max-w-2xl mx-auto">
                Six principles that are embedded into how MindGuard works — not added as an
                afterthought.
              </p>
            </div>
          </Reveal>

          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SAFEGUARDS.map((s) => (
              <StaggerItem key={s.title}>
                <div className="mg-card mg-card-hover p-7">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                    {s.icon}
                  </div>
                  <h3 className="text-base font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">{s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.15}>
            <div className="mt-12 text-center">
              <Link href="/security" className="text-sm font-semibold text-forest hover:text-forest-700">
                Explore our security &amp; compliance →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="See MindGuard in action for your institution"
        subtitle="We'll walk your counselling and IT teams through the consent workflow, the tracking view, and the full audit trail."
      />
    </div>
  )
}
