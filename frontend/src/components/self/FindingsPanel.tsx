import type {
  AnalysisSession,
  PlatformBreakdown,
  SocioeconomicSignal,
  TopPost,
} from '../../types/self'
import { formatDate, riskLevelTone, platformLabelByKey } from '../../lib/selfPlatformConfig'
import { useSelfStore } from '../../store/selfStore'
import SelfStatusBadge, { type BadgeTone } from './SelfStatusBadge'

interface Props {
  session: AnalysisSession
}

const TONE_MAP: Record<string, BadgeTone> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  neutral: 'neutral',
  critical: 'critical',
}

function flattenSignals(
  socioeconomic: FindingsSocioeconomicLike | null | undefined,
): SocioeconomicSignal[] {
  if (!socioeconomic) return []
  if (Array.isArray(socioeconomic)) return socioeconomic
  return Object.values(socioeconomic).flat()
}

type FindingsSocioeconomicLike = SocioeconomicSignal[] | Record<string, SocioeconomicSignal[]>

function TrendBadge({ direction }: { direction: string }) {
  if (direction === 'rising') {
    return <SelfStatusBadge tone="warning">Rising</SelfStatusBadge>
  }
  if (direction === 'falling') {
    return <SelfStatusBadge tone="success">Improving</SelfStatusBadge>
  }
  if (direction === 'stable') {
    return <SelfStatusBadge tone="neutral">Stable</SelfStatusBadge>
  }
  return <SelfStatusBadge tone="neutral">Insufficient data</SelfStatusBadge>
}

function riskPercent(score: number | null | undefined): string {
  if (score == null) return '—'
  return `${(score * 100).toFixed(0)}%`
}

function TopPostRow({ post, labelByKey }: { post: TopPost; labelByKey: (k: string) => string }) {
  const meta = riskLevelTone(post.level)
  return (
    <div className="flex items-start gap-[10px] py-[9px] border-b border-[#f3f4f6] last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-[0.8rem] text-[#1f2937] leading-snug line-clamp-2">{post.text}</div>
        <div className="text-[0.68rem] text-[#9ca3af] mt-[3px]">
          {labelByKey(post.platform)}
          {post.date ? ` · ${formatDate(post.date)}` : ''}
        </div>
      </div>
      <span
        className={`text-[0.68rem] font-bold uppercase tracking-wide px-[7px] py-[2px] rounded-full flex-shrink-0 ${
          post.level === 'critical'
            ? 'bg-[#fecaca] text-[#7f1d1d]'
            : post.level === 'high'
              ? 'bg-[#fee2e2] text-[#991b1b]'
              : post.level === 'moderate'
                ? 'bg-[#fef3c7] text-[#92400e]'
                : 'bg-[#d1fae5] text-[#065f46]'
        }`}
        title={meta.label}
      >
        {riskPercent(post.risk_score)}
      </span>
    </div>
  )
}

function BreakdownBar({ item, labelByKey }: { item: PlatformBreakdown; labelByKey: (k: string) => string }) {
  const total = Object.values(item.distribution || {}).reduce((a, b) => a + b, 0)
  const highCount = (item.distribution?.high || 0) + (item.distribution?.critical || 0)
  const display = labelByKey(item.platform)
  return (
    <div className="py-[8px]">
      <div className="flex items-center justify-between gap-[8px] mb-[6px]">
        <div className="text-[0.8rem] font-semibold text-[#1f2937]">{display}</div>
        <div className="text-[0.72rem] text-[#6b7280]">
          {total} post{total === 1 ? '' : 's'} · avg {riskPercent(item.average_risk)}
        </div>
      </div>
      <div className="flex items-center gap-[8px]">
        <div className="flex-1 h-[8px] rounded-full bg-[#f3f4f6] overflow-hidden flex">
          <div
            className="h-full bg-[#22c55e]"
            style={{ width: `${((item.distribution?.low || 0) / Math.max(1, total)) * 100}%` }}
          />
          <div
            className="h-full bg-[#f59e0b]"
            style={{ width: `${((item.distribution?.moderate || 0) / Math.max(1, total)) * 100}%` }}
          />
          <div
            className="h-full bg-[#f97316]"
            style={{ width: `${((item.distribution?.high || 0) / Math.max(1, total)) * 100}%` }}
          />
          <div
            className="h-full bg-[#ef4444]"
            style={{ width: `${((item.distribution?.critical || 0) / Math.max(1, total)) * 100}%` }}
          />
        </div>
        {highCount > 0 && (
          <span className="text-[0.7rem] font-semibold text-[#dc2626] flex-shrink-0">{highCount} flagged</span>
        )}
      </div>
    </div>
  )
}

