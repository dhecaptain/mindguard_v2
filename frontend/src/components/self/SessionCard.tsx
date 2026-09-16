import type { AnalysisSession } from '../../types/self'
import { formatDateTime, platformLabelByKey, riskLevelTone } from '../../lib/selfPlatformConfig'
import { useSelfStore } from '../../store/selfStore'
import SelfStatusBadge, { type BadgeTone } from './SelfStatusBadge'

interface Props {
  session: AnalysisSession
  onOpen: (id: string) => void
}

const TONE_MAP: Record<string, BadgeTone> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  neutral: 'neutral',
  critical: 'critical',
}

function statusBadge(session: AnalysisSession) {
  switch (session.status) {
    case 'completed':
      return <SelfStatusBadge tone="success">Completed</SelfStatusBadge>
    case 'no_data':
      return <SelfStatusBadge tone="warning">No public posts</SelfStatusBadge>
    case 'partial':
      return <SelfStatusBadge tone="warning">Partial</SelfStatusBadge>
    case 'failed':
      return <SelfStatusBadge tone="danger">Failed</SelfStatusBadge>
    case 'running':
      return <SelfStatusBadge tone="running" pulse>Running</SelfStatusBadge>
    default:
      return <SelfStatusBadge tone="neutral">{session.status}</SelfStatusBadge>
  }
}

export default function SessionCard({ session, onOpen }: Props) {
  const platforms = useSelfStore((s) => s.platforms)
  const level = riskLevelTone(session.findings?.overall_level)

  const platformNames = session.platforms?.length
    ? session.platforms.map((p) => platformLabelByKey(p, platforms)).join(', ')
    : '—'

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-[16px] flex items-center gap-[14px]">
      <div className="w-[40px] h-[40px] rounded-lg bg-[#f0fdfa] flex items-center justify-center flex-shrink-0">
        <i className="ti ti-report-analytics text-[20px] text-[#0F766E]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] flex-wrap">
          <span className="text-[0.86rem] font-bold text-[#1f2937]">{platformNames}</span>
          {statusBadge(session)}
          {session.findings?.overall_level ? (
            <SelfStatusBadge tone={TONE_MAP[level.tone]}>{level.label}</SelfStatusBadge>
          ) : null}
        </div>
        <div className="text-[0.73rem] text-[#6b7280] mt-[3px]">
          {formatDateTime(session.started_at)}
          {session.findings ? ` · ${session.findings.posts_analyzed} posts analysed` : ''}
        </div>
      </div>
      <button
        onClick={() => onOpen(session.id)}
        className="flex items-center gap-[4px] text-[0.78rem] font-semibold text-[#0F766E] hover:text-[#115E59] cursor-pointer bg-transparent border-none whitespace-nowrap"
      >
        View report
        <i className="ti ti-chevron-right text-[14px]" />
      </button>
    </div>
  )
}