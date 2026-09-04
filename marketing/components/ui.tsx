import Link from 'next/link'
import type { ReactNode } from 'react'

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden py-20 border-b border-emerald-500/20 bg-grid-pattern">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-3xl mx-auto">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  const alignCls = align === 'center' ? 'text-center' : 'text-left'
  return (
    <div className={`${alignCls} mb-14`}>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base text-slate-600 max-w-2xl leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function Card({
  icon,
  title,
  children,
}: {
  icon?: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="group h-full bg-white/90 backdrop-blur-md border border-emerald-500/15 hover:border-emerald-500/40 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {icon && (
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-500/20 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:scale-105 transition-all duration-300 shadow-sm">
            {icon}
          </div>
        )}
        <h3 className="font-bold text-slate-900 text-lg mb-2.5 group-hover:text-emerald-700 transition-colors">
          {title}
        </h3>
        <div className="text-sm text-slate-600 leading-relaxed">
          {children}
        </div>
      </div>
      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-600 transition-colors">
        <span>Verified Safeguard</span>
        <span className="font-mono text-emerald-600">Strict Protocol &rarr;</span>
      </div>
    </div>
  )
}

export function CtaButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
}) {
  const base =
    'inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden group'
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.55)] hover:-translate-y-[2px] btn-emerald-shine'
      : 'bg-white border border-emerald-500/30 text-slate-800 hover:bg-emerald-50/50 hover:border-emerald-500/60 hover:-translate-y-[2px] shadow-sm'
  return (
    <Link href={href} className={`${base} ${styles}`}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Link>
  )
}

export function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm text-slate-600">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6.5 4.5 9 10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="leading-snug">{children}</span>
    </li>
  )
}

export function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-emerald-500/40 transition-colors">
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      {label}
    </span>
  )
}

export function CtaBand({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <section className="relative py-20 bg-slate-900 bg-grid-pattern text-white overflow-hidden border-t border-emerald-500/20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://app.mindguardai.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.55)] hover:-translate-y-[2px] transition-all duration-300 btn-emerald-shine"
          >
            <span>Launch App (app.mindguardai.me)</span>
            <span className="font-mono text-xs opacity-80">&rarr;</span>
          </a>
          <CtaButton href="/demo" variant="ghost">Request a demo</CtaButton>
        </div>
      </div>
    </section>
  )
}


export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-emerald-500/20 shadow-sm hover:border-emerald-500/40 transition-all">
      <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight font-mono">{value}</div>
      <div className="mt-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</div>
    </div>
  )
}

