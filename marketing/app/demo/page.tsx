import type { Metadata } from 'next'
import DemoForm from '@/components/DemoForm'

export const metadata: Metadata = {
  title: 'Request a demo — MindGuard',
  description: 'See MindGuard in action. Fill in the form and our team will reach out within 2 business days.',
}

export default function DemoPage() {
  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-ink mb-3 text-center">Request a demo</h1>
        <p className="text-slate text-center mb-10 max-w-lg mx-auto">
          See how MindGuard helps counselling teams monitor student wellbeing across
          platforms — with consent baked in from day one.
        </p>
        <DemoForm />
      </div>
    </div>
  )
}
