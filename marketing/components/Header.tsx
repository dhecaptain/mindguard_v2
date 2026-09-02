'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const NAV_LINKS = [
  { href: '/product', label: 'Product' },
  { href: '/for-schools', label: 'For schools' },
  { href: '/for-universities', label: 'For universities' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/security', label: 'Security' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
]

export default function Header() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <>
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 origin-left z-[60]" style={{ scaleX }} />
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#eef2f6]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.span
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold"
            >
              M
            </motion.span>
            <span className="text-lg font-bold text-ink group-hover:text-teal-700 transition-colors">MindGuard</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate">
            {NAV_LINKS.map((l, i) => (
              <motion.div key={l.href} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4 }}>
                <Link href={l.href} className="hover:text-teal-700 transition-colors relative group/link">
                  {l.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-teal-600 group-hover/link:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
              <Link href="/demo" className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all hover:shadow-lg hover:shadow-teal-600/20 hover:-translate-y-[1px]">
                Request a demo
              </Link>
            </motion.div>
          </nav>
          <Link href="/demo" className="lg:hidden px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm">
            Request a demo
          </Link>
        </div>
      </header>
    </>
  )
}
