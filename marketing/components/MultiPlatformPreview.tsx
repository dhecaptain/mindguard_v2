'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, GraduationCap, MessageSquare, Mail, ShieldCheck, Activity } from 'lucide-react'

const CHANNELS = [
  {
    id: 'gdocs',
    label: 'Google Docs & Drive',
    icon: FileText,
    badge: 'Real-time Sync',
    sampleTitle: 'English Literature Essay Draft #3',
    snippet: '"...everything feels overwhelming lately and I can\'t seem to find any reason to keep trying..."',
    sentiment: 'High Distress Flag',
    confidence: '98.4%',
    consentStatus: 'Parent Consented',
    privacyNote: 'Processed via ephemeral memory pipeline. Zero text saved to DB.',
  },
  {
    id: 'lms',
    label: 'Canvas LMS / Blackboard',
    icon: GraduationCap,
    badge: 'LMS API Integration',
    sampleTitle: 'Psychology 101 Discussion Board Post',
    snippet: '"Sometimes I feel like disappearing from campus completely and nobody would even notice..."',
    sentiment: 'Moderate Distress Flag',
    confidence: '94.1%',
    consentStatus: 'Student Opted-In',
    privacyNote: 'Only submitted coursework processed after verified student opt-in.',
  },
  {
    id: 'social',
    label: 'Consented Social (Reddit/Bluesky)',
    icon: MessageSquare,
    badge: 'OAuth Opt-In',
    sampleTitle: 'Public Student Forum Post',
    snippet: '"Late night thoughts... feeling completely isolated and losing hope..."',
    sentiment: 'High Distress Flag',
    confidence: '96.8%',
    consentStatus: 'OAuth Verified',
    privacyNote: 'Requires explicit OAuth token handshake from student.',
  },
  {
    id: 'email',
    label: 'School Communications',
    icon: Mail,
    badge: 'Direct Signals',
    sampleTitle: 'Student Inquiry Note',
    snippet: '"I need help with my crisis management plan before tomorrow morning..."',
    sentiment: 'Critical Priority Flag',
    confidence: '99.2%',
    consentStatus: 'Consented Protocol',
    privacyNote: 'Automatically escalated to Counsellor Triage queue.',
  },
]

export function MultiPlatformPreview() {
  const [activeTab, setActiveTab] = useState(CHANNELS[0].id)
  const current = CHANNELS.find((c) => c.id === activeTab) || CHANNELS[0]

  return (
    <div className="rounded-3xl bg-slate-900 border border-emerald-500/25 p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden glass-panel-dark">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Multi-Platform Coverage Matrix</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            How Signals Are Processed Across Digital Touchpoints
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero Data Retention</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon
          const isActive = ch.id === activeTab
          return (
            <button
              key={ch.id}
              onClick={() => setActiveTab(ch.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
              <span>{ch.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active Tab Preview Window */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl bg-slate-950/90 border border-slate-800 p-6 relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-white text-sm">{current.sampleTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[11px]">
                {current.badge}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px]">
                {current.consentStatus}
              </span>
            </div>
          </div>

          {/* Snippet Display */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
            {current.snippet}
          </div>

          {/* Analysis Result Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 mb-1">Mental-RoBERTa Signal</div>
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {current.sentiment}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 mb-1">Model Confidence</div>
              <div className="font-bold text-emerald-400 font-mono">{current.confidence} ROC-AUC</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 mb-1">Counsellor Action</div>
              <div className="font-bold text-emerald-300">Formatted Summary to Triage</div>
            </div>
          </div>

          {/* Footer Privacy Guarantee */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>🛡️ Safeguard Note: {current.privacyNote}</span>
            <a
              href="https://app.mindguardai.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              Test Live App &rarr;
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
