'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { APP_URL } from '@/lib/app-url'

const TIERS = [
  {
    id: 'pilot',
    name: 'Pilot',
    target: 'Single school · 1 counsellor · up to 100 students',
    positioning: 'Free for 3 months, includes onboarding and training',
    features: [
      'Full roster automated consent dispatch',
      'Parent & minor student consent flows',
      'Mental-RoBERTa risk triage engine',
      '1 counsellor seat included',
      'Dedicated onboarding & training',
    ],
  },
  {
    id: 'school',
    name: 'School',
    target: 'K-12 institution · unlimited students · up to 10 counsellors',
    positioning: 'Contact for pricing — annual license',
    features: [
      'Unlimited students & rosters',
      'Up to 10 counsellor seats',
      'Automated expiry & reminder engine',
      'Multi-source risk priority queue',
      'FERPA-conscious workflows & audit trail',
    ],
  },
  {
    id: 'district',
    name: 'District / University',
    target: 'Multi-school or university system · full analytics',
    positioning: 'Contact for pricing — enterprise',
    features: [
      'Multi-school or university system',
      'Direct student adult-consent workflow',
      'Full institution analytics & reporting',
      'Custom roles, SLAs & procurement terms',
      'Dedicated institutional onboarding manager',
    ],
  },
]

export function PricingCalculator() {
  const [active, setActive] = useState('school')
  const tier = TIERS.find((t) => t.id === active) ?? TIERS[1]

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-emerald-500/20 p-8 sm:p-10 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
          Pricing Overview
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Plans that scale from one school to a district
        </h3>
        <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto">
          Select a tier to see what's included. Pricing is quoted per institution — get in touch
          for a proposal.
        </p>
      </div>

      {/* Tier selector */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
              active === t.id
                ? 'border-emerald-500/50 bg-emerald-500/5 shadow-md'
                : 'border-slate-200 bg-white hover:border-emerald-500/30'
            }`}
          >
            <div className="text-sm font-extrabold text-slate-900">{t.name}</div>
            <div className="mt-1 text-[11px] leading-snug text-slate-500">{t.target}</div>
          </button>
        ))}
      </div>

      {/* Active tier detail */}
      <motion.div
        key={tier.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl glass-panel-dark p-7 text-white shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h4 className="text-xl sm:text-2xl font-extrabold text-white">{tier.name}</h4>
            <p className="mt-1 text-sm text-slate-400">{tier.target}</p>
          </div>
          <div className="sm:text-right sm:max-w-[220px]">
            <div className="text-sm font-bold text-emerald-400">{tier.positioning}</div>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Included</div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
            {tier.features.map((feat) => (
              <div key={feat} className="flex items-start gap-2.5">
                <span className="mt-0.5 p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Need something custom? Every institution gets a tailored proposal — no hidden per-student fees.
          </p>

          <div className="flex items-center gap-3">
            <a
              href="/request-demo"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5"
            >
              <span>Request a demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl text-white/70 border border-white/15 hover:bg-white/10 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <span>Launch App</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}