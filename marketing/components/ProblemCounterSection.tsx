'use client'

import React from 'react'
import { Reveal } from '@/components/motion'
import { AlertCircle, Users, EyeOff } from 'lucide-react'

const PROBLEM_ITEMS = [
  {
    stat: '720,000+',
    title: 'Lives lost globally each year',
    text: 'Around 720,000 people die by suicide annually worldwide. Research shows the majority exhibit observable distress indicators in written or digital content long before a crisis.',
    icon: AlertCircle,
  },
  {
    stat: '1 : 400',
    title: 'Counsellor-to-student ratio',
    text: 'A single school counsellor can be responsible for 400+ students. Proactively checking in with every student every week is mathematically impossible without decision support.',
    icon: Users,
  },
  {
    stat: '90%',
    title: 'Signals missed until it is too late',
    text: 'An estimated 90% of youth experiencing crisis show warning signs. But a signal no one has the capacity to see in time is not a signal — it is a missed opportunity.',
    icon: EyeOff,
  },
]

export function ProblemCounterSection() {
  return (
    <section className="relative py-20 sm:py-28 bg-mist">
      <div className="mg-section">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="mg-eyebrow mb-4">The problem</p>
            <h2 className="display text-3xl sm:text-4xl text-ink">
              Students don&apos;t always ask for help.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-ink-soft leading-relaxed max-w-2xl mx-auto">
              Distress can be difficult to recognise — and by the time it reaches a waiting room,
              the school is already reacting. MindGuard helps institutions notice meaningful signals
              earlier.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
          {PROBLEM_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.stat} className="mg-card mg-card-hover p-8 text-left">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="display text-4xl text-forest">{item.stat}</div>
                <h3 className="mt-3 text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2.5 text-sm text-ink-soft leading-relaxed">{item.text}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-2 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-forest-400" />
            WHO — Global suicide estimates:{" "}
            <a href="https://www.who.int/news-room/fact-sheets/detail/suicide" target="_blank" rel="noopener noreferrer" className="text-forest-600 underline underline-offset-2">
              who.int
            </a>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-forest-400" />
            ASCA — School counsellor ratios:{" "}
            <a href="https://www.schoolcounselor.org/About-School-Counseling/Student-to-School-Counselor-Ratios" target="_blank" rel="noopener noreferrer" className="text-forest-600 underline underline-offset-2">
              schoolcounselor.org
            </a>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-forest-400" />
            AFSP — Warning signs:{" "}
            <a href="https://afsp.org" target="_blank" rel="noopener noreferrer" className="text-forest-600 underline underline-offset-2">
              afsp.org
            </a>
          </span>
        </div>
      </div>
    </section>
  )
}
