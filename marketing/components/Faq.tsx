'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FaqItem = { q: string; a: string }

type FaqProps = {
  title?: string
  subtitle?: string
  items: FaqItem[]
}

export function Faq({ title = 'Frequently asked questions', subtitle, items }: FaqProps) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center mb-10">
        <span className="mg-eyebrow mb-3 inline-block">FAQ</span>
        <h2 className="display text-3xl sm:text-4xl text-ink">{title}</h2>
        {subtitle && <p className="mt-3 text-base text-ink-soft">{subtitle}</p>}
      </div>

      <div className="divide-y divide-[rgba(23,33,29,0.08)] rounded-2xl border border-[rgba(23,33,29,0.08)] bg-white overflow-hidden">
        {items.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors cursor-pointer ${
                  isOpen ? 'bg-forest-50/40' : 'bg-white hover:bg-mist/60'
                }`}
                aria-expanded={isOpen}
              >
                <span className="text-base font-medium text-ink">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-forest transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">{item.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
