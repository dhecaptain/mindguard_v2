import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Getting started — MindGuard',
  description: 'Get started with MindGuard: set up your institution, upload your roster, and send consent requests.',
}

export default function DocsHomePage() {
  return (
    <div className="flex flex-col gap-6 text-sm leading-relaxed text-slate">
      <h1 className="text-3xl font-bold text-ink">Getting started</h1>
      <p>
        MindGuard is a consent-first decision-support tool for counsellors. This guide walks
        an administrator from sign-in to sending their first consent requests.
      </p>

      <h2 className="text-lg font-bold text-ink mt-2">1. Sign in and set up your institution</h2>
      <p>
        Sign in with your institutional account. Admins manage institutions from the Admin
        area, including the minor age threshold (default 18) used to route consent between
        students and parents.
      </p>

      <h2 className="text-lg font-bold text-ink mt-2">2. Upload your student roster</h2>
      <p>
        Open <strong>Consent Tracker</strong> and upload a CSV of your students. MindGuard
        validates the file, computes adult vs. minor status, and shows a preview with totals,
        minors, adults and any errors. See the{' '}
        <Link href="/docs/roster-csv" className="text-teal-700 font-semibold hover:underline">
          roster CSV format
        </Link>{' '}
        for the required columns.
      </p>

      <h2 className="text-lg font-bold text-ink mt-2">3. Send consent requests</h2>
      <p>
        With one action you dispatch signed, single-use consent emails: adults receive their
        own request, minors&apos; parents receive a parental request (with an informational
        courtesy copy to the minor). Reminders are sent automatically at day 3 and day 7, and
        requests expire at day 30.
      </p>

      <h2 className="text-lg font-bold text-ink mt-2">4. Track responses</h2>
      <p>
        The Consent Tracker shows every request with its status — pending, accepted, declined,
        expired, revoked, invalid. Filters, search, bulk resend/cancel and CSV export are
        built in, and each row opens a detail drawer with the full audit trail.
      </p>

      <h2 className="text-lg font-bold text-ink mt-2">5. Analyse consented students</h2>
      <p>
        Counsellors can only run analyses on students whose consent is accepted and not
        expired. Every output is a summary for human review — MindGuard supports counsellors,
        it does not replace them.
      </p>

      <div className="mt-4 rounded-xl bg-teal-50 border border-teal-200 p-6">
        <h2 className="font-bold text-ink mb-2">Next steps</h2>
        <ul className="flex flex-col gap-2">
          <li>
            <Link href="/docs/roster-csv" className="text-teal-700 font-semibold hover:underline">
              Read the roster CSV format →
            </Link>
          </li>
          <li>
            <Link href="/docs/faq" className="text-teal-700 font-semibold hover:underline">
              Browse the FAQ →
            </Link>
          </li>
          <li>
            <Link href="/demo" className="text-teal-700 font-semibold hover:underline">
              Request a guided demo →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
