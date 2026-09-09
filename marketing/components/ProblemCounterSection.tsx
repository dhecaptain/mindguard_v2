'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Users, EyeOff, ShieldAlert } from 'lucide-react'
import { CountUp } from '@/components/motion'

const PROBLEM_ITEMS = [
  {
    stat: '720k+',
    displayStat: '720,000+',
    title: 'Lives lost globally each year',
    text: 'Around 720,000 people die by suicide annually worldwide. Research shows the majority exhibit observable distress indicators in written or digital content long before a crisis.',
    icon: AlertCircle,
    accent: 'from-amber-500/20 via-emerald-500/10 to-transparent',
    glowColor: 'group-hover:border-amber-500/40',
  },
  {
    stat: '1:400',
    displayStat: '1 : 400',
    title: 'Counsellor-to-student ratio',
    text: 'A single school counsellor can be responsible for 400+ students. Proactively checking in with every student every week is mathematically impossible without decision support.',
    icon: Users,
    accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    glowColor: 'group-hover:border-emerald-500/40',
  },
  {
    stat: '90%',
    displayStat: '90%',
    title: 'Signals missed until it is too late',
    text: 'An estimated 90% of youth experiencing crisis show warning signs. But a signal no human has the capacity to see in time is not a signal — it is a missed opportunity.',
    icon: EyeOff,
    accent: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    glowColor: 'group-hover:border-teal-500/40',
  },
]

export function ProblemCounterSection() {
  return (
    <section className="relative py-24 bg-[#0a0d14] text-white overflow-hidden border-y border-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14] via-[#0e1a14]/50 to-[#0a0d14]" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm"
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>The Structural Problem</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight"
        >
          The signals are there.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            The capacity to see them in time is not.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          Traditional wellbeing monitoring is trapped between reactive crisis response and invasive surveillance. MindGuard bridges the gap with consent-first decision support.
        </motion.p>

        {/* Illuminated Dark Cards Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
          {PROBLEM_ITEMS.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.stat}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative rounded-2xl bg-white/[0.04] backdrop-blur-[16px] border border-white/[0.06] p-8 text-left transition-all duration-300 shadow-[0_24px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.1]"
              >
                <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${item.accent} rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`} />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-emerald-400 group-hover:border-emerald-500/20 group-hover:scale-110 transition-all backdrop-blur">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white/30 group-hover:text-emerald-400 transition-colors uppercase tracking-widest">
                    Metric 0{idx + 1}
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white group-hover:text-emerald-300 transition-colors">
                  <CountUp value={item.stat} />
                </div>

                {/* Title & Body */}
                <h3 className="mt-4 font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                  {item.text}
                </p>
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/30">
                  <span>Public health & research data</span>
                  <span className="text-emerald-400 font-mono">Sources below</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Sources */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-2 text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500/70" />
            WHO — Global suicide estimates:{" "}
            <a href="https://www.who.int/news-room/fact-sheets/detail/suicide" target="_blank" rel="noopener noreferrer" className="text-emerald-400/80 hover:text-emerald-300 underline underline-offset-2">
              who.int
            </a>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500/70" />
            ASCA — Student-to-school-counsellor ratios:{" "}
            <a href="https://www.schoolcounselor.org/About-School-Counseling/Student-to-School-Counselor-Ratios" target="_blank" rel="noopener noreferrer" className="text-emerald-400/80 hover:text-emerald-300 underline underline-offset-2">
              schoolcounselor.org
            </a>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500/70" />
            AFSP — Warning signs of suicide:{" "}
            <a href="https://afsp.org" target="_blank" rel="noopener noreferrer" className="text-emerald-400/80 hover:text-emerald-300 underline underline-offset-2">
              afsp.org
            </a>
          </span>
        </div>

      </div>
    </section>
  )
}
