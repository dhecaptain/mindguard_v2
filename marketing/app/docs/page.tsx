import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/motion'

export const metadata: Metadata = {
  title: 'Getting started — MindGuard',
  description: 'Get started with MindGuard: set up your institution, upload your roster, and send consent requests.',
}

export default function DocsHomePage() {
  return (
    <div className="flex flex-col gap-6 text-sm leading-relaxed text-ink-soft">
      <Reveal>
        <h1 className="text-3xl font-bold text-ink">Getting started</h1>
      </Reveal>
      <Reveal delay={0.05}>
        <p>
          MindGuard is a consent-first decision-support tool for counsellors. This guide walks
          an administrator from sign-in to sending their first consent requests.
        </p>
      </Reveal>

      <div className="flex flex-col gap-6">
        {[
          {
            n: '1',
            title: 'Sign in and set up your institution',
            body: (
              <>
                Sign in with your institutional account. Admins manage institutions from the Admin
                area, including the minor age threshold (default 18) used to route consent between
                students and parents.
              </>
            ),
          },
          {
            n: '2',
            title: 'Upload your student roster',
            body: (
              <>
                Open <strong className="text-ink">Consent Tracker</strong> and upload a CSV of your
                students. MindGuard validates the file, computes adult vs. minor status, and shows a
                preview with totals, minors, adults and any errors. See the{' '}
                <Link href="/docs/roster-csv" className="text-forest font-semibold hover:underline">
                  roster CSV format
                </Link>{' '}
                for the required columns.
              </>
            ),
          },
          {
            n: '3',
            title: 'Send consent requests',
            body: (
              <>
                With one action you dispatch signed, single-use consent emails: adults receive their
                own request, minors&apos; parents receive a parental request (with an informational
                courtesy copy to the minor). Reminders are sent automatically at day 3 and day 7, and
                requests expire at day 30.
              </>
            ),
          },
          {
            n: '4',
            title: 'Track responses',
            body: (
              <>
                The Consent Tracker shows every request with its status — pending, accepted, declined,
                expired, revoked, invalid. Filters, search, bulk resend/cancel and CSV export are
                built in, and each row opens a detail drawer with the full audit trail.
              </>
            ),
          },
          {
            n: '5',
            title: 'Analyse consented students',
            body: (
              <>
                Counsellors can only run analyses on students whose consent is accepted and not
                expired. Every output is a summary for human review — MindGuard supports counsellors,
                it does not replace them.
              </>
            ),
          },
        ].map((s) => (
          <Reveal key={s.n}>
            <div className="flex gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white">
                {s.n}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-ink">{s.title}</h2>
                <p className="mt-1">{s.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-4 rounded-2xl bg-forest-50 border border-forest-100 p-6">
          <h2 className="font-semibold text-ink mb-2">Next steps</h2>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/docs/roster-csv" className="text-forest font-semibold hover:underline">
                Read the roster CSV format →
              </Link>
            </li>
            <li>
              <Link href="/docs/faq" className="text-forest font-semibold hover:underline">
                Browse the FAQ →
              </Link>
            </li>
            <li>
              <Link href="/request-demo" className="text-forest font-semibold hover:underline">
                Request a guided demo →
              </Link>
            </li>
          </ul>
        </div>
      </Reveal>
    </div>
  )
}
