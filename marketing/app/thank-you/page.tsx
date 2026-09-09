import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Thank you — MindGuard',
  description: 'Your demo request has been received. Here is what happens next.',
}

const STEPS = [
  {
    title: '1. We review your request',
    text: 'A member of our team reads your request within 2 business days. Consented outreach only — no spam, ever.',
  },
  {
    title: '2. We set up a tailored walkthrough',
    text: 'We show you the consent workflow, the tracking dashboard and multi-platform monitoring — with your school or organisation in mind.',
  },
  {
    title: '3. You decide what fits',
    text: 'There is no commitment. You leave the call knowing exactly what MindGuard could do for your team.',
  },
]

export default function ThankYouPage() {
  return (
    <div className="py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center mx-auto mb-6 text-3xl text-forest">
          ✓
        </div>
        <h1 className="display text-4xl text-ink mb-3">Thank you — request received</h1>
        <p className="text-ink-soft mb-10 max-w-lg mx-auto">
          Our team will be in touch within <strong className="text-ink">2 business days</strong>.
          Keep an eye on your inbox (and check your spam folder just in case).
        </p>

        <div className="mg-card p-6 sm:p-8 text-left">
          <h2 className="text-lg font-semibold text-ink mb-6">What happens next</h2>
          <div className="flex flex-col gap-6">
            {STEPS.map((s) => (
              <div key={s.title} className="flex gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-forest-50 text-forest flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <div>
                  <div className="font-semibold text-ink text-sm">{s.title}</div>
                  <p className="text-sm text-ink-soft mt-1 leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/" className="px-6 py-3 mg-btn-primary">
            Back to home
          </Link>
          <a href="/privacy" className="px-6 py-3 mg-btn-secondary">
            Privacy policy
          </a>
        </div>
      </div>
    </div>
  )
}
