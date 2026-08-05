import { useCallback } from 'react'
import type { RosterUploadSummary } from '../../types'

function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function downloadErrors(summary: RosterUploadSummary) {
  const header = ['row_number', 'student_id', 'student_email', 'error']
  const lines = [header.join(',')]
  for (const e of summary.errors) {
    const row = e.row || {}
    lines.push(
      [e.row_number ?? '', csvCell(row.student_id), csvCell(row.student_email), csvCell(e.error)].join(','),
    )
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `mindguard-roster-errors-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function RosterErrorReport({ summary }: { summary: RosterUploadSummary }) {
  const onDownload = useCallback(() => downloadErrors(summary), [summary])

  if (summary.errors.length === 0) return null

  return (
    <div className="mt-[10px] rounded-[10px] bg-[#fef2f2] border border-[#fecaca] px-[14px] py-[10px] text-[0.82rem]">
      <div className="flex items-center justify-between gap-[10px]">
        <span className="font-bold text-[#991b1b]">{summary.errors.length} row(s) failed validation</span>
        <button
          onClick={onDownload}
          className="flex items-center gap-[6px] px-[10px] py-[5px] bg-white border border-[#fecaca] text-[#991b1b] rounded-[7px] text-[0.76rem] font-semibold cursor-pointer hover:bg-[#fee2e2] transition-colors"
        >
          <i className="ti ti-download text-[13px]" />
          Download error report (CSV)
        </button>
      </div>
      <div className="mt-[6px] max-h-[120px] overflow-y-auto text-[0.76rem] text-[#991b1b]">
        {summary.errors.slice(0, 20).map((e, i) => (
          <div key={i}>
            Row {e.row_number ?? '?'}: {e.error}
          </div>
        ))}
        {summary.errors.length > 20 && (
          <div className="text-[#6b7280]">…and {summary.errors.length - 20} more (see CSV)</div>
        )}
      </div>
    </div>
  )
}
