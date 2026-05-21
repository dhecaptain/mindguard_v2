import { useState, useEffect } from 'react'
import { getResources, getStateResources } from '../api/resources'
import type { CrisisResource } from '../types'

const COUNTRIES = ['Kenya', 'UK', 'Australia', 'Canada', 'International']

export default function CrisisResourcesPage() {
  const [resources, setResources] = useState<Record<string, CrisisResource[]>>({})
  const [stateResources, setStateResources] = useState<Record<string, CrisisResource[]>>({})
  const [selectedCountry, setSelectedCountry] = useState('Kenya')
  const [selectedState, setSelectedState] = useState('')

  useEffect(() => {
    getResources().then(setResources).catch((e) => console.error('Failed to load resources:', e))
    getStateResources().then(setStateResources).catch((e) => console.error('Failed to load state resources:', e))
  }, [])

  const isUsa = selectedCountry === 'USA — Select a State'
  const stateList = Object.keys(stateResources).sort()

  const displayResources = isUsa && selectedState
    ? [...(resources['USA (National)'] || []), ...(stateResources[selectedState] || [])]
    : resources[selectedCountry] || []

  return (
    <div className="flex flex-col gap-[14px]">
      <h2 className="text-[1.1rem] font-bold text-[#1f2937]">Crisis Resources</h2>
      <p className="text-[0.74rem] text-[#6b7280] -mt-[10px]">
        Select your country or US state to see local crisis resources.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
          <select
            value={selectedCountry}
            onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState('') }}
            className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[7px] px-[10px] py-[7px] text-[0.7rem] text-[#4b5563] outline-none focus:border-[#0F766E] mb-[10px]"
          >
            {[...COUNTRIES, 'USA — Select a State'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {isUsa && (
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[7px] px-[10px] py-[7px] text-[0.7rem] text-[#4b5563] outline-none focus:border-[#0F766E] mb-[10px]"
            >
              <option value="">Select your state</option>
              {stateList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {displayResources.length > 0 && (
            <div className="space-y-[6px] mt-[10px]">
              {displayResources.map((r, i) => (
                <div
                  key={i}
                  className="border-l-[3px] border-[#0d9488] rounded-[6px] p-[8px_10px] bg-[#fafbfc]"
                >
                  <div className="text-[0.72rem] font-semibold text-[#1f2937]">{r.name}</div>
                  <div className="text-[0.65rem] text-[#6b7280]">{r.contact}</div>
                  <div className="text-[0.55rem] text-[#0F766E] font-semibold uppercase mt-[2px]">{r.type}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-[10px] p-[8px_10px] bg-[#fef2f2] rounded-[8px] border border-[#fecaca]">
            <p className="text-[#991b1b] text-[0.7rem] m-0">
              If someone is in immediate danger, call emergency services immediately. MindGuard is a research tool — it does not replace clinical assessment.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
          <h3 className="text-[0.84rem] font-bold text-[#1f2937] mb-[8px]">About MindGuard</h3>
          <div className="text-[0.72rem] text-[#4b5563] leading-[1.85] space-y-[8px]">
            <div>
              <div className="text-[0.65rem] font-bold text-[#0F766E] uppercase tracking-[0.08em] mb-[4px]">What is MindGuard?</div>
              <p>MindGuard is a consent-first, human-in-the-loop clinical decision-support system designed to help trained mental health professionals identify early signals of suicidal ideation in consented digital text.</p>
            </div>
            <div>
              <div className="text-[0.65rem] font-bold text-[#0F766E] uppercase tracking-[0.08em] mb-[4px]">Model Architecture</div>
              <p>Powered by Mental-RoBERTa, fine-tuned on 12,656 annotated posts, achieving ROC-AUC of 0.9813 and accuracy of 92.5%.</p>
            </div>
            <div>
              <div className="text-[0.65rem] font-bold text-[#0F766E] uppercase tracking-[0.08em] mb-[4px]">Risk Tiers</div>
              <p>Low &lt;35% &middot; Moderate 35–55% &middot; High 55–75% &middot; Critical &gt;75%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
