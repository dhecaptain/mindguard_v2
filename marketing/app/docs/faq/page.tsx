import type { Metadata } from 'next'
import Faq from '@/components/Faq'

export const metadata: Metadata = {
  title: 'FAQ — MindGuard',
  description: 'Frequently asked questions about MindGuard consent, data, analysis and compliance.',
}

const FAQS = [
  {
    q: 'What does "consent-first" actually mean?',
    a: 'No student content is analysed until consent has been given — by the student if they are an adult, or by a parent or guardian if they are a minor. Consent is recorded with a timestamp, can be revoked with one click, and revocation stops analysis immediately.',
  },
  {
    q: 'Who gets the consent request?',
    a: 'Adults receive their own consent request. Minors are routed to a parent or guardian, who receives the parental request; the minor also gets an informational courtesy copy. A minor without a parent email on the roster is rejected at upload.',
  },
  {
    q: 'How long does a consent link stay valid?',
    a: 'Consent requests are valid for 30 days. Reminders are sent automatically at day 3 and day 7, and pending requests expire at day 30. Each link is signed and single-use.',
  },
  {
    q: 'Can consent be withdrawn?',
    a: 'Yes. Every consent email includes a permanent "Withdraw consent" link. Withdrawal is one click, requires no login, takes effect immediately, and cancels future analyses. Past analyses are marked as consent withdrawn — they are never silently deleted.',
  },
  {
    q: 'What data does MindGuard hold?',
    a: 'Roster information (name, email, date of birth), consent records, and analysis events. Student PII is encrypted at rest, analysed content is not stored between sessions, and data is never sold or shared outside your institution.',
  },
  {
    q: 'Does MindGuard diagnose or automate decisions?',
    a: 'No. MindGuard is clinical decision support. It surfaces signals for a trained counsellor to review and acts as a structured starting point for follow-up. Every output requires a qualified human reviewer.',
  },
  {
    q: 'Which platforms are supported?',
    a: 'Reddit, Bluesky, Mastodon, YouTube, TikTok, Twitter/X, Facebook (public content), plus file uploads including WhatsApp exports and CSV/JSON archives.',
  },
  {
    q: 'How does MindGuard handle crisis situations?',
    a: 'High-risk signals surface with built-in crisis-resource lookups by country and US state, so a counsellor can act immediately. MindGuard is not a crisis line and does not replace emergency services.',
  },
  {
    q: 'Is MindGuard FERPA and COPPA compliant?',
    a: 'MindGuard is built for these frameworks: student records are treated as education records, minors are routed through parental consent, and the age-of-majority threshold is configurable per institution. A Data Processing Agreement is available on request.',
  },
]

export default function DocsFaqPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Frequently asked questions</h1>
      <Faq items={FAQS} />
    </div>
  )
}
