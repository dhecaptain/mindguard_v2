'use client'

import React from 'react'
import { ShieldCheck, Lock, GraduationCap, Award, Scale, HeartHandshake } from 'lucide-react'

const BADGES = [
  { label: 'FERPA-conscious', icon: ShieldCheck },
  { label: 'COPPA-aware', icon: Lock },
  { label: 'Consent-first', icon: Scale },
  { label: 'Human-in-the-loop', icon: HeartHandshake },
  { label: 'GVSU Innovation Day', icon: Award },
  { label: 'Grand Rapids DeepTech', icon: GraduationCap },
]

export function TrustMarquee() {
  return (
    <section className="border-y border-[rgba(23,33,29,0.08)] bg-white">
      <div className="mg-section py-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-soft mb-5">
          Built for institutions that take wellbeing seriously
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {BADGES.map((b) => {
            const Icon = b.icon
            return (
              <span key={b.label} className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft">
                <Icon className="h-4 w-4 text-forest-500" />
                {b.label}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
