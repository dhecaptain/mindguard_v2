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

        <footer className="relative bg-[#0B1D17] bg-grid-pattern text-slate-300 border-t border-emerald-500/20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-extrabold shadow-md shadow-emerald-500/20 border border-emerald-400/30">
                    M
                  </span>
                  <span className="text-xl font-extrabold text-white tracking-tight">MindGuard</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Consent-first AI decision support for school and university counsellors.
                  Powered by Mental-RoBERTa, reviewed by humans, built for trust.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                    HIPAA & FERPA Compliant
                  </span>
                </div>
              </div>
              {FOOTER_COLS.map((col) => (
                <div key={col.title}>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">
                    {col.title}
                  </h3>
                  <ul className="flex flex-col gap-3 text-sm text-slate-300">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-14 pt-8 border-t border-emerald-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div>&copy; {new Date().getFullYear()} MindGuard AI Inc. Student wellbeing, consented.</div>
              <div className="flex items-center gap-5">
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
                <Link href="/dpa" className="hover:text-emerald-400 transition-colors">DPA</Link>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

