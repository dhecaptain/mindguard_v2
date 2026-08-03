import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindGuard — Student wellbeing monitoring, consent-first',
  description:
    'MindGuard helps counselling teams monitor student wellbeing across social platforms — with consent built in from day one.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#eef2f6]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
                M
              </span>
              <span className="text-lg font-bold text-ink">MindGuard</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-slate">
              <a href="/#features" className="hover:text-teal-700">Features</a>
              <a href="/#how" className="hover:text-teal-700">How it works</a>
              <a href="/contact" className="hover:text-teal-700">Contact</a>
              <Link
                href="/demo"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                Request a demo
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-[#eef2f6] bg-[#f7f9fb]">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center text-white font-bold text-[0.7rem]">M</span>
              <span>&copy; {new Date().getFullYear()} MindGuard. Student wellbeing, consented.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-teal-700">Privacy policy</Link>
              <Link href="/contact" className="hover:text-teal-700">Contact</Link>
              <Link href="/demo" className="hover:text-teal-700">Request a demo</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
