import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mindguard.ai'
  const paths = [
    '',
    '/product',
    '/for-schools',
    '/for-universities',
    '/pricing',
    '/docs',
    '/docs/roster-csv',
    '/docs/faq',
    '/security',
    '/about',
    '/blog',
    '/blog/why-we-built-mindguard-consent-first',
    '/blog/what-clinical-decision-support-means',
    '/blog/the-1-400-problem',
    '/demo',
    '/contact',
    '/privacy',
    '/terms',
    '/dpa',
    '/thank-you',
  ]
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))
}
