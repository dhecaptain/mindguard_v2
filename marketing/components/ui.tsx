import Link from 'next/link'
import type { ReactNode } from 'react'
import { APP_URL } from '@/lib/app-url'

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="mg-eyebrow">{children}</span>
}

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
    <section className="relative overflow-hidden bg-mist">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(220,235,227,0.6),transparent_70%)]" />
      <div className="relative mg-section pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
        {eyebrow && (
          <p className="mg-eyebrow mb-5">{eyebrow}</p>
        )}
        <h1 className="display text-4xl sm:text-5xl md:text-6xl text-ink max-w-4xl mx-auto">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-base sm:text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
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
    <div className={`${alignCls} mb-12 max-w-3xl ${align === 'center' ? 'mx-auto' : ''}`}>
      <h2 className="display text-3xl sm:text-4xl text-ink">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base text-ink-soft leading-relaxed">
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
    <div className="mg-card mg-card-hover flex h-full flex-col justify-between p-7">
      <div>
        {icon && (
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <div className="mt-2.5 text-[0.92rem] text-ink-soft leading-relaxed">
          {children}
        </div>
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
  const cls =
    variant === 'primary' ? 'mg-btn-primary' : 'mg-btn-secondary'
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  )
}

export function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[0.92rem] text-ink-soft">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700">
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
    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(23,74,58,0.18)] bg-white px-4 py-2 text-xs font-semibold text-forest-700">
      <span className="h-1.5 w-1.5 rounded-full bg-forest-400" />
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
    <section className="relative overflow-hidden bg-forest text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_100%_0%,rgba(98,168,137,0.35),transparent_60%)]" />
      <div className="relative mg-section py-20 text-center">
        <h2 className="display text-3xl sm:text-4xl text-white max-w-2xl mx-auto">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-5 text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/request-demo"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-forest shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            Request a demo
          </Link>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10"
          >
            Launch App
          </a>
        </div>
      </div>
    </section>
  )
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="display text-4xl sm:text-5xl text-forest">{value}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {label}
      </div>
    </div>
  )
}
