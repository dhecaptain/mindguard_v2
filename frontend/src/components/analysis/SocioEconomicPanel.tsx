import type { SocioeconomicSignal } from '../../types'
import Plot from 'react-plotly.js'

interface SocioEconomicPanelProps {
  signals: Record<string, SocioeconomicSignal[]>
}

const CATEGORY_COLORS: Record<string, string> = {
  Employment: '#0F766E',
  Housing: '#7c3aed',
  Financial: '#dc2626',
  Relationships: '#f59e0b',
  Health: '#0891b2',
  'Social & Education': '#be185d',
}

export default function SocioEconomicPanel({ signals }: SocioEconomicPanelProps) {
  const activeCategories = Object.entries(signals).filter(([, items]) => items.length > 0)

  if (activeCategories.length === 0) {
    return (
      <div className="text-center py-[30px] text-[#9ca3af] text-[0.72rem]">
        No socio-economic distress signals detected.
      </div>
    )
  }

  return (
    <div className="space-y-[10px]">
      {activeCategories.length > 1 && (
        <Plot
          data={[
            {
              type: 'pie',
              values: activeCategories.map(([, items]) => items.length),
              labels: activeCategories.map(([cat]) => cat),
              marker: {
                colors: activeCategories.map(([cat]) => CATEGORY_COLORS[cat] || '#6b7280'),
              },
              hole: 0.4,
              textinfo: 'label+percent',
              textfont: { size: 10 },
            },
          ]}
          layout={{
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#4b5563' },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            height: 180,
            showlegend: false,
          }}
          config={{ displayModeBar: false }}
          className="w-full"
        />
      )}
      {activeCategories.map(([cat, items]) => (
        <div key={cat} className="border border-[#0F766E] rounded-[8px] p-[10px_12px]">
          <div className="flex items-center gap-[6px] mb-[6px]">
            <div
              className="w-[8px] h-[8px] rounded-full"
              style={{ background: CATEGORY_COLORS[cat] || '#6b7280' }}
            />
            <span className="text-[0.68rem] font-bold text-[#1f2937]">{cat}</span>
            <span className="text-[0.6rem] text-[#9ca3af] ml-auto">{items.length} signal(s)</span>
          </div>
          <div className="space-y-[3px]">
            {items.map((item, i) => (
              <div key={i} className="text-[0.65rem] text-[#4b5563] bg-[#fafbfc] rounded-[4px] p-[4px_6px]">
                <span className="font-semibold text-[#0F766E]">"{item.keyword}"</span>
                <span className="text-[#9ca3af]"> — </span>
                {item.snippet}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
