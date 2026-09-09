'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Video, Globe, FileText, ShieldCheck } from 'lucide-react'
import { APP_URL } from '@/lib/app-url'

const CHANNELS = [
  {
    id: 'social',
    label: 'Consented social feeds',
    icon: MessageSquare,
    badge: 'OAuth opt-in',
    sampleTitle: 'Public forum post (illustrative)',
    snippet: '"Late night thoughts... feeling completely isolated and losing hope..."',
    sentiment: 'High distress flag',
    consentStatus: 'OAuth verified',
    privacyNote: 'Requires an explicit OAuth token handshake from the student.',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: Video,
    badge: 'Consented public content',
    sampleTitle: 'Public comment (illustrative)',
    snippet: '"Sometimes I feel like disappearing from campus completely and nobody would even notice..."',
    sentiment: 'Moderate distress flag',
    consentStatus: 'Student opted-in',
    privacyNote: 'Only consented public content is processed for a counsellor summary.',
  },
  {
    id: 'facebook',
    label: 'Facebook / X',
    icon: Globe,
    badge: 'Consented public content',
    sampleTitle: 'Public post (illustrative)',
    snippet: '"...everything feels overwhelming lately and I can\'t seem to find any reason to keep trying..."',
    sentiment: 'High distress flag',
    consentStatus: 'Consented protocol',
    privacyNote: 'Output is a summary for human review — never shared outside your institution.',
  },
  {
    id: 'uploads',
    label: 'File & message exports',
    icon: FileText,
    badge: 'Consented upload',
    sampleTitle: 'WhatsApp export / CSV / JSON (illustrative)',
    snippet: '"I need help with my crisis management plan before tomorrow morning..."',
    sentiment: 'Critical priority flag',
    consentStatus: 'Consented protocol',
    privacyNote: 'Explicitly shared files are analysed to produce a summary a counsellor reviews.',
  },
]

export function MultiPlatformPreview() {
  const [activeTab, setActiveTab] = useState(CHANNELS[0].id)
  const current = CHANNELS.find((c) => c.id === activeTab) || CHANNELS[0]

  return (
    <div className="mg-console rounded-3xl p-6 sm:p-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-500/10 border border-forest-400/25 text-forest-200 text-xs font-medium uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>One wellbeing view</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Across the digital spaces students use
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Illustrative example — no real student data. Every connector is opt-in and consent-gated.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon
          const isActive = ch.id === activeTab
          return (
            <button
              key={ch.id}
              onClick={() => setActiveTab(ch.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white text-forest shadow-card'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-forest-600' : 'text-forest-300'}`} />
              <span>{ch.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl bg-white/[0.03] border border-white/10 p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-forest-400" />
              <span className="font-semibold text-white text-sm">{current.sampleTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-forest-500/10 text-forest-200 border border-forest-400/25 font-medium text-[0.7rem]">
                {current.badge}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/70 font-medium text-[0.7rem]">
                {current.consentStatus}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs sm:text-sm text-white/70 leading-relaxed mb-5">
            {current.snippet}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-white/40 mb-1">Signal</div>
              <div className="font-semibold text-amber-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                {current.sentiment}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-white/40 mb-1">Review queue</div>
              <div className="font-semibold text-forest-200">Summary → Counsellor</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-white/40 mb-1">Counsellor action</div>
              <div className="font-semibold text-forest-200">Formatted summary to triage</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[0.72rem] text-white/50">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-300 shrink-0" />
              Safeguard note: {current.privacyNote}
            </span>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-200 hover:text-forest-100 font-semibold flex items-center gap-1"
            >
              Open the app →
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
