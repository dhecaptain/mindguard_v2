import Link from 'next/link'
import type { ReactNode } from 'react'

export function BlogPost({
  title,
  date,
  author,
  children,
}: {
  title: string
  date: string
  author: string
  children: ReactNode
}) {
  return (
    <article className="py-16">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="text-sm font-semibold text-forest hover:underline">
          ← All posts
        </Link>
        <h1 className="mt-5 display text-3xl sm:text-4xl text-ink leading-tight">{title}</h1>
        <div className="mt-5 flex items-center gap-3 text-sm text-ink-soft">
          <span className="font-semibold text-ink">{author}</span>
          <span aria-hidden>·</span>
          <time dateTime={date}>{date}</time>
        </div>
        <div className="mt-8 flex flex-col gap-6 text-[0.95rem] leading-relaxed text-ink-soft">
          {children}
        </div>
      </div>
    </article>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-semibold text-ink mt-6">{children}</h2>
}
