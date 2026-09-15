import { useState } from 'react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const user = useAuthStore((s) => s.user)
  const [category, setCategory] = useState('adult')
  const [parentEmail, setParentEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSaving(true)
    try {
      await api.post('/auth/onboarding', { user_category: category, parent_email: parentEmail || undefined })
      onComplete()
      window.location.reload()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to complete onboarding')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-[20px]">
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-[32px] max-w-[480px] w-full">
        <h2 className="text-[1.3rem] font-bold text-[#1f2937] mb-[6px]">Welcome to MindGuard</h2>
        <p className="text-[0.82rem] text-[#6b7280] mb-[20px]">Hi {user?.name || user?.email}, please tell us how you'll use MindGuard.</p>
        <p className="text-[0.75rem] text-[#6b7280] mb-[12px] bg-[#f0fdfa] border border-[#ccfbf1] rounded-[8px] p-[10px]">Authentication does not verify age. This choice establishes your workspace and consent requirements. You can update it later with support.</p>

        <div className="flex flex-col gap-[12px] mb-[16px]">
          <label className="text-[0.72rem] font-bold text-[#374151] uppercase">I am</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem]">
            <option value="adult">Adult — using for my own wellbeing</option>
            <option value="minor">Minor — under 18</option>
            <option value="parent">Parent/Guardian</option>
            <option value="institution_managed">Institution-managed student</option>
          </select>
          {category === 'minor' && (
            <div>
              <label className="text-[0.72rem] font-bold text-[#374151] uppercase">Parent/guardian email</label>
              <input value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@example.com" className="mt-[6px] w-full bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem]" />
              <p className="text-[0.7rem] text-[#6b7280] mt-[4px]">We'll request consent from your parent/guardian.</p>
            </div>
          )}
          {category === 'adult' && (
            <p className="text-[0.75rem] text-[#6b7280] bg-[#f8fafc] border border-[#e5e7eb] rounded-[8px] p-[10px]">Your connected accounts must be your own or explicitly authorized. You cannot analyze arbitrary third-party handles.</p>
          )}
        </div>

        {error && <div className="mb-[12px] px-[12px] py-[8px] bg-[#fee2e2] border border-[#fca5a5] rounded-[8px] text-[0.78rem] text-[#991b1b]">{error}</div>}

        <button onClick={handleSubmit} disabled={saving} className="w-full px-[16px] py-[10px] bg-[#0F766E] text-white rounded-[8px] text-[0.85rem] font-semibold disabled:opacity-50 hover:bg-[#115E59]">{saving ? 'Saving…' : 'Continue'}</button>
      </div>
    </div>
  )
}
