import type { Metadata } from 'next'
import { PageHero } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Terms of service — MindGuard',
  description: 'Terms of service for the MindGuard student wellbeing monitoring platform.',
}

const SECTIONS = [
  {
    title: '1. Overview',
    body: 'MindGuard is a consent-first, human-in-the-loop decision-support service for schools and universities. These terms govern use of the MindGuard product, website and related services. By signing up, institutions agree to these terms and to comply with all applicable laws, including student-privacy obligations.',
  },
  {
    title: '2. Accounts and access',
    body: 'Accounts are provisioned by the institution for named staff (admins and counsellors). Credentials are confidential and must not be shared. Access may be suspended for misuse, and role-based permissions determine what each account can do.',
  },
  {
    title: '3. Consent workflow',
    body: 'No student content is analysed until consent has been given — by the student if adult, or by a parent or guardian if minor. Institutions are responsible for the accuracy of roster data and for maintaining required consents. Consent may be withdrawn at any time; withdrawal stops analysis immediately.',
  },
  {
    title: '4. Acceptable use',
    body: 'Institutions must not use MindGuard to surveil students, to make automated decisions affecting students, or for any purpose other than counsellor-reviewed wellbeing support. Analysis is limited to content a student has explicitly shared.',
  },
  {
    title: '5. Data and privacy',
    body: 'Student PII is encrypted at rest and access is limited to authorised staff. Analysed content is not stored between sessions. Our Data Processing Agreement and Privacy Policy apply. Data is never sold or shared outside the institution without permission.',
  },
  {
    title: '6. Not medical advice',
    body: 'MindGuard is clinical decision support, not a diagnostic tool, and does not replace clinical judgment or emergency services. It is not a crisis line. In an emergency, contact local emergency services immediately.',
  },
  {
    title: '7. Intellectual property',
    body: 'The institution retains rights to its data. MindGuard retains rights to the service, software, model and any marks. The institution may export its roster and consent records at any time.',
  },
  {
    title: '8. Fees and renewals',
    body: 'Fees are as agreed in the applicable order or plan. Pilots are free for the stated period. Plans renew on the agreed cadence unless cancelled in writing before renewal.',
  },
  {
    title: '9. Service and availability',
    body: 'We aim for high availability and provide health monitoring. We will notify institutions of planned maintenance and of material service incidents. Service levels may be documented separately for paid plans.',
  },
  {
    title: '10. Limitation of liability',
    body: 'To the maximum extent permitted by law, MindGuard&apos;s aggregate liability is limited to the amounts paid in the twelve months preceding a claim. Nothing in these terms limits liability that cannot be limited by law.',
  },
  {
    title: '11. Termination',
    body: 'Either party may terminate as agreed in the subscription. On termination, the institution may export its data, and MindGuard will delete or return personal data on written request in line with the DPA.',
  },
  {
    title: '12. Changes to these terms',
    body: 'We may update these terms from time to time. Material changes will be communicated in advance. Continued use after the effective date constitutes acceptance.',
  },
  {
    title: '13. Contact',
    body: 'Questions about these terms can be directed to hello@mindguard.ai. This version is a template intended to be reviewed with legal counsel before signing.',
  },
]

export default function TermsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="Terms of service"
        subtitle="The terms that govern use of the MindGuard service."
      />
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 flex flex-col gap-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-bold text-ink mb-2">{s.title}</h2>
              <p className="text-sm text-slate leading-relaxed">{s.body}</p>
            </div>
          ))}
          <p className="text-xs text-slate/70 mt-6">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>
    </div>
  )
}
