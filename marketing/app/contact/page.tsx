import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — MindGuard',
  description: 'Get in touch with the MindGuard team.',
}

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-ink mb-4">Contact us</h1>
        <p className="text-slate mb-10">
          Questions about MindGuard, consent workflows, or partnering with us? We&apos;d
          love to hear from you.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white border border-[#eef2f6] rounded-2xl p-6">
            <div className="text-xl mb-3">📧</div>
            <h2 className="font-bold text-ink mb-1">General</h2>
            <p className="text-sm text-slate">hello@mindguard.ai</p>
          </div>
          <div className="bg-white border border-[#eef2f6] rounded-2xl p-6">
            <div className="text-xl mb-3">🔒</div>
            <h2 className="font-bold text-ink mb-1">Privacy</h2>
            <p className="text-sm text-slate">privacy@mindguard.ai</p>
          </div>
        </div>
      </div>
    </div>
  )
}
