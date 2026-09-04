'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Reveal, Stagger, StaggerItem, FloatingOrb, HoverLift } from '@/components/motion'
import { CtaButton, Card, CtaBand, SectionHeading } from '@/components/ui'
import { Icons } from '@/components/icons'
import { RiskSignalMatrix } from '@/components/RiskSignalMatrix'
import { TrustMarquee } from '@/components/TrustMarquee'
import { ProblemCounterSection } from '@/components/ProblemCounterSection'
import { ShieldCheck, Heart, ClipboardCheck, Brain, Lock, Users, Sparkles, Award, ArrowRight } from 'lucide-react'

const SOLUTION = [
  {
    icon: <ClipboardCheck className="w-6 h-6 text-emerald-600" />,
    title: 'Consent workflow that runs itself',
    text: 'Upload your roster once. MindGuard routes signed consent requests to the right person — parents for minors, students for adults — with automated reminders, expiry logic and an immutable audit trail.',
  },
  {
    icon: <Brain className="w-6 h-6 text-emerald-600" />,
    title: 'ML risk detection, human-reviewed',
    text: 'A purpose-trained model (Mental-RoBERTa, ROC-AUC 0.98) surfaces early signs of distress across digital content. Outputs are formatted exclusively as summaries for human counsellors to review.',
  },
  {
    icon: <Heart className="w-6 h-6 text-emerald-600" />,
    title: 'Structured risk view for check-ins',
    text: 'Counsellors get a prioritised, four-tier risk view of consented students (Low, Moderate, High, Critical), with direct crisis resources available in one click to ground empathetic conversations.',
  },
]

const COMMITMENTS = [
  {
    icon: <Lock className="w-6 h-6 text-emerald-600" />,
    title: 'Consent-first architecture',
    text: 'No analysis occurs without explicit, verified consent. One-click withdrawal takes effect immediately across all system layers.',
  },
  {
    icon: <Users className="w-6 h-6 text-emerald-600" />,
    title: 'Human-in-the-loop decisions',
    text: 'Designed specifically to empower counsellors — never replaces human judgment, never automates an institutional decision.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    title: 'FERPA & COPPA compliant',
    text: 'Student records protected as education records; minors routed through verified parental consent flows.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
    title: 'Strict data minimisation',
    text: 'Only explicitly shared, consented content is processed. Zero data is retained or stored between analysis sessions.',
  },
]

const AWARDS = [
  { title: 'Grand Rapids DeepTech Runner-Up', note: 'Top-tier Midwest AI innovation accelerator' },
  { title: 'GVSU Innovation Day Winner', note: 'Recognised for ethics in student mental health technology' },
]

export default function HomeAnimated() {
  return (
    <div className="overflow-hidden bg-[#FAFAFA]">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 mesh-gradient-bg border-b border-emerald-500/10">
        
        {/* Ambient Animated Orbs */}
        <FloatingOrb className="bg-emerald-300/30 -top-24 -right-24" size={550} duration={22} />
        <FloatingOrb className="bg-teal-300/25 top-60 -left-36" size={450} duration={18} />

        <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
          
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-500/30 text-emerald-700 text-xs font-bold shadow-sm mb-8 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live — Consent-First Student Distress Detection Matrix
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight max-w-5xl mx-auto"
          >
            Catch the signals of distress —{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x">
              before a crisis.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            Consent-first AI decision support for school and university counsellors. Powered by Mental-RoBERTa, reviewed by humans, built for institutional trust.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <CtaButton href="/demo">
              <span>Request a demo</span>
              <ArrowRight className="w-4 h-4" />
            </CtaButton>

            <CtaButton href="/product" variant="ghost">
              <span>See how it works</span>
            </CtaButton>
          </motion.div>

          {/* Interactive 3D Pseudo-Glass Matrix Widget */}
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
            <RiskSignalMatrix />
          </motion.div>

        </div>
      </section>

      {/* CONTINUOUS TRUST MARQUEE STRIP */}
      <TrustMarquee />

      {/* THE PROBLEM SECTION */}
      <ProblemCounterSection />

      {/* THE SOLUTION SECTION */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              title="The MindGuard Solution"
              subtitle="Decision support that gives counsellors an earlier warning — without crossing into surveillance."
            />
          </Reveal>
          <Stagger stagger={0.08} className="grid sm:grid-cols-3 gap-8">
            {SOLUTION.map((s) => (
              <StaggerItem key={s.title}>
                <HoverLift className="h-full">
                  <Card icon={s.icon} title={s.title}>
                    {s.text}
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ETHICAL SAFEGUARDS SECTION */}
      <section className="py-24 bg-slate-50 border-y border-emerald-500/10">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              title="Ethical Safeguards by Design"
              subtitle="Four core principles embedded directly into our codebase that we will not compromise."
            />
          </Reveal>
          <Stagger stagger={0.08} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMITMENTS.map((c) => (
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

      {/* FOUNDER & RECOGNITION SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          
          {/* Founder Spotlight Card */}
          <Reveal>
            <HoverLift className="h-full">
              <div className="relative rounded-3xl bg-slate-900 border border-emerald-500/30 p-8 sm:p-10 text-white shadow-2xl overflow-hidden glass-panel-dark">
                {/* Ambient glow behind avatar */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-5 mb-6">
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 shadow-lg shadow-emerald-500/30">
                    <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center font-extrabold text-xl text-emerald-400 border border-slate-800">
                      DO
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Diana Opiyo</h3>
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mt-0.5">
                      Founder, Lead Developer & ML Engineer
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                      Creator of Mental-RoBERTa Pipeline
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Built from academic research to production system — training the model, architecting the consent-first consent flow, and building a platform that counsellors can trust.
                </p>

                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">MindGuard Founder Spotlight</span>
                  <Link href="/about" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    Read Our Narrative &rarr;
                  </Link>
                </div>
              </div>
            </HoverLift>
          </Reveal>

          {/* Recognition Card */}
          <Reveal delay={0.12}>
            <div className="h-full rounded-3xl bg-white border border-emerald-500/20 p-8 sm:p-10 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-xl font-bold text-slate-900">Institutional Recognition</h3>
                </div>

                <Stagger stagger={0.08} className="space-y-4">
                  {AWARDS.map((a) => (
                    <StaggerItem key={a.title}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="p-4 rounded-2xl bg-slate-50 border border-emerald-500/15 hover:border-emerald-500/40 hover:bg-emerald-50/40 transition-all flex items-start gap-4"
                      >
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 shrink-0">
                          <Icons.Trophy />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{a.note}</p>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Audited Academic Credentials</span>
                <span className="text-emerald-600 font-semibold">GVSU & DeepTech Verified</span>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* HIGH IMPACT CTA BAND */}
      <CtaBand
        title="Ready to see MindGuard in action for your institution?"
        subtitle="We'll walk your counselling and IT teams through the consent workflow, live telemetry tracking, and HIPAA/FERPA audit trail."
      />

    </div>
  )
}

