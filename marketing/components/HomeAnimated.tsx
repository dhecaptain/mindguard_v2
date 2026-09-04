'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Reveal, Stagger, StaggerItem, FloatingOrb, HoverLift } from '@/components/motion'
import { CtaButton, Card, CtaBand, SectionHeading } from '@/components/ui'
import { Icons } from '@/components/icons'
import { GlassHero } from '@/components/GlassHero'
import { TrustMarquee } from '@/components/TrustMarquee'
import { ProblemCounterSection } from '@/components/ProblemCounterSection'
import { ShieldCheck, Heart, ClipboardCheck, Brain, Lock, Users, Activity, Award, ArrowRight } from 'lucide-react'


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
    icon: <Activity className="w-6 h-6 text-emerald-600" />,
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
    <div className="overflow-hidden bg-[#0a0d14]">
      <GlassHero />
      <TrustMarquee />
      <ProblemCounterSection />

      <section className="py-24 relative overflow-hidden bg-[#0a0d14] border-t border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1a14]/30 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-emerald-300 text-[11px] font-semibold tracking-widest uppercase mb-4">Solution</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">The MindGuard Solution</h2>
              <p className="mt-4 text-base text-white/50 max-w-2xl mx-auto leading-relaxed">Decision support that gives counsellors an earlier warning without crossing into surveillance.</p>
            </div>
          </Reveal>
          <Stagger stagger={0.08} className="grid sm:grid-cols-3 gap-6">
            {SOLUTION.map((s) => (
              <StaggerItem key={s.title}>
                <HoverLift className="h-full">
                  <div className="group h-full rounded-2xl bg-white/[0.04] backdrop-blur-[16px] border border-white/[0.06] p-7 shadow-[0_16px_48px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 flex flex-col">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">{s.icon}</div>
                    <h3 className="font-bold text-white text-[15px] mb-2">{s.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{s.text}</p>
                    <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/25"><span>Verified Safeguard</span><span className="font-mono text-emerald-400/70">Strict Protocol</span></div>
                  </div>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-[#0a0d14] border-y border-white/[0.06]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-emerald-300 text-[11px] font-semibold tracking-widest uppercase mb-4">Safeguards</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Ethical Safeguards by Design</h2>
              <p className="mt-4 text-base text-white/50 max-w-2xl mx-auto">Four core principles embedded directly into our codebase that we will not compromise.</p>
            </div>
          </Reveal>
          <Stagger stagger={0.08} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMITMENTS.map((c) => (
              <StaggerItem key={c.title}>
                <HoverLift className="h-full">
                  <div className="group h-full rounded-2xl bg-white/[0.04] backdrop-blur-[16px] border border-white/[0.06] p-7 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all flex flex-col">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">{c.icon}</div>
                    <h3 className="font-semibold text-white text-sm mb-2">{c.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed">{c.text}</p>
                  </div>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="py-24 bg-[#0a0d14] relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-6">
          
          <Reveal>
            <HoverLift className="h-full">
              <div className="relative rounded-3xl bg-white/[0.04] backdrop-blur-[16px] border border-white/[0.06] p-8 sm:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.1] transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 shadow-lg shadow-emerald-500/20">
                    <div className="w-16 h-16 rounded-full bg-[#0a0d14] flex items-center justify-center font-extrabold text-xl text-emerald-400 border border-white/10">DO</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Diana Opiyo</h3>
                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mt-0.5">Founder, Lead Developer & ML Engineer</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/60 text-[11px] font-mono">Creator of Mental-RoBERTa Pipeline</span>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">Built from academic research to production system — training the model, architecting the consent first flow, and building a platform that counsellors can trust.</p>
                <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-white/30">MindGuard Founder Spotlight</span>
                  <Link href="/about" className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1">Read Our Narrative →</Link>
                </div>
              </div>
            </HoverLift>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="h-full rounded-3xl bg-white/[0.04] backdrop-blur-[16px] border border-white/[0.06] p-8 sm:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between hover:bg-white/[0.06] transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-bold text-white">Institutional Recognition</h3>
                </div>
                <Stagger stagger={0.08} className="space-y-4">
                  {AWARDS.map((a) => (
                    <StaggerItem key={a.title}>
                      <motion.div whileHover={{ x: 4 }} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.06] transition-all flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-emerald-400 shrink-0"><Icons.Trophy /></div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{a.title}</h4>
                          <p className="text-xs text-white/40 mt-0.5">{a.note}</p>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/30">
                <span>Audited Academic Credentials</span>
                <span className="text-emerald-300 font-medium">GVSU & DeepTech Verified</span>
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

