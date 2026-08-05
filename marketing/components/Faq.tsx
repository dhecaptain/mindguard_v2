'use client'

import { useState } from 'react'

export interface FaqItem {
  q: string
  a: string
}

export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="divide-y divide-[#eef2f6] rounded-2xl border border-[#eef2f6] bg-white">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-ink">{item.q}</span>
              <span
                className={`text-teal-600 transition-transform ${isOpen ? 'rotate-45' : ''}`}
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm text-slate leading-relaxed">{item.a}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
