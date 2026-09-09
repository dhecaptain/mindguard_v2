'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, Cpu, Trash2, Shield, Lock, Eye } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'Encrypted Roster Ingestion',
    icon: Upload,
    short: 'Roster upload',
    details: 'IT administrators upload student rosters over TLS 1.3 encrypted connections. Student PII is encrypted at rest.',
    guarantee: 'Zero raw PII exposure',
  },
  {
    num: '02',
    title: 'Verified Consent Dispatch',
    icon: CheckCircle2,
    short: 'Consent verification',
    details: 'MindGuard routes digital consent forms (parent for minors, direct for adult university students). Only verified consent ever unlocks analysis.',
    guarantee: '100% opt-in required',
  },
  {
    num: '03',
    title: 'Ephemeral Mental-RoBERTa ML',
    icon: Cpu,
    short: 'Signal analysis',
    details: 'A purpose-trained model (ROC-AUC 0.98) evaluates distress risk and produces a summary for counsellors — no external API calls, no automated decisions.',
    guarantee: 'In-memory processing only',
  },
  {
    num: '04',
    title: 'Immediate Erase & Human Summary',
    icon: Trash2,
    short: 'Human-reviewed summary',
    details: 'Raw content is purged after generating a structured risk summary for human counsellor triage. The counsellor keeps the decision.',
    guarantee: 'Summary-only output',
  },
]

export function SecurityDiagram() {
  const [activeStep, setActiveStep] = useState(0)
  const current = STEPS[activeStep]

  return (
    <div className="mg-console rounded-3xl p-6 sm:p-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-500/10 border border-forest-400/25 text-forest-200 text-xs font-medium uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Architecture breakdown</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            The 4-step consent-gated pipeline
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-forest-200 bg-white/[0.04] px-3.5 py-1.5 rounded-xl border border-white/10 shrink-0">
          <Lock className="w-4 h-4" />
          <span>Designed for education compliance</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {STEPS.map((step, idx) => {
          const Icon = step.icon
          const isActive = idx === activeStep
          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                isActive
                  ? 'bg-white/[0.07] border-forest-400/40 text-white'
                  : 'bg-white/[0.02] border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold ${isActive ? 'text-forest-300' : 'text-white/30'}`}>
                  {step.num}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-forest-300' : 'text-white/30'}`} />
              </div>
              <div className="text-xs font-semibold">{step.short}</div>
            </button>
          )
        })}
      </div>

      {/* Detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.num}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-forest-500/15 border border-forest-400/25 flex items-center justify-center font-semibold text-forest-200 font-mono">
                {current.num}
              </span>
              <h4 className="text-lg font-semibold text-white">{current.title}</h4>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-500/10 text-forest-200 border border-forest-400/25 text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              {current.guarantee}
            </span>
          </div>

          <p className="text-sm text-white/70 leading-relaxed mb-6">{current.details}</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/50 pt-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-forest-300" />
              Human-in-the-loop oversight only
            </span>
            <span className="flex items-center gap-1.5 text-forest-300">
              Summary → Human review
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
