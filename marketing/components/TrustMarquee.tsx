'use client'

import React from 'react'
import { ShieldCheck, Award, Lock, CheckCircle2, Building2, Cpu } from 'lucide-react'

const BADGES = [
  { label: 'HIPAA-aligned', desc: 'Design aligned with health data norms', icon: ShieldCheck, accent: 'emerald' },
  { label: 'FERPA-conscious', desc: 'Educational Records Privacy Design', icon: Lock, accent: 'teal' },
  { label: 'COPPA-aware', desc: 'Parental Consent Workflow for Minors', icon: CheckCircle2, accent: 'emerald' },
  { label: 'GVSU Innovation Day', desc: 'Recognised at Grand Valley State University', icon: Building2, accent: 'cyan' },
  { label: 'Grand Rapids DeepTech', desc: 'Top-tier Midwest AI accelerator', icon: Award, accent: 'amber' },
  { label: 'Hugging Face ML', desc: 'Mental-RoBERTa Model Host', icon: Cpu, accent: 'teal' },

  { label: 'Data Minimised', desc: 'Only consented content processed', icon: ShieldCheck, accent: 'emerald' },
  { label: '256-Bit Encrypted', desc: 'TLS 1.3 in transit · AES-256 at rest', icon: Lock, accent: 'cyan' },
]

export function TrustMarquee() {
  return (
    <section className="relative py-8 bg-[#0a0d14] border-y border-white/[0.06] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14] via-transparent to-[#0a0d14] pointer-events-none z-0" />
      <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0a0d14] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0a0d14] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee space-x-6 hover:[animation-play-state:paused]">
        {/* Double list for seamless loop */}
        {[...BADGES, ...BADGES].map((badge, idx) => {
          const Icon = badge.icon
          return (
            <div
              key={`${badge.label}-${idx}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.06] transition-all duration-200 group cursor-default"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-emerald-400 group-hover:scale-110 transition-transform">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white/90 tracking-wide group-hover:text-white transition-colors">
                    {badge.label}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-emerald-500/60" />
                </div>
                <p className="text-[10px] text-white/40 group-hover:text-white/60">
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
