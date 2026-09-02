import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindGuard — Consent-first student wellbeing monitoring',
  description:
    'MindGuard helps school and university counselling teams identify early signs of distress in consented digital content. Powered by Mental-RoBERTa, reviewed by humans, built for trust.',
  metadataBase: new URL('https://mindguard.ai'),
  openGraph: {
    title: 'MindGuard — Consent-first student wellbeing monitoring',
    description:
      'Catch the signals of distress — before a crisis. Consent-first AI decision support for school and university counsellors.',
    type: 'website',
  },
}



const FOOTER_COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { href: '/product', label: 'Product' },
      { href: '/for-schools', label: 'For schools' },
      { href: '/for-universities', label: 'For universities' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/security', label: 'Security' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/docs', label: 'Documentation' },
      { href: '/docs/roster-csv', label: 'Roster CSV format' },
      { href: '/docs/faq', label: 'FAQ' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
      { href: '/dpa', label: 'Data Processing Agreement' },
    ],
  },
]

// Privacy-first analytics (Remediation P2-3): Plausible script is injected only
// when the site domain is configured via NEXT_PUBLIC_PLAUSIBLE_DOMAIN. No
// cookies, no fingerprinting — keeps the marketing site's consent story honest.
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}
      <body className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">{children}</main>

        <footer className="border-t border-[#eef2f6] bg-[#f7f9fb]">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
                    M
                  </span>
                  <span className="text-lg font-bold text-ink">MindGuard</span>
                </div>
                <p className="text-xs text-slate leading-relaxed max-w-xs">
                  Consent-first AI decision support for school and university counsellors.
                  Powered by Mental-RoBERTa, reviewed by humans, built for trust.
                </p>
              </div>
              {FOOTER_COLS.map((col) => (
                <div key={col.title}>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wide mb-4">
                    {col.title}
                  </h3>
                  <ul className="flex flex-col gap-3 text-sm text-slate">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="hover:text-teal-700">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-6 border-t border-[#eef2f6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate">
              <div>&copy; {new Date().getFullYear()} MindGuard. Student wellbeing, consented.</div>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-teal-700">Privacy</Link>
                <Link href="/terms" className="hover:text-teal-700">Terms</Link>
                <Link href="/dpa" className="hover:text-teal-700">DPA</Link>
                <Link href="/contact" className="hover:text-teal-700">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
