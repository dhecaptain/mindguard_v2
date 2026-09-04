'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, Cpu, Trash2, Shield, Lock, Eye, RefreshCw } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'Encrypted Roster Ingestion',
    icon: Upload,
    short: 'Roster Upload',
    details: 'IT administrators upload student rosters over AES-256 TLS 1.3 encrypted connections. Student IDs are anonymized before processing.',
    guarantee: 'Zero raw PII exposure',
  },
  {
    num: '02',
    title: 'Verified Consent Dispatch',
    icon: CheckCircle2,
    short: 'Consent Verification',
    details: 'MindGuard routes digital consent forms (Parent for minors, Direct for adult university students). Only verified active consent unlocks telemetry analysis.',
    guarantee: '100% Opt-In Required',
  },
  {
    num: '03',
    title: 'Ephemeral Mental-RoBERTa ML',
    icon: Cpu,
    short: 'ML Distress Analysis',
    details: 'Purpose-trained model (ROC-AUC 0.98) evaluates distress risk in isolated RAM buffers without persistent storage or external API calls.',
    guarantee: 'In-memory processing only',
  },
  {
    num: '04',
    title: 'Immediate Erase & Human Summary',
    icon: Trash2,
    short: 'Zero Data Retention',
    details: 'Raw content is permanently purged from buffer immediately after generating a structured risk summary for human counsellor triage.',
    guarantee: 'Zero text saved to database',
  },
]

export function SecurityDiagram() {
  const [activeStep, setActiveStep] = useState(0)
  const current = STEPS[activeStep]

  return (
    <div className="rounded-3xl bg-slate-900 border border-emerald-500/25 p-8 text-white shadow-2xl relative overflow-hidden glass-panel-dark">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Architecture Breakdown</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            The 4-Step Zero-Data-Retention Pipeline
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 shrink-0">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>FERPA & HIPAA Audited</span>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {STEPS.map((step, idx) => {
          const Icon = step.icon
          const isActive = idx === activeStep
          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'bg-slate-800 border-emerald-500/60 shadow-lg shadow-emerald-950/40 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {step.num}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              </div>
              <div className="text-xs font-bold truncate">{step.short}</div>
            </button>
          )
        })}
      </div>

      {/* Active Step Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.num}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 font-mono">
                {current.num}
              </span>
              <h4 className="text-lg font-extrabold text-white">{current.title}</h4>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{current.guarantee}</span>
            </span>

          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            {current.details}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              Human-in-the-Loop Oversight Only
            </span>
            <span className="flex items-center gap-1.5 font-mono text-emerald-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Automated Memory Purge Active
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
