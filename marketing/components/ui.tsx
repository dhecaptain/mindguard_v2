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
    <section className="bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-14 text-center">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-6">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink leading-tight max-w-3xl mx-auto">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-lg text-slate max-w-2xl mx-auto">{subtitle}</p>
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
    <div className={`${alignCls} mb-12`}>
      <h2 className="text-3xl font-bold text-ink">{title}</h2>
      {subtitle && <p className={`mt-4 text-slate max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>{subtitle}</p>}
    </div>
  )
}

export function Card({
  icon,
  title,
  children,
}: {
  icon?: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="h-full bg-white border border-[#eef2f6] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-teal-900/5 hover:border-teal-100 hover:-translate-y-1 transition-all duration-300">
      {icon && <div className="text-2xl mb-4">{icon}</div>}
      <h3 className="font-bold text-ink mb-2">{title}</h3>
      <div className="text-sm text-slate leading-relaxed">{children}</div>
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
    'inline-block px-6 py-3 rounded-xl font-semibold transition-all'
  const styles =
    variant === 'primary'
      ? 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/20 hover:-translate-y-[1px]'
      : 'border border-[#e5e7eb] text-ink hover:bg-white hover:border-teal-200 hover:-translate-y-[1px]'
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  )
}

export function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm text-slate">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6.5 4.5 9 10 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  )
}

export function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-xs font-semibold text-slate">
      <span className="h-2 w-2 rounded-full bg-teal-500" />
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
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-ink mb-4">{title}</h2>
        {subtitle && <p className="text-slate mb-8 max-w-xl mx-auto">{subtitle}</p>}
        <CtaButton href="/demo">Request a demo</CtaButton>
      </div>
    </section>
  )
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl sm:text-4xl font-extrabold text-teal-600">{value}</div>
      <div className="mt-2 text-sm text-slate">{label}</div>
    </div>
  )
}
