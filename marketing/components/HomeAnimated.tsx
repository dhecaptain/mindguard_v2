'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Reveal, Stagger, StaggerItem, FloatingOrb, HoverLift } from '@/components/motion'
import { CtaButton, TrustBadge, Card, CtaBand, SectionHeading } from '@/components/ui'

const TRUST_ORGS = [
  { name: 'GVSU', note: 'Grand Valley State University' },
  { name: 'Grand Rapids DeepTech', note: 'DeepTech accelerator' },
  { name: 'Hugging Face', note: 'Model hosting' },
]
const PROBLEM = [
  { stat: '720k+', title: 'Lives lost every year', text: 'Around 720,000 people die by suicide annually worldwide. Most showed warning signs first.' },
  { stat: '1:400', title: 'Counsellor-to-student ratio', text: 'A single school counsellor can be responsible for hundreds of students. Meaningful check-ins with everyone is mathematically impossible.' },
  { stat: '90%', title: 'Reactive, not preventive', text: 'An estimated 90% of at-risk youth show warning signs — but a sign no one sees in time is not a sign.' },
]
const SOLUTION = [
  { icon: '📋', title: 'Consent workflow that runs itself', text: 'Upload your roster, and MindGuard routes signed consent requests to the right person — parents for minors, students for adults — with reminders, expiry and a full audit trail.' },
  { icon: '🧠', title: 'ML risk detection, human-reviewed', text: 'A purpose-trained model (Mental-RoBERTa, ROC-AUC 0.98) surfaces early signs of distress across platforms. Every output is a summary for a counsellor to review.' },
  { icon: '🔔', title: 'A rolling risk view for follow-up', text: 'Counsellors get a prioritised, four-tier risk view of consented students, with crisis resources one click away — a structured starting point for real conversations.' },
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

export default function HomeAnimated() {
  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-b from-teal-50 via-white to-white overflow-hidden">
        <FloatingOrb className="bg-teal-200/40 -top-20 -right-20" size={500} duration={20} />
        <FloatingOrb className="bg-emerald-200/30 top-40 -left-32" size={400} duration={16} />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-teal-200 text-teal-700 text-xs font-semibold shadow-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live — consent-first, human-in-the-loop
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-6xl font-extrabold text-ink leading-tight max-w-4xl mx-auto">
            Catch the signals of distress —{' '}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x">before a crisis.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-6 text-lg text-slate max-w-2xl mx-auto">
            Consent-first AI decision support for school and university counsellors. Powered by Mental-RoBERTa, reviewed by humans, built for trust.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-8 flex items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}><CtaButton href="/demo">Request a demo</CtaButton></motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}><CtaButton href="/product" variant="ghost">See how it works</CtaButton></motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-12 mx-auto max-w-3xl rounded-2xl border border-[#eef2f6] bg-white shadow-xl shadow-teal-900/5 p-3">
            <div className="rounded-xl bg-gradient-to-br from-[#f7f9fb] to-white border border-[#eef2f6] p-6 flex items-center gap-4 text-left">
              <div className="flex-1">
                <div className="h-3 w-24 rounded bg-teal-100 mb-3" />
                <div className="h-2 w-full rounded bg-slate-100 mb-2" />
                <div className="h-2 w-3/4 rounded bg-slate-100" />
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">At-risk</span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Consented ✓</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10 border-y border-[#eef2f6] bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {TRUST_ORGS.map((org) => (<div key={org.name} className="flex flex-col items-center"><span className="text-lg font-extrabold text-slate/70">{org.name}</span><span className="text-xs text-slate/60">{org.note}</span></div>))}
            </div>
          </Reveal>
          <Stagger className="flex flex-wrap items-center justify-center gap-3">
            {['HIPAA-aligned', 'FERPA-compliant', 'COPPA-ready'].map((label) => (<StaggerItem key={label}><TrustBadge label={label} /></StaggerItem>))}
          </Stagger>
        </div>
      </section>

      <section className="py-20 bg-[#f7f9fb] relative overflow-hidden">
        <FloatingOrb className="bg-teal-100/40 -bottom-20 right-10" size={350} duration={18} />
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal><SectionHeading title="The problem" subtitle="The signals are there. The capacity to see them in time is not." /></Reveal>
          <Stagger stagger={0.12} className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto text-center">
            {PROBLEM.map((p) => (
              <StaggerItem key={p.stat}><HoverLift><div className="bg-white rounded-2xl p-8 border border-[#eef2f6] shadow-sm"><motion.div initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="text-4xl font-extrabold text-teal-600">{p.stat}</motion.div><div className="mt-2 font-bold text-ink">{p.title}</div><p className="mt-3 text-sm text-slate leading-relaxed">{p.text}</p></div></HoverLift></StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal><SectionHeading title="The solution" subtitle="Decision support that gives counsellors an earlier warning — without crossing into surveillance." /></Reveal>
          <Stagger stagger={0.12} className="grid sm:grid-cols-3 gap-6">
            {SOLUTION.map((s) => (<StaggerItem key={s.title}><HoverLift className="h-full"><Card icon={s.icon} title={s.title}>{s.text}</Card></HoverLift></StaggerItem>))}
          </Stagger>
        </div>
      </section>

      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal><SectionHeading title="Our commitment" subtitle="Four ethical safeguards we will not compromise." /></Reveal>
          <Stagger stagger={0.08} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMITMENTS.map((c) => (<StaggerItem key={c.title}><HoverLift className="h-full"><Card icon={c.icon} title={c.title}>{c.text}</Card></HoverLift></StaggerItem>))}
          </Stagger>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <Reveal><HoverLift>
            <div className="bg-white border border-[#eef2f6] rounded-2xl p-8 text-center shadow-sm">
              <motion.div initial={{ scale: 0.8, rotate: -5 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200 }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-xl font-bold text-white">DO</motion.div>
              <h3 className="text-lg font-bold text-ink">Diana Opiyo</h3>
              <p className="text-sm text-teal-700 font-semibold mt-1">Founder, Lead Developer & ML Engineer</p>
              <p className="mt-4 text-sm text-slate leading-relaxed">Built from research to production — training the model, designing the consent-first product, and shipping the platform.</p>
              <Link href="/about" className="mt-6 inline-block text-sm font-semibold text-teal-700 hover:underline">About us →</Link>
            </div>
          </HoverLift></Reveal>
          <Reveal delay={0.15}>
            <div className="bg-white border border-[#eef2f6] rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-ink mb-6">Recognition</h3>
              <Stagger className="flex flex-col gap-4">
                {AWARDS.map((a) => (<StaggerItem key={a.title}><motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 rounded-xl border border-[#eef2f6] p-4 hover:shadow-md transition-shadow"><span className="text-2xl">🏆</span><div><div className="font-semibold text-ink text-sm">{a.title}</div><div className="text-xs text-slate">{a.event}</div></div></motion.div></StaggerItem>))}
              </Stagger>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Ready to see MindGuard in action?" subtitle="We'll walk you through the consent workflow, the tracking dashboard and the multi-platform monitoring — with your school's data in mind." />
    </div>
  )
}
