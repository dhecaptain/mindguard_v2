import type { Metadata } from 'next'
import HomeAnimated from '@/components/HomeAnimated'

export const metadata: Metadata = {
  title: 'MindGuard — Consent-first student wellbeing monitoring',
  description: 'Catch the signals of distress — before a crisis. Consent-first AI decision support for school and university counsellors. Powered by Mental-RoBERTa, reviewed by humans, built for trust.',
}

export default function HomePage() {
  return <HomeAnimated />
}
