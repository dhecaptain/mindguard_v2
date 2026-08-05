import type { Metadata } from 'next'
import { PageHero, CtaButton } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Data Processing Agreement — MindGuard',
  description:
    'MindGuard Data Processing Agreement template — download and complete for your institution.',
}

const CLAUSES = [
  {
    title: '1. Parties',
    text: 'The Institution (the data controller) and the operator of the MindGuard service (the data processor), which processes personal data on the Institution\u2019s documented instructions.',
  },
  {
    title: '2. Subject matter and duration',
    text: 'The Processor provides the MindGuard decision-support service, processing student roster data, consent records and analysis events for the duration of the subscription term.',
  },
  {
    title: '3. Nature and purpose of processing',
    text: 'Processing is limited to identifying early signs of distress in consented digital content, recording and enforcing consent, and surfacing summaries for review by the Institution\u2019s trained counsellors. Analysis runs only on content for which consent is active.',
  },
  {
    title: '4. Categories of data subjects',
    text: 'Students (including minors, processed under parental or guardian consent), parents and guardians, and institution staff who administer or use the service.',
  },
  {
    title: '5. Consent and lawfulness',
    text: 'The Institution is responsible for obtaining all consents required by law, including parental consent for minors. The Processor provides the consent, reminder, expiry and revocation workflow and records every consent event in an immutable audit trail.',
  },
  {
    title: '6. Confidentiality and security',
    text: 'The Processor implements encryption at rest, least-privilege access, signed single-use consent tokens, rate limiting and append-only audit logging. Personnel who access personal data are bound by confidentiality obligations.',
  },
  {
    title: '7. Sub-processors',
    text: 'Sub-processors may be engaged for infrastructure and transactional email. The Processor maintains a sub-processor list and notifies the Institution of material changes.',
  },
  {
    title: '8. Data subject rights',
    text: 'The Processor assists the Institution in responding to access, rectification, erasure, restriction and portability requests, and notifies the Institution of any direct requests without undue delay.',
  },
  {
    title: '9. Security incident notification',
    text: 'The Processor notifies the Institution without undue delay of any personal-data breach, with the nature, affected categories and remediation steps.',
  },
  {
    title: '10. Data minimisation and retention',
    text: 'Only content a data subject explicitly shares is analysed, and analysed content is not stored between sessions. Roster and consent records are retained for the subscription term plus a transition period, and deleted on request or off-boarding.',
  },
  {
    title: '11. Deletion and return',
    text: 'On termination the Institution may export roster and consent records. On written request the Processor deletes or returns all personal data, unless retention is required by law.',
  },
  {
    title: '12. Audit',
    text: 'The Processor makes available, on reasonable request and subject to confidentiality, information necessary to demonstrate compliance with this Agreement.',
  },
  {
    title: '13. Governing law',
    text: 'Specified by the parties. The template includes signature blocks for both the Institution and the Processor.',
  },
]

export default function DpaPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="Data Processing Agreement"
        subtitle="A template DPA you can download, complete and sign for your institution."
      />

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="rounded-2xl bg-teal-600 text-white p-8 text-center mb-12">
            <h2 className="text-xl font-bold mb-3">Download the template</h2>
            <p className="text-teal-50 mb-6 text-sm">
              A fill-in-the-blanks DPA covering parties, processing, security, sub-processors,
              incident notification and deletion.
            </p>
            <a
              href="/dpa-template.pdf"
              download
              className="inline-block px-6 py-3 bg-white text-teal-700 rounded-xl font-semibold hover:bg-teal-50 transition-colors"
            >
              Download DPA template (PDF)
            </a>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-8">What the agreement covers</h2>
          <div className="flex flex-col gap-8">
            {CLAUSES.map((c) => (
              <div key={c.title}>
                <h3 className="font-bold text-ink mb-2">{c.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <CtaButton href="/demo">Request a signed DPA</CtaButton>
          </div>
        </div>
      </section>
    </div>
  )
}
