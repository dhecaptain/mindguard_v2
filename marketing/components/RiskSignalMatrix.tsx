'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Clock, UserCheck, Activity, Brain, Eye, Lock } from 'lucide-react'

type StateTab = 'pending' | 'consented' | 'active_review'

interface SignalNode {
  id: string
  studentId: string
  consentStatus: 'Pending' | 'Consented' | 'Revoked'
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  confidence: number
  platform: 'Google Docs' | 'Canvas LMS' | 'School Email'
  timestamp: string
  flaggedPhraseSnippet: string
  counsellorNote: string
}

const NODES_DATA: Record<StateTab, SignalNode[]> = {
  pending: [
    {
      id: 'NODE-081',
      studentId: 'Student #4819 (Minor)',
      consentStatus: 'Pending',
      riskLevel: 'Moderate',
      confidence: 89.2,
      platform: 'Canvas LMS',
      timestamp: '2 mins ago',
      flaggedPhraseSnippet: 'Parent consent request dispatched via email',
      counsellorNote: 'Awaiting parent digital signature. Analysis paused pending consent.',
    },
    {
      id: 'NODE-084',
      studentId: 'Student #3920 (Minor)',
      consentStatus: 'Pending',
      riskLevel: 'Low',
      confidence: 76.5,
      platform: 'School Email',
      timestamp: '14 mins ago',
      flaggedPhraseSnippet: 'Reminder #1 queued for Day 3',
      counsellorNote: 'Parent notification delivered. Zero data analysed until verified.',
    },
  ],
  consented: [
    {
      id: 'NODE-102',
      studentId: 'Student #7204',
      consentStatus: 'Consented',
      riskLevel: 'High',
      confidence: 98.4,
      platform: 'Google Docs',
      timestamp: 'Just now',
      flaggedPhraseSnippet: 'Mental-RoBERTa flagged distress indicators in shared draft',
      counsellorNote: 'Verified consent on file (Parent signed 09/02). Prioritised for counsellor review.',
    },
    {
      id: 'NODE-099',
      studentId: 'Student #1105',
      consentStatus: 'Consented',
      riskLevel: 'Moderate',
      confidence: 91.0,
      platform: 'Canvas LMS',
      timestamp: '8 mins ago',
      flaggedPhraseSnippet: 'Late night submission containing implicit isolation language',
      counsellorNote: 'Consent active. Signal routing to Lead Counsellor queue.',
    },
  ],
  active_review: [
    {
      id: 'NODE-077',
      studentId: 'Student #7204',
      consentStatus: 'Consented',
      riskLevel: 'Critical',
      confidence: 98.4,
      platform: 'Google Docs',
      timestamp: 'Active Now',
      flaggedPhraseSnippet: 'Counsellor Dr. Sarah Vance initiated wellness protocol',
      counsellorNote: 'Human review in progress: 1-on-1 check-in scheduled for 10:30 AM.',
    },
    {
      id: 'NODE-065',
      studentId: 'Student #5488',
      consentStatus: 'Consented',
      riskLevel: 'Moderate',
      confidence: 88.7,
      platform: 'School Email',
      timestamp: '15 mins ago',
      flaggedPhraseSnippet: 'Resolution logged — Student referred to peer support group',
      counsellorNote: 'De-escalated by counsellor. Immutable audit log stored.',
    },
  ],
}

const riskStyle: Record<string, string> = {
  Low: 'bg-forest-500/15 text-forest-200 border-forest-400/30',
  Moderate: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  High: 'bg-orange-500/15 text-orange-200 border-orange-400/30',
  Critical: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
}

export function RiskSignalMatrix() {
  const [activeTab, setActiveTab] = useState<StateTab>('consented')

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8">
      <div className="mg-console rounded-3xl p-5 sm:p-7 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-500/15 border border-forest-400/25 text-forest-200">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Counsellor review queue</h3>
                <span className="rounded-full bg-forest-500/10 border border-forest-400/25 text-forest-200 text-[0.68rem] font-medium uppercase tracking-wider">
                  Illustrative preview
                </span>
              </div>
              <p className="text-xs text-white/50">
                Mental-RoBERTa (ROC-AUC 0.98) · Consent and review status
              </p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Consent pending</span>
            </button>
            <button
              onClick={() => setActiveTab('consented')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === 'consented'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Consented</span>
            </button>
            <button
              onClick={() => setActiveTab('active_review')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === 'active_review'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Human review</span>
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="my-4 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-forest-300 shrink-0" />
            <span>
              {activeTab === 'pending' && 'Simulated: content analysis stays blocked until parent or student signs.'}
              {activeTab === 'consented' && 'Simulated: consented content is analysed into summaries for a counsellor to review.'}
              {activeTab === 'active_review' && 'Simulated: a human counsellor reviews AI summaries before any action.'}
            </span>
          </div>
          <span className="hidden md:inline-block text-[0.7rem] text-forest-300">
            AES-256 encrypted
          </span>
        </div>

        {/* Nodes */}
        <div className="space-y-3 mt-4 min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {NODES_DATA[activeTab].map((node) => (
                <div
                  key={node.id}
                  className="group relative rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-forest-400/30 p-4 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 shrink-0 rounded-lg border px-2 py-1 text-[0.72rem] font-semibold uppercase tracking-wide ${riskStyle[node.riskLevel]}`}>
                        {node.riskLevel}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">{node.studentId}</span>
                          <span className="text-xs text-white/40 font-mono">[{node.platform}]</span>
                        </div>
                        <p className="text-xs text-white/70 mt-1">
                          &quot;{node.flaggedPhraseSnippet}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:border-t-0 pt-2 sm:pt-0 sm:flex-col sm:items-end">
                      <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.68rem] font-medium border-white/15 text-white/70">
                        {node.consentStatus === 'Consented' ? 'Consented' : 'Consent pending'}
                      </span>
                      <span className="text-[0.7rem] text-white/40">{node.timestamp}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[0.72rem] text-white/50">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-forest-300" />
                      <span>{node.counsellorNote}</span>
                    </div>
                    <span className="text-forest-300 font-medium shrink-0">
                      <Link href="/security">Audit trail →</Link>
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-forest-300" />
              Human-in-the-loop active
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-300" />
              Zero automated decisions
            </span>
          </div>
          <span className="text-[0.7rem] text-white/40">
            Illustrative mock-up — not real student data
          </span>
        </div>
      </div>
    </div>
  )
}
