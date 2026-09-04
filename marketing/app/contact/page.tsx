import type { Metadata } from 'next'
import { Reveal, Stagger, StaggerItem, HoverLift, FloatingOrb } from '@/components/motion'
import { Icons } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Contact — MindGuard',
  description: 'Get in touch with the MindGuard team.',
}

function MailIcon() {
  return (
    <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 mb-4">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 7 9-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function ContactPage() {
  return (
    <div className="py-16 relative overflow-hidden">
      <FloatingOrb className="bg-teal-100/30 -top-10 -right-10" size={350} duration={18} />
      <FloatingOrb className="bg-sky-100/20 top-20 -left-16" size={300} duration={16} />
      <div className="relative max-w-2xl mx-auto px-6">
        <Reveal>
          <h1 className="text-3xl font-bold text-ink mb-4">Contact us</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-slate mb-10">
            Questions about MindGuard, consent workflows, or partnering with us? We&apos;d
            love to hear from you.
          </p>
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 gap-6">
          <StaggerItem>
            <HoverLift>
              <div className="bg-white border border-[#eef2f6] rounded-2xl p-6">
                <MailIcon />
                <h2 className="font-bold text-ink mb-1">General</h2>
                <p className="text-sm text-slate">hello@mindguard.ai</p>
              </div>
            </HoverLift>
          </StaggerItem>
          <StaggerItem>
            <HoverLift>
              <div className="bg-white border border-[#eef2f6] rounded-2xl p-6">
                <Icons.Lock />
                <h2 className="font-bold text-ink mb-1">Privacy</h2>
                <p className="text-sm text-slate">privacy@mindguard.ai</p>
              </div>
            </HoverLift>
          </StaggerItem>
        </Stagger>
      </div>
    </div>
  )
}
