'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Shield, Sparkles, ExternalLink } from 'lucide-react'


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
  const pathname = usePathname()
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-500 origin-left z-[60] shadow-sm shadow-emerald-500/50"
        style={{ scaleX }}
      />

      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-emerald-500/15 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-extrabold shadow-md shadow-emerald-600/30 border border-emerald-400/30"
            >
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight flex items-center gap-1">
                MindGuard
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="text-[10px] font-semibold text-slate-500 -mt-1 tracking-wider uppercase">
                AI Wellbeing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {NAV_LINKS.map((l) => {
              const isActive = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative py-1.5 transition-colors duration-200 ${
                    isActive ? 'text-emerald-700 font-semibold' : 'hover:text-emerald-600 text-slate-600'
                  }`}
                >
                  {l.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="https://app.mindguardai.me"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.55)] transition-all duration-300 hover:-translate-y-[1px] flex items-center gap-1.5 btn-emerald-shine"
            >
              <span>Launch App</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <Link
              href="/demo"
              className="hidden sm:flex px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all hover:-translate-y-[1px] items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Request demo</span>
            </Link>

          </div>


        </div>
      </header>
    </>
  )
}

