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
    accent: 'from-rose-500/20 via-emerald-500/10 to-transparent',
    glowColor: 'group-hover:border-rose-500/40',
  },
]

export function ProblemCounterSection() {
  return (
    <section className="relative py-24 bg-slate-900 bg-grid-pattern text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

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
                className="group relative rounded-2xl bg-slate-950/80 border border-slate-800 p-8 text-left transition-all duration-300 shadow-xl overflow-hidden glass-panel-dark"
              >
                {/* Top Glowing Ambient Radial */}
                <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${item.accent} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />

                {/* Card Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/50 group-hover:scale-110 transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-emerald-400 transition-colors uppercase tracking-widest">
                    Metric 0{idx + 1}
                  </span>
                </div>

                {/* Animated Stat Counter */}
                <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  <CountUp value={item.stat} />
                </div>

                {/* Title & Body */}
                <h3 className="mt-4 font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {item.text}
                </p>

                {/* Bottom Card Border Highlight */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Audited Signal Data</span>
                  <span className="text-emerald-400 font-mono">Verified ✓</span>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
