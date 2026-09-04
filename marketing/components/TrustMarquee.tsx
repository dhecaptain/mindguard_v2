'use client'

import React from 'react'
import { ShieldCheck, Award, Lock, CheckCircle2, Building2, Cpu } from 'lucide-react'

const BADGES = [
  { label: 'HIPAA-aligned', desc: 'Protected Health Information Standards', icon: ShieldCheck, accent: 'emerald' },
  { label: 'FERPA-compliant', desc: 'Educational Records Privacy Certified', icon: Lock, accent: 'teal' },
  { label: 'COPPA-ready', desc: 'Parental Consent Workflow for Minors', icon: CheckCircle2, accent: 'emerald' },
  { label: 'GVSU Partner', desc: 'Grand Valley State University', icon: Building2, accent: 'cyan' },
  { label: 'DeepTech Winner', desc: 'Grand Rapids Innovation Award', icon: Award, accent: 'amber' },
  { label: 'Hugging Face ML', desc: 'Mental-RoBERTa Model Host', icon: Cpu, accent: 'teal' },

  { label: 'Zero Retention', desc: 'Analysed Content Purged Post-Session', icon: ShieldCheck, accent: 'emerald' },
  { label: '256-Bit Encrypted', desc: 'End-to-End TLS & AES Security', icon: Lock, accent: 'cyan' },
]

export function TrustMarquee() {
  return (
    <section className="relative py-8 bg-slate-900 border-y border-emerald-500/20 overflow-hidden shadow-inner">
      {/* Side Fade Gradients */}
      <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee space-x-6 hover:[animation-play-state:paused]">
        {/* Double list for seamless loop */}
        {[...BADGES, ...BADGES].map((badge, idx) => {
          const Icon = badge.icon
          return (
            <div
              key={`${badge.label}-${idx}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-200 group cursor-default shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                    {badge.label}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300">
                  {badge.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
