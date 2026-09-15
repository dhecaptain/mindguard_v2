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
            <option value="adult">Adult — I'm 18 or older and using MindGuard for my own wellbeing.</option>
            <option value="minor">Minor — I'm under 18 and need a parent/guardian or authorized institution involved.</option>
            <option value="parent">Parent / Guardian — I'm a parent or guardian managing wellbeing for a child.</option>
            <option value="institution_managed">Institution / Organization — I'm representing a school, university, organization, or care institution.</option>
          </select>
          {category === 'minor' && (
            <div>
              <label className="text-[0.72rem] font-bold text-[#374151] uppercase">Parent/guardian email</label>
              <input value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@example.com" className="mt-[6px] w-full bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem]" />
              <p className="text-[0.7rem] text-[#6b7280] mt-[4px]">We'll request consent from your parent/guardian. You will not be able to use analysis features until consent is granted.</p>
            </div>
          )}
          {category === 'adult' && (
            <p className="text-[0.75rem] text-[#6b7280] bg-[#f8fafc] border border-[#e5e7eb] rounded-[8px] p-[10px]">Your connected accounts must be your own or explicitly authorized. You cannot analyze arbitrary third-party handles.</p>
          )}
          {category === 'parent' && (
            <p className="text-[0.75rem] text-[#6b7280] bg-[#f0fdfa] border border-[#ccfbf1] rounded-[8px] p-[10px]">As a parent/guardian, you will be able to review consent requests, approve or decline participation, and understand what information is being authorized. You will not have unrestricted access to counsellor notes.</p>
          )}
          {category === 'institution_managed' && (
            <div className="bg-[#fef3c7] border border-[#fde68a] rounded-[8px] p-[10px]">
              <p className="text-[0.75rem] text-[#92400e] font-semibold">Institutional access is controlled.</p>
              <p className="text-[0.72rem] text-[#92400e] mt-[4px]">Selecting this option does not automatically grant administrator privileges. Institutional workspaces are set up through our sales/demo process to ensure proper privacy and consent controls.</p>
              <a href="/demo" className="inline-block mt-[8px] text-[0.75rem] font-bold text-[#0F766E] underline">Book a demo — For institutions</a>
            </div>
          )}
        </div>

        {error && <div className="mb-[12px] px-[12px] py-[8px] bg-[#fee2e2] border border-[#fca5a5] rounded-[8px] text-[0.78rem] text-[#991b1b]">{error}</div>}

        <button onClick={handleSubmit} disabled={saving} className="w-full px-[16px] py-[10px] bg-[#0F766E] text-white rounded-[8px] text-[0.85rem] font-semibold disabled:opacity-50 hover:bg-[#115E59]">{saving ? 'Saving…' : 'Continue'}</button>
      </div>
    </div>
  )
}
