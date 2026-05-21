import Plot from 'react-plotly.js'
import type { PostData } from '../../types'

interface TimelineChartProps {
  posts: PostData[]
  dateCol?: string
  scoreCol?: string
}

export default function TimelineChart({ posts, dateCol = 'date', scoreCol = 'risk_score' }: TimelineChartProps) {
  const parsed = posts
    .map((p) => ({ ...p, parsedDate: new Date(p[dateCol as keyof PostData] as string) }))
    .filter((p) => !isNaN(p.parsedDate.getTime()))

  if (parsed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-[#c4c9d0] gap-[5px]">
        <i className="ti ti-chart-line text-[22px]" />
        <span className="text-[0.65rem]">Run an analysis to see the risk timeline</span>
      </div>
    )
  }

  const weeklyMap = new Map<string, { scores: number[] }>()
  parsed.forEach((p) => {
    const d = p.parsedDate
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    if (!weeklyMap.has(key)) weeklyMap.set(key, { scores: [] })
    weeklyMap.get(key)!.scores.push(p[scoreCol as keyof PostData] as number)
  })

  const weeks = Array.from(weeklyMap.entries()).sort(([a], [b]) => a.localeCompare(b))

  return (
    <Plot
      data={[
        {
          x: weeks.map(([w]) => w),
          y: weeks.map(([, v]) => v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Weekly avg risk',
          line: { color: '#0F766E', width: 2 },
          marker: { color: '#0F766E', size: 5 },
        },
        {
          type: 'bar',
          x: weeks.map(([w]) => w),
          y: weeks.map(([, v]) => v.scores.length),
          name: 'Post count',
          yaxis: 'y2',
          marker: { color: 'rgba(15,118,110,0.12)' },
        },
      ]}
      layout={{
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: '#ffffff',
        font: { color: '#4b5563', size: 10 },
        xaxis: { title: '', gridcolor: '#f1f5f9', color: '#9ca3af' },
        yaxis: { title: 'Risk Score', range: [0, 1], tickformat: '.0%', gridcolor: '#f1f5f9', color: '#9ca3af' },
        yaxis2: { title: 'Posts', overlaying: 'y', side: 'right', showgrid: false, color: '#9ca3af' },
        margin: { l: 40, r: 40, t: 10, b: 30 },
        height: 200,
        showlegend: true,
        legend: { orientation: 'h', y: 1.1, font: { size: 9 } },
        shapes: [
          { type: 'rect', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 0, y1: 0.35, fillcolor: 'rgba(34,197,94,0.05)', line: { width: 0 }, layer: 'below' },
          { type: 'rect', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 0.35, y1: 0.55, fillcolor: 'rgba(245,158,11,0.05)', line: { width: 0 }, layer: 'below' },
          { type: 'rect', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 0.55, y1: 0.75, fillcolor: 'rgba(249,115,22,0.05)', line: { width: 0 }, layer: 'below' },
          { type: 'rect', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 0.75, y1: 1, fillcolor: 'rgba(239,68,68,0.05)', line: { width: 0 }, layer: 'below' },
        ],
        annotations: [
          { x: 1, y: 0.175, xref: 'paper', yref: 'y', text: 'Low', showarrow: false, font: { size: 8, color: '#22c55e' } },
          { x: 1, y: 0.45, xref: 'paper', yref: 'y', text: 'Moderate', showarrow: false, font: { size: 8, color: '#f59e0b' } },
          { x: 1, y: 0.65, xref: 'paper', yref: 'y', text: 'High', showarrow: false, font: { size: 8, color: '#f97316' } },
          { x: 1, y: 0.875, xref: 'paper', yref: 'y', text: 'Critical', showarrow: false, font: { size: 8, color: '#ef4444' } },
        ],
      }}
      config={{ displayModeBar: false, responsive: true }}
      className="w-full"
    />
  )
}
