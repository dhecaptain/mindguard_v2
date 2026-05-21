import { useState } from 'react'
import { useAuthStore } from '../../store'
import { acceptTerms } from '../../api/auth'

interface TermsPageProps {
  onAccepted: () => void
}

const TERMS_CLAUSES = [
  'Scope of Use — MindGuard is a research tool for trained mental health professionals.',
  'Human Oversight Required — All outputs must be reviewed by a qualified professional.',
  'Required Clinical Response — Critical results require immediate follow-up per your protocol.',
  'Non-Punitive Use Policy — Never use for discipline; only for supportive intervention.',
  'Data Responsibility — No analyzed content is stored between sessions.',
  'Limitations & Risk Awareness — Minimum 92.5% accuracy target; never replace clinical judgment.',
  'Accountability — You are responsible for decisions based on system output.',
  'Training Requirement — Complete platform training before clinical use.',
  'Emergency Responsibility — Call emergency services for immediate danger; MindGuard is not a crisis service.',
  'Agreement — By accepting, you agree to all terms and acknowledge ethical use requirements.',
]

export default function TermsPage({ onAccepted }: TermsPageProps) {
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    try {
      await acceptTerms()
      useAuthStore.getState().setTermsAccepted(true)
      onAccepted()
    } catch (err: any) {
      alert(err.message || 'Failed to accept terms')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-[20px]">
      <div className="max-w-[720px] w-full">
        <div className="flex items-center gap-[10px] mb-[24px] justify-center">
          <div className="w-[32px] h-[32px] rounded-lg bg-gradient-to-br from-[#0F766E] to-[#1D9E75] flex items-center justify-center text-white font-extrabold text-[0.72rem]">
            MG
          </div>
          <span className="text-[#1f2937] text-[0.95rem] font-bold">MindGuard</span>
        </div>

        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[24px]">
          <h1 className="text-[1.1rem] font-bold text-[#1f2937] text-center mb-[6px]">
            Practitioner Use and Responsibility Agreement
          </h1>
          <p className="text-[0.72rem] text-[#6b7280] text-center mb-[16px]">
            Please review and accept the terms to continue.
          </p>

          <div className="grid grid-cols-2 gap-[8px] mb-[16px]">
            {TERMS_CLAUSES.map((clause, i) => (
              <div
                key={i}
                className="bg-[#fafbfc] border border-[#f1f5f9] rounded-[7px] p-[8px_10px] text-[0.68rem] text-[#4b5563] leading-[1.5]"
              >
                {clause}
              </div>
            ))}
          </div>

          <label className="flex items-center gap-[8px] cursor-pointer mb-[12px]">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-[16px] h-[16px] accent-[#0F766E]"
            />
            <span className="text-[0.72rem] text-[#374151]">
              I have read and agree to the terms above
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!checked || loading}
            className="w-full bg-gradient-to-r from-[#0F766E] to-[#1D9E75] text-white border-none rounded-[7px] py-[9px] text-[0.78rem] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'I Consent and Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
