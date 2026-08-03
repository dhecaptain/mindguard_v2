import Link from 'next/link'

const FEATURES = [
  {
    icon: '🛡️',
    title: 'Consent-first by design',
    text: 'Student and parent consent is captured, recorded and enforced before any analysis runs. Revoke anytime, from anywhere.',
  },
  {
    icon: '🌐',
    title: 'Multi-platform monitoring',
    text: 'Reddit, X/Twitter, Bluesky, Mastodon, YouTube, Facebook and more — one wellbeing view across the platforms students actually use.',
  },
  {
    icon: '🧠',
    title: 'ML risk detection',
    text: 'A purpose-trained model flags early warning signs of distress and suggests crisis resources, never diagnoses.',
  },
  {
    icon: '🔒',
    title: 'Privacy & encryption',
    text: 'Student PII is encrypted at rest and only the consent you granted decides who can see what.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Set up your roster',
    text: 'Upload your student roster once. We determine adult vs. minor status and route consent to the right person.',
  },
  {
    step: '02',
    title: 'Consent is requested & recorded',
    text: 'Students and parents receive a signed, one-time consent link. Every view, accept, decline and revoke is audited.',
  },
  {
    step: '03',
    title: 'Monitor with consent in place',
    text: 'For consented students only, counsellors get risk alerts and a rolling risk view across platforms.',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-6">
            Consent-first student wellbeing monitoring
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-ink leading-tight max-w-3xl mx-auto">
            Know when students are struggling —{' '}
            <span className="text-teal-600">with consent built in.</span>
          </h1>
          <p className="mt-6 text-lg text-slate max-w-2xl mx-auto">
            MindGuard helps counselling teams monitor student wellbeing across social
            platforms. Analysis only runs on consented students, and every decision is
            audited and reversible.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/demo"
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Request a demo
            </Link>
            <a
              href="#how"
              className="px-6 py-3 border border-[#e5e7eb] text-ink rounded-xl font-semibold hover:bg-white transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-ink text-center mb-12">
            Built for safeguarding teams, respectful of students
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-[#eef2f6] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-ink mb-2">{f.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-ink text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="relative bg-white border border-[#eef2f6] rounded-2xl p-6">
                <div className="text-5xl font-extrabold text-teal-50 mb-4">{s.step}</div>
                <h3 className="font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-ink mb-4">Ready to see MindGuard in action?</h2>
          <p className="text-slate mb-8 max-w-xl mx-auto">
            We&apos;ll walk you through the consent workflow, the tracking dashboard and the
            multi-platform monitoring — with your school&apos;s data in mind.
          </p>
          <Link
            href="/demo"
            className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
          >
            Request a demo
          </Link>
        </div>
      </section>
    </div>
  )
}
