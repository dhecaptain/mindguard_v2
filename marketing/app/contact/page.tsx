import type { Metadata } from 'next'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { Icons } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Contact — MindGuard',
  description: 'Get in touch with the MindGuard team.',
}

export default function ContactPage() {
  return (
    <div className="py-24">
      <div className="mg-section max-w-2xl">
        <Reveal>
          <span className="mg-eyebrow mb-4 inline-block">Contact</span>
          <h1 className="display text-4xl text-ink mb-4">Contact us</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-ink-soft text-lg mb-10">
            Questions about MindGuard, consent workflows, or partnering with us? We&apos;d
            love to hear from you.
          </p>
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 gap-6">
          <StaggerItem>
            <div className="mg-card mg-card-hover p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 7 9-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-semibold text-ink mb-1">General</h2>
              <a href="mailto:hello@mindguard.ai" className="text-sm text-ink-soft underline decoration-ink-soft/40 underline-offset-2 hover:text-forest hover:decoration-forest transition-colors">
                hello@mindguard.ai
              </a>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="mg-card mg-card-hover p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest">
                <Icons.Lock />
              </div>
              <h2 className="font-semibold text-ink mb-1">Privacy</h2>
              <a href="mailto:privacy@mindguard.ai" className="text-sm text-ink-soft underline decoration-ink-soft/40 underline-offset-2 hover:text-forest hover:decoration-forest transition-colors">
                privacy@mindguard.ai
              </a>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </div>
  )
}
