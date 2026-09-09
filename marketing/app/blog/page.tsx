import type { Metadata } from 'next'
import { PageHero } from '@/components/ui'
import { Reveal } from '@/components/motion'
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
  const [featured, ...rest] = POSTS

  return (
    <div>
      <PageHero
        eyebrow="Blog"
        title="Ideas on consent-first wellbeing tech"
        subtitle="Essays from the team on building technology that schools can trust."
      />

      <section className="py-20 sm:py-24">
        <div className="mg-section max-w-5xl">
          {/* Featured */}
          <Reveal>
            <Link
              href={featured.href}
              className="group block mg-card mg-card-hover p-8 sm:p-10 mb-8"
            >
              <span className="mg-eyebrow inline-block mb-4">Featured · {featured.date}</span>
              <h2 className="display text-2xl sm:text-3xl text-ink group-hover:text-forest transition-colors">
                {featured.title}
              </h2>
              <p className="mt-4 text-base text-ink-soft leading-relaxed max-w-2xl">{featured.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                Read more <span aria-hidden>→</span>
              </span>
            </Link>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {rest.map((p) => (
              <Reveal key={p.href}>
                <Link href={p.href} className="group block mg-card mg-card-hover p-7 h-full">
                  <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide">{p.date}</div>
                  <h3 className="mt-3 text-xl font-semibold text-ink group-hover:text-forest transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">{p.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                    Read more <span aria-hidden>→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