export default function FindingsPanel({ session }: Props) {
  const platforms = useSelfStore((s) => s.platforms)
  const findings = session.findings
  const labelByKey = (k: string) => platformLabelByKey(k, platforms)

  if (!findings) {
    const platformProgress = session.progress?.platforms || {}
    const emptyPlatforms = Object.keys(platformProgress).filter(
      (k) => platformProgress[k]?.status === 'no_data',
    ).length
    return (
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-[20px]">
        <h3 className="text-[0.95rem] font-bold text-[#1f2937] mb-[4px]">Analysis results</h3>
        <p className="text-[0.82rem] text-[#6b7280] leading-relaxed">
          No findings were generated for this session.
          {emptyPlatforms > 0
            ? ` We checked ${emptyPlatforms} connected platform${emptyPlatforms === 1 ? '' : 's'} but no public
              posts could be retrieved. This can happen when a profile is private, has no public posts,
              or when platform access is restricted. Connect a platform with public activity and re-run
              to get meaningful results.`
            : ''}
        </p>
      </div>
    )
  }

  const overall = riskLevelTone(findings.overall_level)
  const signals = flattenSignals(findings.socioeconomic).slice(0, 6)
  const displayPlatforms = findings.platforms?.length
    ? findings.platforms.map((p) => p.platform)
    : findings.platforms_analyzed

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-[20px]">
      <h3 className="text-[0.95rem] font-bold text-[#1f2937] mb-[14px]">Analysis results</h3>

      <div className="flex flex-wrap items-center gap-[10px] mb-[14px]">
        <div className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-lg bg-[#f8fafc] border border-[#e5e7eb]">
          <div className="text-[0.68rem] uppercase tracking-wide text-[#6b7280] font-bold">Wellbeing</div>
          <SelfStatusBadge tone={TONE_MAP[overall.tone]}>{overall.label}</SelfStatusBadge>
          <div className="text-[0.72rem] text-[#4b5563] font-medium">({riskPercent(findings.overall_risk)})</div>
        </div>
        <div className="flex items-center gap-[8px]">
          <span className="text-[0.68rem] uppercase tracking-wide text-[#6b7280] font-bold">Trend</span>
          <TrendBadge direction={findings.trend?.direction || 'insufficient_data'} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-[10px] mb-[8px]">
        <div className="px-[12px] py-[9px] rounded-lg bg-[#f8fafc] border border-[#e5e7eb]">
          <div className="text-[0.65rem] uppercase tracking-wide text-[#6b7280] font-bold">Platforms</div>
          <div className="text-[1.05rem] font-bold text-[#1f2937]">{displayPlatforms.length}</div>
        </div>
        <div className="px-[12px] py-[9px] rounded-lg bg-[#f8fafc] border border-[#e5e7eb]">
          <div className="text-[0.65rem] uppercase tracking-wide text-[#6b7280] font-bold">Posts analysed</div>
          <div className="text-[1.05rem] font-bold text-[#1f2937]">{findings.posts_analyzed}</div>
        </div>
        <div className="px-[12px] py-[9px] rounded-lg bg-[#f8fafc] border border-[#e5e7eb]">
          <div className="text-[0.65rem] uppercase tracking-wide text-[#6b7280] font-bold">Sessions</div>
          <div className="text-[1.05rem] font-bold text-[#1f2937]">{formatDate(session.started_at)}</div>
        </div>
      </div>

      {findings.trend?.description ? (
        <p className="text-[0.8rem] text-[#6b7280] leading-relaxed mb-[16px]">{findings.trend.description}</p>
      ) : null}

      {findings.top_posts?.length ? (
        <div className="mb-[8px]">
          <h4 className="text-[0.72rem] uppercase tracking-wide text-[#6b7280] font-bold mb-[4px]">Posts with flagged language</h4>
          <div className="divide-y divide-[#f3f4f6]">
            {findings.top_posts.slice(0, 4).map((post, i) => (
              <TopPostRow key={`${post.platform}-${i}`} post={post} labelByKey={labelByKey} />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-[12px] py-[10px] rounded-lg bg-[#f0fdfa] border border-[#a7f3d0] text-[0.78rem] text-[#065f46] mb-[8px]">
          No flagged language detected across the posts analysed.
        </div>
      )}

      {findings.platforms?.length ? (
        <div className="mb-[8px]">
          <h4 className="text-[0.72rem] uppercase tracking-wide text-[#6b7280] font-bold mb-[4px]">By platform</h4>
          {findings.platforms.map((item) => (
            <BreakdownBar key={item.platform} item={item} labelByKey={labelByKey} />
          ))}
          <div className="flex items-center gap-[12px] pt-[6px]">
            <div className="flex items-center gap-[4px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#22c55e]" />
              <span className="text-[0.62rem] text-[#6b7280]">Low</span>
            </div>
            <div className="flex items-center gap-[4px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#f59e0b]" />
              <span className="text-[0.62rem] text-[#6b7280]">Moderate</span>
            </div>
            <div className="flex items-center gap-[4px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#f97316]" />
              <span className="text-[0.62rem] text-[#6b7280]">High</span>
            </div>
            <div className="flex items-center gap-[4px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#ef4444]" />
              <span className="text-[0.62rem] text-[#6b7280]">Critical</span>
            </div>
          </div>
        </div>
      ) : null}

      {signals.length ? (
        <div className="mb-[8px]">
          <h4 className="text-[0.72rem] uppercase tracking-wide text-[#6b7280] font-bold mb-[6px]">Keywords detected</h4>
          <div className="flex flex-wrap gap-[6px]">
            {signals.map((s, i) => (
              <span key={`${s.keyword}-${i}`} className="px-[8px] py-[3px] rounded-full bg-[#f8fafc] border border-[#e5e7eb] text-[0.72rem] text-[#4b5563]">
                {s.keyword}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {session.insights?.length ? (
        <div className="mb-[8px]">
          <h4 className="text-[0.72rem] uppercase tracking-wide text-[#6b7280] font-bold mb-[6px]">Insights</h4>
          <ul className="flex flex-col gap-[6px]">
            {session.insights.slice(0, 5).map((insight, i) => (
              <li key={i} className="flex items-start gap-[8px] text-[0.8rem] text-[#1f2937] leading-snug">
                <i className="ti ti-point-filled text-[10px] mt-[5px] text-[#0F766E] flex-shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {session.recommendations?.length ? (
        <div>
          <h4 className="text-[0.72rem] uppercase tracking-wide text-[#6b7280] font-bold mb-[6px]">Recommended next steps</h4>
          <ul className="flex flex-col gap-[8px]">
            {session.recommendations.slice(0, 5).map((rec, i) => (
              <li key={i} className="flex items-start gap-[8px] text-[0.8rem] text-[#1f2937] leading-snug">
                <i className="ti ti-arrow-right-circle text-[15px] mt-[1px] text-[#0F766E] flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}