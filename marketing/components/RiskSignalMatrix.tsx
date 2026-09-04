'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Clock, UserCheck, AlertTriangle, Activity, Brain, Eye, Lock } from 'lucide-react'

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
      flaggedPhraseSnippet: 'Parent consent request dispatched via SMS & Email',
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

export function RiskSignalMatrix() {
  const [activeTab, setActiveTab] = useState<StateTab>('consented')

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8">
      {/* Ambient background glow behind widget */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-emerald-600/30 rounded-3xl blur-2xl opacity-75 animate-pulse-glow" />

      {/* Main Glass Panel */}
      <div className="relative rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-xl p-5 sm:p-7 shadow-2xl shadow-emerald-950/60 overflow-hidden text-left">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Brain className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  Risk Signal Detection Matrix
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold tracking-wider uppercase">
                  Live Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mental-RoBERTa (ROC-AUC 0.98) • FERPA / COPPA Audit Active
              </p>
            </div>
          </div>

          {/* Interactive State Toggle Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Consent Pending</span>
            </button>

            <button
              onClick={() => setActiveTab('consented')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'consented'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Consented</span>
            </button>

            <button
              onClick={() => setActiveTab('active_review')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'active_review'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Human Review</span>
            </button>
          </div>
        </div>

        {/* Dynamic State Info Banner */}
        <div className="my-4 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {activeTab === 'pending' && 'Strict Privacy Shield: Content analysis is strictly blocked until parent/student signs.'}
              {activeTab === 'consented' && 'Active Monitoring: Analysing opted-in digital content for early distress signals.'}
              {activeTab === 'active_review' && 'Counsellor Command: Human decision-maker reviewing AI summaries for direct intervention.'}
            </span>
          </div>
          <span className="hidden md:inline-block font-mono text-[11px] text-emerald-400/80">
            256-Bit Encrypted
          </span>
        </div>

        {/* Live Nodes Matrix List */}
        <div className="space-y-3 mt-4 min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {NODES_DATA[activeTab].map((node) => (
                <div
                  key={node.id}
                  className="group relative rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 p-4 transition-all duration-300 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Student & Status Info */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-bold text-xs ${
                          node.riskLevel === 'Critical'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : node.riskLevel === 'High'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : node.riskLevel === 'Moderate'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}
                      >
                        {node.riskLevel[0]}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">
                            {node.studentId}
                          </span>
                          
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                              node.consentStatus === 'Consented'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : node.consentStatus === 'Pending'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-slate-700 text-slate-300 border-slate-600'
                            }`}
                          >
                            {node.consentStatus === 'Consented' ? 'Consented' : 'Parent Consent Pending'}

                          </span>

                          <span className="text-xs text-slate-400 font-mono">
                            [{node.platform}]
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-1 font-mono">
                          &quot;{node.flaggedPhraseSnippet}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Risk Badge & Confidence */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/40">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-mono font-bold text-white">
                          ROC-AUC {node.confidence}%
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        {node.timestamp}
                      </span>
                    </div>

                  </div>

                  {/* Counsellor Summary Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{node.counsellorNote}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold cursor-pointer group-hover:underline flex items-center gap-1">
                      View Audit Log &rarr;
                    </span>
                  </div>

                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Matrix Bottom Status Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Human-in-the-Loop Active
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Zero Automated Decisions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
              Interactive Preview Mode
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
