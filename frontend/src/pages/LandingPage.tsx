import { useState } from 'react'
import SignInPage from '../components/auth/SignInPage'

export default function LandingPage() {
  const [showSignIn, setShowSignIn] = useState(false)

  if (showSignIn) {
    return <SignInPage onSuccess={() => {}} />
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-bold text-[#1f2937]">MindGuard</span>
        </div>
        <button
          onClick={() => setShowSignIn(true)}
          className="px-4 py-2 bg-[#0F766E] text-white rounded-lg text-sm font-medium hover:bg-[#0d6d61] transition-colors"
        >
          Sign In
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1f2937] mb-6 leading-tight">
          Student wellbeing,<br />
          <span className="text-[#0F766E]">monitored with care</span>
        </h1>
        <p className="text-lg text-[#6b7280] max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-assisted mental-health risk screening for schools and universities.
          Consent-first, privacy-preserving, built for educational institutions.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setShowSignIn(true)}
            className="px-6 py-3 bg-[#0F766E] text-white rounded-lg font-semibold hover:bg-[#0d6d61] transition-colors"
          >
            Get Started
          </button>
          <a
            href="/privacy"
            className="px-6 py-3 border border-[#d1d5db] text-[#374151] rounded-lg font-semibold hover:bg-[#f3f4f6] transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </main>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
            <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] flex items-center justify-center mb-4">
              <i className="ti ti-shield-check text-xl text-[#0F766E]" />
            </div>
            <h3 className="font-bold text-[#1f2937] mb-2">Consent First</h3>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              No analysis runs without explicit, revocable consent from students or guardians. Every consent action is logged and auditable.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
            <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] flex items-center justify-center mb-4">
              <i className="ti ti-lock text-xl text-[#0F766E]" />
            </div>
            <h3 className="font-bold text-[#1f2937] mb-2">Privacy by Design</h3>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              Student PII is encrypted at rest. Access is limited to authorised counsellors and administrators only.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
            <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] flex items-center justify-center mb-4">
              <i className="ti ti-chart-line text-xl text-[#0F766E]" />
            </div>
            <h3 className="font-bold text-[#1f2937] mb-2">Early Intervention</h3>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              AI-assisted analysis flags potential mental-health risks so counsellors can intervene early.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e5e7eb] py-6 text-center text-sm text-[#9ca3af]">
        <p>MindGuard &copy; {new Date().getFullYear()} &middot; <a href="/privacy" className="underline hover:text-[#6b7280]">Privacy Policy</a> &middot; <a href="/terms" className="underline hover:text-[#6b7280]">Terms of Service</a></p>
      </footer>
    </div>
  )
}
