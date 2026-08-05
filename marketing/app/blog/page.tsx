import type { Metadata } from 'next'
import { PageHero } from '@/components/ui'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — MindGuard',
  description:
    'Essays on consent-first wellbeing tech, clinical decision support, and what counsellors need us to build.',
}

const POSTS = [
  {
    href: '/blog/why-we-built-mindguard-consent-first',
    date: 'March 2025',
    title: 'Why we built MindGuard consent-first',
    excerpt:
      "Surveillance tools fail in a counselling room. Trust doesn't. The founder's story of why consent is the product.",
  },
  {
    href: '/blog/what-clinical-decision-support-means',
    date: 'April 2025',
    title: 'What clinical decision support actually means (and doesn\'t)',
    excerpt:
      'The difference between a decision-support tool and a monitoring wiretap — and why the distinction is existential.',
  },
  {
    href: '/blog/the-1-400-problem',
    date: 'May 2025',
    title: 'The 1:400 problem: what counsellors need us to build',
    excerpt:
      'One counsellor, four hundred students. How technology can help without pretending to replace human care.',
  },
]

export default function BlogPage() {
  return (
    <div>
      <PageHero
        eyebrow="Blog"
        title="Ideas on consent-first wellbeing tech"
        subtitle="Essays from the team on building technology that schools can trust."
      />
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 flex flex-col gap-6">
          {POSTS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group bg-white border border-[#eef2f6] rounded-2xl p-8 hover:shadow-md transition-shadow"
            >
              <div className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{p.date}</div>
              <h2 className="mt-2 text-xl font-bold text-ink group-hover:text-teal-700">
                {p.title}
              </h2>
              <p className="mt-3 text-sm text-slate leading-relaxed">{p.excerpt}</p>
              <div className="mt-4 text-sm font-semibold text-teal-700">Read more →</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
