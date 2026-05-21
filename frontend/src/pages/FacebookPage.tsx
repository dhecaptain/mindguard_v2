import { useState } from 'react'
import { usePlatformStore } from '../store'
import { analyzeFacebook } from '../api/analysis'
import TimelineChart from '../components/analysis/TimelineChart'
import PostCards from '../components/analysis/PostCards'
import OverallBanner from '../components/analysis/OverallBanner'
import SocioEconomicPanel from '../components/analysis/SocioEconomicPanel'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import type { PlatformResult } from '../types'

export default function FacebookPage() {
  const [profileUrl, setProfileUrl] = useState('')
  const [activeTab, setActiveTab] = useState<'timeline' | 'posts' | 'socio'>('timeline')
  const { facebook, loading, setPlatformResult } = usePlatformStore()

  const handleAnalyze = async () => {
    if (!profileUrl.trim()) return
    try {
      usePlatformStore.getState().setLoading(true)
      const result = await analyzeFacebook(profileUrl)
      setPlatformResult('facebook', result)
    } catch (err: any) {
      alert(err.message || 'Facebook analysis failed')
    } finally {
      usePlatformStore.getState().setLoading(false)
    }
  }

  const result = facebook as PlatformResult | null

  return (
    <div className="flex flex-col gap-[14px]">
      <h2 className="text-[1.1rem] font-bold text-[#1f2937]">Facebook Analysis</h2>
      <p className="text-[0.74rem] text-[#6b7280] -mt-[10px]">
        Enter a public Facebook profile URL to scrape and analyse posts. Uses a headless browser.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[14px]">
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
          <div className="text-[0.62rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[4px]">Profile URL</div>
          <input
            type="text"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="https://facebook.com/username"
            className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[7px] px-[10px] py-[7px] text-[0.7rem] text-[#4b5563] outline-none focus:border-[#0F766E] mb-[10px]"
          />
          <button
            onClick={handleAnalyze}
            disabled={!profileUrl.trim() || loading}
            className="w-full bg-gradient-to-r from-[#0F766E] to-[#1D9E75] text-white border-none rounded-[7px] py-[7px] text-[0.72rem] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Scraping...' : 'Scrape & Analyse Facebook'}
          </button>
          <p className="text-[0.62rem] text-[#9ca3af] mt-[6px]">Facebook may require login. Use File Upload with a Facebook archive instead.</p>
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
              <LoadingSpinner text="Opening headless browser and scraping..." />
            ) : !result ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-[#c4c9d0] gap-[5px]">
                <i className="ti ti-brand-facebook text-[22px]" />
                <span className="text-[0.65rem]">Enter a profile URL and click Scrape</span>
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
