import { usePlatformStore } from '../store'
import Plot from 'react-plotly.js'
import { getRiskLabel, formatPercent } from '../types'
import SocioEconomicPanel from '../components/analysis/SocioEconomicPanel'

export default function MultiPlatformPage() {
  const { reddit, bluesky, mastodon, youtube, file, facebook, twitter, video } = usePlatformStore()

  const platforms: Record<string, { overall: number; n_posts: number; n_high: number; signals?: Record<string, any> }> = {}
  if (reddit) platforms['Reddit'] = reddit
  if (bluesky) platforms['Bluesky'] = bluesky
  if (mastodon) platforms['Mastodon'] = mastodon
  if (youtube) platforms['YouTube'] = youtube
  if (file) platforms['File Upload'] = file
  if (facebook) platforms['Facebook'] = facebook
  if (twitter) platforms['Twitter/X'] = twitter
  if (video?.ok) platforms['Video'] = { overall: video.risk, n_posts: 1, n_high: video.risk >= 0.55 ? 1 : 0 }

  const platformKeys = Object.keys(platforms)

  if (platformKeys.length === 0) {
    return (
      <div className="flex flex-col gap-[14px]">
        <h2 className="text-[1.1rem] font-bold text-[#1f2937]">Multi-Platform Unified Risk Profile</h2>
        <p className="text-[0.74rem] text-[#6b7280] -mt-[10px]">
          Combines results from all platforms already analysed this session.
        </p>
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[60px_20px] flex flex-col items-center text-[#6b7280] gap-[8px]">
          <i className="ti ti-share text-[24px]" />
          <p className="text-[0.74rem]">No platforms analysed yet.</p>
          <p className="text-[0.68rem]">Go to each tab and run an analysis first.</p>
        </div>
      </div>
    )
  }

  const allScores = platformKeys.map((k) => platforms[k].overall)
  const unifiedScore = allScores.reduce((a, b) => a + b, 0) / allScores.length
  const unifiedLabel = getRiskLabel(unifiedScore)

  const combinedSignals: Record<string, any[]> = {}
  for (const key of platformKeys) {
    const p = platforms[key]
    if (p.signals) {
      for (const [cat, items] of Object.entries(p.signals)) {
        if (!combinedSignals[cat]) combinedSignals[cat] = []
        for (const item of items as any[]) {
          if (!combinedSignals[cat].find((x) => x.keyword === item.keyword)) {
            combinedSignals[cat].push(item)
          }
        }
      }
    }
  }

  const barColors = platformKeys.map((k) => {
    const s = platforms[k].overall
    if (s < 0.35) return '#22c55e'
    if (s < 0.55) return '#f59e0b'
    if (s < 0.75) return '#f97316'
    return '#ef4444'
  })

  return (
    <div className="flex flex-col gap-[14px]">
      <h2 className="text-[1.1rem] font-bold text-[#1f2937]">Multi-Platform Unified Risk Profile</h2>
      <p className="text-[0.74rem] text-[#6b7280] -mt-[10px]">
        Combines results from all platforms already analysed this session.
      </p>

      {/* Unified score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[12px_14px] text-center">
          <div className="text-[1.2rem] font-extrabold" style={{ color: unifiedLabel.color }}>
            {formatPercent(unifiedScore)}
          </div>
          <div className="text-[0.55rem] text-[#9ca3af] font-bold uppercase tracking-[0.08em] mt-[2px]">Unified Risk Score</div>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[12px_14px] text-center">
          <div className="text-[1.2rem] font-extrabold text-[#0F766E]">{platformKeys.length}</div>
          <div className="text-[0.55rem] text-[#9ca3af] font-bold uppercase tracking-[0.08em] mt-[2px]">Platforms Analysed</div>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[12px_14px] text-center col-span-2">
          <div
            className="inline-block px-[14px] py-[4px] rounded-[8px] text-[0.82rem] font-bold"
            style={{
              background: `${unifiedLabel.color}22`,
              color: unifiedLabel.color,
              border: `1.5px solid ${unifiedLabel.color}`,
            }}
          >
            {unifiedLabel.label} — Unified across {platformKeys.length} platform(s)
          </div>
        </div>
      </div>

      {unifiedScore >= 0.55 && (
        <div className="bg-[#fef2f2] border-[0.5px] border-[#fecaca] rounded-[7px] p-[10px_14px] text-[0.74rem] text-[#991b1b] font-semibold flex items-center gap-[8px]">
          <i className="ti ti-alert-triangle text-[16px]" />
          CRISIS ALERT — Elevated risk detected across multiple platforms.
        </div>
      )}

      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
        <div className="text-[0.78rem] font-bold text-[#1f2937] mb-[10px] pb-[8px] border-b border-[#f1f5f9]">
          Platform Breakdown
        </div>
        <Plot
          data={[
            {
              type: 'bar',
              x: platformKeys,
              y: platformKeys.map((k) => platforms[k].overall),
              marker: { color: barColors },
              text: platformKeys.map((k) => formatPercent(platforms[k].overall)),
              textposition: 'outside',
              textfont: { color: '#4b5563', size: 10 },
            },
          ]}
          layout={{
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#ffffff',
            font: { color: '#4b5563', size: 10 },
            yaxis: { tickformat: '.0%', range: [0, 1.1], gridcolor: '#e5e7eb', color: '#4b5563' },
            xaxis: { color: '#4b5563' },
            margin: { l: 30, r: 20, t: 10, b: 30 },
            height: 220,
            showlegend: false,
            shapes: [
              {
                type: 'line',
                xref: 'paper', yref: 'y',
                x0: 0, x1: 1,
                y0: unifiedScore, y1: unifiedScore,
                line: { dash: 'dot', color: '#0F6E56', width: 1.5 },
              },
            ],
            annotations: [
              {
                x: 1, y: unifiedScore,
                xref: 'paper', yref: 'y',
                text: `Unified avg: ${formatPercent(unifiedScore)}`,
                showarrow: false,
                font: { size: 9, color: '#0F6E56' },
                xanchor: 'right',
                yanchor: 'bottom',
              },
            ],
          }}
          config={{ displayModeBar: false }}
          className="w-full"
        />
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
        <div className="text-[0.78rem] font-bold text-[#1f2937] mb-[10px] pb-[8px] border-b border-[#f1f5f9]">
          Detail Table
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.7rem]">
            <thead>
              <tr className="text-[#6b7280] font-semibold uppercase text-[0.6rem] tracking-wider">
                <th className="text-left py-[6px] px-[8px]">Platform</th>
                <th className="text-right py-[6px] px-[8px]">Posts</th>
                <th className="text-right py-[6px] px-[8px]">Overall Risk</th>
                <th className="text-right py-[6px] px-[8px]">High-Risk Posts</th>
                <th className="text-right py-[6px] px-[8px]">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {platformKeys.map((key) => {
                const p = platforms[key]
                const { label, color } = getRiskLabel(p.overall)
                return (
                  <tr key={key} className="border-t border-[#f1f5f9]">
                    <td className="py-[6px] px-[8px] font-medium">{key}</td>
                    <td className="text-right py-[6px] px-[8px]">{p.n_posts}</td>
                    <td className="text-right py-[6px] px-[8px]">{formatPercent(p.overall)}</td>
                    <td className="text-right py-[6px] px-[8px]">{p.n_high}</td>
                    <td className="text-right py-[6px] px-[8px]">
                      <span style={{ color }} className="font-semibold">{label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Combined socio-economic signals */}
      {Object.keys(combinedSignals).length > 0 && (
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_18px]">
          <div className="text-[0.78rem] font-bold text-[#1f2937] mb-[10px] pb-[8px] border-b border-[#f1f5f9]">
            Combined Socio-Economic Signals
          </div>
          <SocioEconomicPanel signals={combinedSignals} />
        </div>
      )}
    </div>
  )
}
