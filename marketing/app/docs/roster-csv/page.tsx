import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Roster CSV format — MindGuard',
  description:
    'The required columns and validation rules for MindGuard student roster uploads.',
}

const COLUMNS = [
  { col: 'student_id', required: 'Yes', notes: "School's internal identifier. Hashed before storage." },
  { col: 'student_first_name', required: 'Yes', notes: 'Used in email personalisation only.' },
  { col: 'student_email', required: 'Yes', notes: 'Where the student receives their consent request.' },
  { col: 'date_of_birth', required: 'Yes', notes: 'Used to compute age at time of upload.' },
  { col: 'parent_first_name', required: 'If minor', notes: 'Personalisation in the parent email.' },
  { col: 'parent_email', required: 'If minor', notes: 'Required if age < 18; optional otherwise.' },
  { col: 'grade_level', required: 'No', notes: 'e.g. Grade 9, Freshman.' },
  { col: 'notes', required: 'No', notes: 'Free text visible to admins only.' },
]

const RULES = [
  'The file is rejected if any required column is missing — the specific columns are listed.',
  'Each row is validated and errors are reported with row numbers and reasons.',
  'The whole file is rejected if more than 10% of rows fail — the CSV is assumed to be wrong, not the data.',
  'Rows are deduplicated on student_email within the file and against existing records.',
  'A minor without a parent email is rejected at validation — consent cannot proceed without a parent route.',
  'If date of birth is missing and there is no explicit minor/adult override, the row is rejected. MindGuard never guesses.',
]

export default function DocsRosterCsvPage() {
  return (
    <div className="flex flex-col gap-6 text-sm leading-relaxed text-slate">
      <h1 className="text-3xl font-bold text-ink">Roster CSV format</h1>
      <p>
        The roster upload accepts a UTF-8 CSV with one student per row. Extra columns are
        silently ignored — only the whitelisted columns below are read.
      </p>

      <h2 className="text-lg font-bold text-ink mt-2">Required columns</h2>
      <div className="overflow-x-auto rounded-xl border border-[#eef2f6]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eef2f6] text-left bg-[#f7f9fb]">
              <th className="px-4 py-3 font-semibold text-ink">Column</th>
              <th className="px-4 py-3 font-semibold text-ink">Required</th>
              <th className="px-4 py-3 font-semibold text-ink">Notes</th>
            </tr>
          </thead>
          <tbody>
            {COLUMNS.map((c) => (
              <tr key={c.col} className="border-b border-[#eef2f6] last:border-0 align-top">
                <td className="px-4 py-3 font-mono text-xs text-teal-700 whitespace-nowrap">{c.col}</td>
                <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">{c.required}</td>
                <td className="px-4 py-3">{c.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-bold text-ink mt-2">Example</h2>
      <pre className="overflow-x-auto rounded-xl bg-[#0f172a] text-teal-50 p-5 text-xs leading-relaxed">
{`student_id,student_first_name,student_email,date_of_birth,parent_first_name,parent_email,grade_level,notes
S-1001,Aisha,aisha@example.edu,2010-03-14,Fatima,fatima@example.com,Grade 9,
S-1002,Ben,ben@example.edu,2005-11-02,,,Grade 12,Transfer student
S-1003,Chen,chen@example.edu,2009-07-22,Wei,wei@example.com,Grade 8,`}
      </pre>

      <h2 className="text-lg font-bold text-ink mt-2">Validation rules</h2>
      <ul className="flex flex-col gap-3">
        {RULES.map((r) => (
          <li key={r} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6.5 4.5 9 10 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>{r}</span>
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-bold text-ink mt-2">Minor detection</h2>
      <p>
        Two signals feed one decision. An explicit minor/adult override on the roster wins.
        Otherwise age is computed from date of birth at time of upload against the
        institution&apos;s age-of-majority threshold (default 18). Missing DOB with no override
        is rejected — MindGuard never guesses.
      </p>
      <p>
        <Link href="/docs" className="text-teal-700 font-semibold hover:underline">
          ← Back to getting started
        </Link>
      </p>
    </div>
  )
}
