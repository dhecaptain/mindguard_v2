import { useAnalysisStore, usePlatformStore } from '../store'
import { analyzeText, analyzeImage } from '../api/analysis'
import InputPanel from '../components/dashboard/InputPanel'
import PredictionPanel from '../components/dashboard/PredictionPanel'
import AnalyticsPanel from '../components/dashboard/AnalyticsPanel'
import type { AnalysisResult } from '../types'
import { getRiskLabel, getClassification } from '../types'

export default function DashboardPage() {
  const { analytics, setLastResult, updateAnalytics } = useAnalysisStore()
  const { setLoading } = usePlatformStore()

  const handleAnalyze = async (text: string) => {
    try {
      setLoading(true)
      const res = await analyzeText({ text })
      const risk = getRiskLabel(res.prob)
      const result: AnalysisResult = {
        prob: res.prob,
        latency_ms: res.latency_ms,
        label: getClassification(res.prob),
        risk_level: risk.level,
        risk_color: risk.color,
      }
      setLastResult(result)
      updateAnalytics(res.prob, text)
    } catch (err: any) {
      alert(err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true)
      const res = await analyzeImage(file)
      const risk = getRiskLabel(res.prob)
      const result: AnalysisResult = {
        prob: res.prob,
        latency_ms: res.latency_ms,
        label: getClassification(res.prob),
        risk_level: risk.level,
        risk_color: risk.color,
      }
      setLastResult(result)
      updateAnalytics(res.prob, '[Image OCR]')
    } catch (err: any) {
      alert(err.message || 'Image analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const lastResult = useAnalysisStore.getState().lastResult

  return (
    <>
      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr] gap-[16px]">
        <InputPanel onAnalyze={handleAnalyze} onImageUpload={handleImageUpload} />
        <PredictionPanel result={lastResult} />
        <AnalyticsPanel analytics={analytics} />
      </div>

      {/* Platform strip */}
      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] overflow-hidden">
        <div className="flex bg-[#f8fafc] border-b border-[#f1f5f9] px-[16px] overflow-x-auto">
          <div className="py-[12px] px-[16px] text-[0.82rem] font-semibold text-[#0F766E] border-b-2 border-[#0F766E] cursor-default">
            Timeline
          </div>
          <div className="py-[12px] px-[16px] text-[0.82rem] font-medium text-[#94a3b8] cursor-default">
            Posts
          </div>
          <div className="py-[12px] px-[16px] text-[0.82rem] font-medium text-[#94a3b8] cursor-default">
            Socio-Economic
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[16px] p-[16px_18px]">
          <div>
            <div className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px]">
              Platform
            </div>
            <div className="text-[0.82rem] text-[#9ca3af]">
              Select a platform from the sidebar to run a multi-post analysis.
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-[90px] text-[#c4c9d0] gap-[8px]">
            <i className="ti ti-chart-line text-[26px]" />
            <span className="text-[0.78rem]">Run a social media analysis from the sidebar</span>
          </div>
        </div>
      </div>
    </>
  )
}
