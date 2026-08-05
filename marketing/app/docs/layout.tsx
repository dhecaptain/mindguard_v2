import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation — MindGuard',
  description:
    'MindGuard documentation for administrators, counsellors, IT and researchers.',
}

const DOCS_LINKS = [
  { href: '/docs', label: 'Getting started' },
  { href: '/docs/roster-csv', label: 'Roster CSV format' },
  { href: '/docs/faq', label: 'FAQ' },
]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-10">
        <aside className="md:w-56 shrink-0">
          <nav className="flex flex-col gap-1">
            <h2 className="text-xs font-bold text-ink uppercase tracking-wide mb-3">Documentation</h2>
            {DOCS_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate hover:text-teal-700 hover:bg-teal-50"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <article className="flex-1 min-w-0 max-w-3xl">{children}</article>
      </div>
    </div>
  )
}
