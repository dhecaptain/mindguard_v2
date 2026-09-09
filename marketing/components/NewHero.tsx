'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, ShieldCheck, TrendingUp, UserCheck } from 'lucide-react'
import { APP_URL } from '@/lib/app-url'

const EASE = [0.22, 0.61, 0.36, 1] as const

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  }
}

export function NewHero() {
  return (
    <section className="relative overflow-hidden bg-mist">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_20%_0%,rgba(220,235,227,0.7),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-forest-100/50 blur-3xl" />

      <div className="relative mg-section grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center py-16 sm:py-24">
        {/* Left — message */}
        <div>
          <motion.p {...fadeUp(0)} className="mg-eyebrow">
            Early-signal wellbeing support
          </motion.p>

          <motion.h1
            {...fadeUp(0.08)}
            className="display mt-5 text-4xl sm:text-5xl md:text-[3.4rem] text-ink max-w-xl"
          >
            Technology that notices.{' '}
            <span className="text-forest">People who care.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            className="mt-6 text-lg text-ink-soft leading-relaxed max-w-lg"
          >
            MindGuard helps school and university counsellors notice early signs of distress in
            consented digital content — so support arrives sooner, with consent and human review
            built in from the start.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/request-demo" className="mg-btn-primary">
              <span>Request a demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/product" className="mg-btn-secondary">
              See how it works
            </Link>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mg-btn-ghost"
            >
              Launch App
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.32)} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-soft">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-500" />
              Consent-first
            </span>
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-forest-500" />
              Human-reviewed
            </span>
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-forest-500" />
              Built for wellbeing
            </span>
          </motion.div>
        </div>

        {/* Right — product preview */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
          className="relative"
        >
          <div className="mg-console rounded-3xl p-5 sm:p-6">
            {/* Console header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-lg bg-forest-500/20 border border-forest-400/30 flex items-center justify-center text-forest-200">
                  <Heart className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">Wellbeing overview</div>
                  <div className="text-[0.72rem] text-white/50">For consented students · 2,340</div>
                </div>
              </div>
              <span className="rounded-full bg-forest-500/15 border border-forest-400/30 px-2.5 py-1 text-[0.68rem] font-medium text-forest-200">
                Consent active
              </span>
            </div>

            {/* Mini stat row */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: 'Reviewed', value: '128', tone: 'text-emerald-200' },
                { label: 'Follow-ups', value: '14', tone: 'text-amber-200' },
                { label: 'Supported', value: '9', tone: 'text-sky-200' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                  <div className={`text-lg font-semibold ${s.tone}`}>{s.value}</div>
                  <div className="text-[0.68rem] text-white/50">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Signal rows */}
            <div className="mt-4 space-y-2.5">
              {[
                { name: 'A. — Counsellor review', status: 'Emerging signal', tone: 'amber' },
                { name: 'M. — Follow-up scheduled', status: 'Support pathway', tone: 'emerald' },
                { name: 'J. — Check-in completed', status: 'Resolved', tone: 'sky' },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-3">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-forest-300" />
                    <span className="text-sm text-white/90">{row.name}</span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium border ${
                      row.tone === 'amber'
                        ? 'text-amber-200 bg-amber-500/10 border-amber-400/30'
                        : row.tone === 'emerald'
                        ? 'text-emerald-200 bg-forest-500/10 border-forest-400/30'
                        : 'text-sky-200 bg-sky-500/10 border-sky-400/30'
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[0.7rem] text-white/45">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-300" />
                Illustrative preview — not real student data
              </span>
              <span>Human review recommended</span>
            </div>
          </div>

          {/* Floating annotation cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
            className="absolute -left-4 top-10 hidden sm:block"
          >
            <div className="rounded-xl border border-[rgba(23,33,29,0.08)] bg-white px-3.5 py-2.5 shadow-card">
              <div className="text-[0.68rem] text-ink-soft">Consent status</div>
              <div className="text-sm font-semibold text-forest">Verified · active</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
            className="absolute -right-2 bottom-10 hidden sm:block"
          >
            <div className="rounded-xl border border-[rgba(23,33,29,0.08)] bg-white px-3.5 py-2.5 shadow-card">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-forest">
                <UserCheck className="w-4 h-4" />
                Human in the loop
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
