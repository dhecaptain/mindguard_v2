import { useEffect, useState } from 'react'
import { getStudentTimeline } from '../../api/counsellor'
import { getRiskLabel } from '../../types'
import type { TimelineEntry } from '../../types'

interface Props {
  studentId: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Simple responsive SVG line chart
function RiskLineChart({ entries }: { entries: TimelineEntry[] }) {
  const W = 600
  const H = 200
  const PAD = { top: 16, right: 20, bottom: 40, left: 40 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const xs = entries.map((_, i) => PAD.left + (i / Math.max(entries.length - 1, 1)) * chartW)
  const ys = entries.map((e) => PAD.top + (1 - e.score) * chartH)

  const pathD =
    entries.length === 1
      ? `M ${xs[0]} ${ys[0]}`
      : xs.map((x, i) => (i === 0 ? `M ${x} ${ys[i]}` : `L ${x} ${ys[i]}`)).join(' ')

  // Current risk color from last entry
  const last = entries[entries.length - 1]
  const lineColor = last ? getRiskLabel(last.score).color : '#0F766E'

  // Reference lines [y-value, label, color]
  const refs: Array<{ score: number; label: string; color: string }> = [
    { score: 0.35, label: 'Low→Mod', color: '#f59e0b' },
    { score: 0.55, label: 'Mod→High', color: '#f97316' },
    { score: 0.75, label: 'High→Crit', color: '#ef4444' },
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
      {/* Reference lines */}
      {refs.map((ref) => {
        const ry = PAD.top + (1 - ref.score) * chartH
        return (
          <g key={ref.score}>
            <line
              x1={PAD.left}
              x2={PAD.left + chartW}
              y1={ry}
              y2={ry}
              stroke={ref.color}
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.6}
            />
            <text x={PAD.left + chartW + 2} y={ry + 3} fontSize={8} fill={ref.color}>
              {ref.label}
            </text>
          </g>
        )
      })}

      {/* Y axis ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map((v) => {
        const ry = PAD.top + (1 - v) * chartH
        return (
          <g key={v}>
            <line x1={PAD.left - 4} x2={PAD.left} y1={ry} y2={ry} stroke="#d1d5db" strokeWidth={1} />
            <text x={PAD.left - 6} y={ry + 3} fontSize={9} fill="#9ca3af" textAnchor="end">
              {(v * 100).toFixed(0)}
            </text>
          </g>
        )
      })}

      {/* X axis labels — show up to 7 evenly spaced */}
      {entries
        .filter((_, i) => {
          if (entries.length <= 7) return true
          const step = Math.ceil(entries.length / 6)
          return i % step === 0 || i === entries.length - 1
        })
        .map((e, _idx, arr) => {
          const origIdx = entries.indexOf(e)
          return (
            <text
              key={e.date}
              x={xs[origIdx]}
              y={H - PAD.bottom + 14}
              fontSize={8}
              fill="#9ca3af"
              textAnchor="middle"
            >
              {formatDate(e.date)}
            </text>
          )
        })}

      {/* Risk line */}
      {entries.length > 1 && (
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />
      )}

      {/* Data points */}
      {entries.map((e, i) => {
        const { color } = getRiskLabel(e.score)
        const isAlert = !!e.alert
        return (
          <g key={e.date}>
            <circle
              cx={xs[i]}
              cy={ys[i]}
              r={isAlert ? 5 : 3}
              fill={isAlert ? '#ef4444' : color}
              stroke="white"
              strokeWidth={isAlert ? 2 : 1}
            />
            {isAlert && (
              <title>Alert: risk {(e.score * 100).toFixed(0)}% on {formatDate(e.date)}</title>
            )}
          </g>
        )
      })}

      {/* Axis lines */}
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + chartH} stroke="#e5e7eb" strokeWidth={1} />
      <line x1={PAD.left} x2={PAD.left + chartW} y1={PAD.top + chartH} y2={PAD.top + chartH} stroke="#e5e7eb" strokeWidth={1} />
    </svg>
  )
}

export default function StudentTimeline({ studentId }: Props) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getStudentTimeline(studentId)
      .then((data) => {
        if (!cancelled) setEntries(data)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [studentId])

  if (loading) {
    return (
      <div className="flex items-center gap-[8px] py-[20px] text-[#6b7280] text-[0.82rem]">
        <div className="w-[18px] h-[18px] border-2 border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin flex-shrink-0" />
        Loading timeline...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-[6px] py-[12px] text-[#ef4444] text-[0.82rem]">
        <i className="ti ti-alert-circle text-[16px]" />
        {error}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[32px] text-[#9ca3af]">
        <i className="ti ti-chart-line text-[28px] mb-[6px]" />
        <span className="text-[0.82rem]">No timeline data yet. Run an analysis to populate the risk timeline.</span>
      </div>
    )
  }

  const last = entries[entries.length - 1]
  const { label, color } = getRiskLabel(last.score)

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center gap-[10px]">
        <span
          className="px-[8px] py-[2px] rounded-full text-[0.72rem] font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
        <span className="text-[0.78rem] text-[#6b7280]">
          Latest: {(last.score * 100).toFixed(0)}% · {last.top_platform || '—'} · {last.n_posts} posts
        </span>
        {entries.some((e) => e.alert) && (
          <span className="flex items-center gap-[4px] text-[#ef4444] text-[0.72rem]">
            <i className="ti ti-circle-filled text-[8px]" /> Alert markers shown in red
          </span>
        )}
      </div>
      <RiskLineChart entries={entries} />
    </div>
  )
}
