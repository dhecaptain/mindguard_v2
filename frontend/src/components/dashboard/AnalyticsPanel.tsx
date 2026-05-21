import type { Analytics } from '../../types'

interface AnalyticsPanelProps {
  analytics: Analytics
}

export default function AnalyticsPanel({ analytics }: AnalyticsPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[18px_20px]">
      <div className="text-[0.9rem] font-bold text-[#1f2937] mb-[12px] pb-[10px] border-b border-[#f1f5f9] flex items-center gap-[8px]">
        <i className="ti ti-chart-bar text-[16px] text-[#0F766E]" />
        Session Analytics
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-[6px] mb-[14px]">
        <div className="bg-white border-[0.5px] border-[#f1f5f9] border-t-[3px] border-t-[#0F766E] rounded-[8px] p-[10px_8px] text-center">
          <div className="text-[1.5rem] font-extrabold text-[#0F766E] tracking-tight">
            {analytics.total_analyses}
          </div>
          <div className="text-[0.62rem] text-[#9ca3af] font-bold uppercase tracking-[0.08em] mt-[2px]">Analysed</div>
        </div>
        <div className="bg-white border-[0.5px] border-[#f1f5f9] border-t-[3px] border-t-[#dc2626] rounded-[8px] p-[10px_8px] text-center">
          <div className="text-[1.5rem] font-extrabold text-[#dc2626] tracking-tight">
            {analytics.negative_count}
          </div>
          <div className="text-[0.62rem] text-[#9ca3af] font-bold uppercase tracking-[0.08em] mt-[2px]">At-Risk</div>
        </div>
        <div className="bg-white border-[0.5px] border-[#f1f5f9] border-t-[3px] border-t-[#10b981] rounded-[8px] p-[10px_8px] text-center">
          <div className="text-[1.5rem] font-extrabold text-[#10b981] tracking-tight">
            {analytics.positive_count}
          </div>
          <div className="text-[0.62rem] text-[#9ca3af] font-bold uppercase tracking-[0.08em] mt-[2px]">Safe</div>
        </div>
      </div>

      {/* History */}
      <div className="text-[0.68rem] font-bold text-[#0F766E] uppercase tracking-[0.1em] mb-[8px] pb-[8px] border-b border-[#f1f5f9]">
        Recent history
      </div>
      {analytics.history.length === 0 ? (
        <div className="text-[0.75rem] text-[#c4c9d0] text-center py-[24px]">
          No analyses yet
        </div>
      ) : (
        analytics.history.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-[8px] py-[6px] border-b border-[#f9fafb] last:border-none"
          >
            <span
              className={`text-[0.72rem] font-bold min-w-[60px] ${
                entry.cls === 'Suicidal' ? 'text-[#dc2626]' : 'text-[#0F6E56]'
              }`}
            >
              {entry.cls}
            </span>
            <span className="text-[0.68rem] text-[#9ca3af] min-w-[38px]">{entry.ts}</span>
            <span className="text-[0.7rem] text-[#6b7280] truncate flex-1">{entry.txt}</span>
          </div>
        ))
      )}
    </div>
  )
}
