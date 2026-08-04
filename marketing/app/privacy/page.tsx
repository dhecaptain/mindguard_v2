import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy policy — MindGuard',
  description: 'MindGuard privacy policy.',
}

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-ink mb-8">Privacy policy</h1>
        <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate flex flex-col gap-5">
          <p>
            MindGuard is a student-wellbeing monitoring platform for schools and
            universities. This policy explains how we handle personal data, with a focus
            on the special protections we apply to student data.
          </p>
          <h2 className="text-lg font-bold text-ink mt-4">Consent before analysis</h2>
          <p>
            No student content is analysed until consent has been given — by the student
            if they are an adult, or by a parent or guardian if they are a minor. Consent
            is recorded, time-stamped and can be revoked at any time. Revoking consent
            stops analysis immediately.
          </p>
          <h2 className="text-lg font-bold text-ink mt-4">Data we hold</h2>
          <p>
            We hold roster information (name, email, date of birth), consent records, and
            analysis events. Student PII is encrypted at rest, and access is limited to
            the counsellors and admins your institution authorises.
          </p>
          <h2 className="text-lg font-bold text-ink mt-4">Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your data at any
            time by contacting us at the address below.
          </p>
          <h2 className="text-lg font-bold text-ink mt-4">Contact</h2>
          <p>Email: privacy@mindguard.ai</p>
          <p className="text-xs text-slate/70">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  )
}
