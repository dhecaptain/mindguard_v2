import { useState } from 'react'
import { usePlatformStore } from '../store'
import { analyzeVideo } from '../api/analysis'
import PredictionPanel from '../components/dashboard/PredictionPanel'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import type { AnalysisResult } from '../types'
import { getRiskLabel, getClassification } from '../types'

export default function VideoPage() {
  const [videoUrl, setVideoUrl] = useState('')
  const { video, loading, setPlatformResult } = usePlatformStore()

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) return
    try {
      usePlatformStore.getState().setLoading(true)
      const result = await analyzeVideo(videoUrl)
      setPlatformResult('video', result)
    } catch (err: any) {
      alert(err.message || 'Video analysis failed')
    } finally {
      usePlatformStore.getState().setLoading(false)
    }
  }

  const videoResult = video as { ok: boolean; risk: number; transcription?: string } | null

  const analysisResult: AnalysisResult | null = videoResult?.ok
    ? {
        prob: videoResult.risk,
        latency_ms: 0,
        label: getClassification(videoResult.risk),
        risk_level: getRiskLabel(videoResult.risk).level,
        risk_color: getRiskLabel(videoResult.risk).color,
      }
    : null

  return (
    <div className="flex flex-col gap-[14px]">
      <h2 className="text-[1.1rem] font-bold text-[#1f2937]">Video Analysis</h2>
      <p className="text-[0.74rem] text-[#6b7280] -mt-[10px]">
        Enter a video URL (TikTok, YouTube, Facebook, etc.) to transcribe and analyse the audio.
      </p>

      <div className="grid grid-cols-[1fr_1fr] gap-[14px]">
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
          <div className="text-[0.62rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[4px]">Video URL</div>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[7px] px-[10px] py-[7px] text-[0.7rem] text-[#4b5563] outline-none focus:border-[#0F766E] mb-[10px]"
          />
          <button
            onClick={handleAnalyze}
            disabled={!videoUrl.trim() || loading}
            className="w-full bg-gradient-to-r from-[#0F766E] to-[#1D9E75] text-white border-none rounded-[7px] py-[7px] text-[0.72rem] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Downloading & Transcribing...' : 'Analyse Video'}
          </button>
        </div>

        <div>
          {loading ? (
            <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
              <LoadingSpinner text="Downloading audio and transcribing..." />
            </div>
          ) : analysisResult ? (
            <PredictionPanel result={analysisResult} />
          ) : (
            <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px] flex flex-col items-center justify-center h-[200px] text-[#c4c9d0] gap-[5px]">
              <i className="ti ti-video text-[22px]" />
              <span className="text-[0.65rem]">Enter a video URL and click Analyse</span>
            </div>
          )}
        </div>
      </div>

      {videoResult?.transcription && (
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
          <div className="text-[0.78rem] font-bold text-[#1f2937] mb-[10px] pb-[8px] border-b border-[#f1f5f9] flex items-center gap-[6px]">
            <i className="ti ti-file-text text-[14px] text-[#0F766E]" />
            Transcription
          </div>
          <p className="text-[0.72rem] text-[#4b5563] leading-[1.6] whitespace-pre-wrap">{videoResult.transcription}</p>
        </div>
      )}
    </div>
  )
}
