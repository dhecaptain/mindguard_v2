import { useState } from 'react'
import { usePlatformStore } from '../store'
import { analyzeBluesky } from '../api/analysis'
import TimelineChart from '../components/analysis/TimelineChart'
import PostCards from '../components/analysis/PostCards'
import OverallBanner from '../components/analysis/OverallBanner'
import SocioEconomicPanel from '../components/analysis/SocioEconomicPanel'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import type { PlatformResult } from '../types'

export default function BlueskyPage() {
  const [handle, setHandle] = useState('')
  const [password, setPassword] = useState('')
  const [minRisk, setMinRisk] = useState(0)
  const [activeTab, setActiveTab] = useState<'timeline' | 'posts' | 'socio'>('timeline')
  const { bluesky, loading, setPlatformResult } = usePlatformStore()

  const handleAnalyze = async () => {
    if (!handle.trim() || !password.trim()) return
    try {
      usePlatformStore.getState().setLoading(true)
      const result = await analyzeBluesky(handle, password, minRisk, 20)
      setPlatformResult('bluesky', result)
    } catch (err: any) {
      alert(err.message || 'Bluesky analysis failed')
    } finally {
      usePlatformStore.getState().setLoading(false)
    }
  }

  const result = bluesky as PlatformResult | null

  return (
    <div className="flex flex-col gap-[14px]">
      <h2 className="text-[1.1rem] font-bold text-[#1f2937]">Bluesky Analysis</h2>
      <p className="text-[0.74rem] text-[#6b7280] -mt-[10px]">
        Enter a Bluesky handle and app password to analyse their posts.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[14px]">
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
          <div className="text-[0.62rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[4px]">Bluesky handle</div>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="user.bsky.social"
            className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[7px] px-[10px] py-[7px] text-[0.7rem] text-[#4b5563] outline-none focus:border-[#0F766E] mb-[8px]"
          />
          <div className="text-[0.62rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[4px]">App password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="App password"
            className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[7px] px-[10px] py-[7px] text-[0.7rem] text-[#4b5563] outline-none focus:border-[#0F766E] mb-[8px]"
          />
          <div className="text-[0.62rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[4px]">Min risk score</div>
          <div className="flex items-center gap-[8px] mb-[8px]">
            <input
              type="range"
              min={0}
              max={100}
              value={minRisk * 100}
              onChange={(e) => setMinRisk(Number(e.target.value) / 100)}
              className="flex-1 h-[3px]"
            />
            <span className="text-[0.68rem] text-[#6b7280] font-semibold min-w-[32px]">{(minRisk * 100).toFixed(0)}%</span>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!handle.trim() || !password.trim() || loading}
            className="w-full bg-gradient-to-r from-[#0F766E] to-[#1D9E75] text-white border-none rounded-[7px] py-[7px] text-[0.72rem] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analysing...' : 'Analyse Bluesky User'}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] overflow-hidden">
          <div className="flex bg-[#f8fafc] border-b border-[#f1f5f9] px-[14px] overflow-x-auto">
            {(['timeline', 'posts', 'socio'] as const).map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-[10px] px-[14px] text-[0.7rem] cursor-pointer border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                    : 'text-[#94a3b8] border-transparent font-medium hover:text-[#6b7280]'
                }`}
              >
                {tab === 'timeline' ? 'Timeline' : tab === 'posts' ? 'Posts' : 'Socio-Economic'}
              </div>
            ))}
          </div>
          <div className="p-[14px_16px]">
            {loading ? (
              <LoadingSpinner text="Fetching and analysing Bluesky posts..." />
            ) : !result ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-[#c4c9d0] gap-[5px]">
                <i className="ti ti-butterfly text-[22px]" />
                <span className="text-[0.65rem]">Enter a handle and click Analyse</span>
              </div>
            ) : (
              <>
                {activeTab === 'timeline' && (
                  <>
                    <OverallBanner result={result} />
                    <div className="mt-[10px]">
                      <TimelineChart posts={result.df} />
                    </div>
                  </>
                )}
                {activeTab === 'posts' && (
                  <PostCards posts={result.df.filter((p) => p.risk_score >= result.min_risk)} n={result.n_show} />
                )}
                {activeTab === 'socio' && <SocioEconomicPanel signals={result.signals} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
