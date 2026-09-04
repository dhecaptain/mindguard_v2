'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FloatingOrb, Reveal } from '@/components/motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { RiskSignalMatrix } from '@/components/RiskSignalMatrix'

export function GlassHero() {
  return (
    <section className="relative overflow-hidden bg-[#0a0d14] border-b border-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14] via-[#0e1a14] to-[#0a0d14]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />
      <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 -right-40 w-[520px] h-[520px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -left-40 w-[520px] h-[520px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
      <FloatingOrb className="bg-emerald-400/10 -top-28 -right-28" size={520} duration={24} />
      <FloatingOrb className="bg-teal-400/10 top-72 -left-32" size={420} duration={20} />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-[16px] text-emerald-300 text-xs font-semibold tracking-wide shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-white/90">Live</span>
          <span className="h-1 w-1 rounded-full bg-white/20" aria-hidden />
          <span className="text-white/70">Consent First Student Distress Detection Matrix</span>
          <span className="ml-1 hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 text-[10px] font-mono tracking-wider">
            ROC AUC 0.98
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight max-w-5xl mx-auto"
        >
          <span className="text-white">Catch the signals of distress</span>{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x">
              before a crisis.
            </span>
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-[0.5px]" />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-6 text-lg sm:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed"
        >
          Consent-first AI decision support for school and university counsellors. Powered by Mental-RoBERTa, reviewed by humans, built for institutional trust.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="https://app.mindguardai.me"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.35),0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_0_36px_rgba(16,185,129,0.5)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center gap-2">Launch App (app.mindguardai.me) <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          </a>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white/90 bg-white/[0.06] border border-white/[0.08] backdrop-blur-[12px] hover:bg-white/[0.1] hover:border-white/[0.14] hover:-translate-y-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300"
          >
            Request a demo
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20 rounded-3xl blur-2xl opacity-60" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
          <div className="relative rounded-3xl bg-white/[0.04] backdrop-blur-[24px] border border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden p-1.5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 rounded-3xl border border-emerald-500/0 group-hover:border-emerald-500/20 transition-colors" />
            </div>
            <div className="rounded-2xl overflow-hidden bg-[#0f1a15]/50">
              <RiskSignalMatrix />
            </div>
            <div className="flex items-center justify-center gap-6 py-3 text-xs text-white/40 border-t border-white/[0.06] mt-1">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> FERPA & COPPA Ready</span>
              <span className="hidden sm:flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-white/20" /> 256-bit Encrypted</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry</span>
            </div>
          </div>
        </motion.div>

        <Reveal delay={0.1} y={16} className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-white/35">
          <span>Trusted for consent first architecture</span>
          <span className="h-3 w-px bg-white/10 hidden sm:block" />
          <span>Human in the loop · Zero automated decisions</span>
        </Reveal>
      </div>
    </section>
  )
}
