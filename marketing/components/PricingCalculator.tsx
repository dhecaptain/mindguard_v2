'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ShieldCheck, ArrowRight } from 'lucide-react'

export function PricingCalculator() {
  const [students, setStudents] = useState(2500)

  // Pricing & Tier calculation logic
  const getTierInfo = (count: number) => {
    if (count <= 1000) {
      return {
        name: 'K-12 Starter / Single School',
        pricePerStudent: '$2.40',
        estAnnual: '$' + (count * 2.4).toLocaleString(),
        badge: 'Ideal for Small K-12 Schools',
        features: [
          'Full roster automated consent dispatch',
          'Parent & minor student consent flows',
          'Mental-RoBERTa risk triage engine',
          'Up to 5 counsellor seats included',
          'HIPAA / FERPA compliance bundle',
        ],
      }
    } else if (count <= 5000) {
      return {
        name: 'School District Tier',
        pricePerStudent: '$1.85',
        estAnnual: '$' + (count * 1.85).toLocaleString(),
        badge: 'Recommended for School Districts',
        features: [
          'Multi-school district roster management',
          'Automated expiry & reminder engine',
          'Mental-RoBERTa high-risk priority queue',
          'Unlimited counsellor & admin seats',
          'Dedicated FERPA & COPPA compliance officer support',
          '99.9% uptime SLA',
        ],
      }
    } else if (count <= 10000) {
      return {
        name: 'University Campus Tier',
        pricePerStudent: '$1.45',
        estAnnual: '$' + (count * 1.45).toLocaleString(),
        badge: 'Popular for Higher-Ed Campuses',
        features: [
          'Direct student adult-consent workflow',
          'Multi-platform signal processing (LMS, Docs, Socials)',
          'Title IX non-discrimination protocol audit',
          'Custom crisis hotline localization (US States & International)',
          'Dedicated institutional onboarding manager',
        ],
      }
    } else {
      return {
        name: 'Enterprise / Statewide Network',
        pricePerStudent: 'Custom Volume',
        estAnnual: 'Custom Quote',
        badge: 'Statewide & Multi-District Networks',
        features: [
          'Custom infrastructure & dedicated DB instance',
          'On-premise / hybrid deployment options',
          'Custom ML fine-tuning for institutional needs',
          '24/7 Priority crisis incident response line',
          'Bespoke legal DPA & custom procurement terms',
        ],
      }
    }
  }

  const tier = getTierInfo(students)

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-emerald-500/20 p-8 sm:p-10 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
          Interactive Institutional Estimator
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Calculate Pricing For Your Student Body
        </h3>
        <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto">
          Adjust the slider to see how MindGuard scales with your institution's roster volume.
        </p>
      </div>

      {/* Interactive Slider */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Roster Volume</span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono">
            {students.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-normal">students</span>
          </span>
        </div>

        <input
          type="range"
          min="300"
          max="15000"
          step="250"
          value={students}
          onChange={(e) => setStudents(parseInt(e.target.value))}
          className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />

        <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
          <span>300 (Single School)</span>
          <span>5,000 (District)</span>
          <span>15,000+ (University Network)</span>
        </div>
      </div>

      {/* Dynamic Calculated Output Card */}
      <motion.div
        key={tier.name}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-slate-900 border border-emerald-500/30 p-7 text-white shadow-2xl glass-panel-dark"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              {tier.badge}
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold text-white mt-2">{tier.name}</h4>
          </div>
          <div className="sm:text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{tier.estAnnual}</div>
            <div className="text-xs text-slate-400 mt-0.5">{tier.pricePerStudent} / student / year</div>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Included Institutional Features</div>
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
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>FERPA & HIPAA Compliant Guarantee</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://app.mindguardai.me"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5"
            >
              <span>Launch App (app.mindguardai.me)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
