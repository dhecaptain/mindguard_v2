import type { PlatformResult } from '../../types'
import RiskBadge from '../shared/RiskBadge'

interface OverallBannerProps {
  result: PlatformResult
  period?: string
}

export default function OverallBanner({ result, period = '3 months' }: OverallBannerProps) {
  return (
    <>
      <div className="grid grid-cols-4 gap-[10px] mb-[12px]">
        <div className="bg-[#fafbfc] rounded-[8px] border-[0.5px] border-[#f1f5f9] p-[10px_12px] text-center">
          <div className="text-[0.95rem] font-bold text-[#0F766E]">{(result.overall * 100).toFixed(0)}%</div>
          <div className="text-[0.65rem] text-[#9ca3af] font-semibold uppercase tracking-[0.06em]">Overall Risk</div>
        </div>
        <div className="bg-[#fafbfc] rounded-[8px] border-[0.5px] border-[#f1f5f9] p-[10px_12px] text-center">
          <div className="text-[0.95rem] font-bold text-[#0F766E]">{result.n_posts}</div>
          <div className="text-[0.65rem] text-[#9ca3af] font-semibold uppercase tracking-[0.06em]">Posts Analysed</div>
        </div>
        <div className="bg-[#fafbfc] rounded-[8px] border-[0.5px] border-[#f1f5f9] p-[10px_12px] text-center">
          <div className="text-[0.95rem] font-bold text-[#dc2626]">{result.n_high}</div>
          <div className="text-[0.65rem] text-[#9ca3af] font-semibold uppercase tracking-[0.06em]">High-Risk Posts</div>
        </div>
        <div className="bg-[#fafbfc] rounded-[8px] border-[0.5px] border-[#f1f5f9] p-[10px_12px] text-center">
          <div className="text-[0.95rem] font-bold text-[#0F766E]">{period}</div>
          <div className="text-[0.65rem] text-[#9ca3af] font-semibold uppercase tracking-[0.06em]">Period</div>
        </div>
      </div>
      <RiskBadge score={result.overall} />
    </>
  )
}
