import { useState, useEffect } from 'react'
import { useAnalysisStore, usePlatformStore, useUiStore } from '../store'
import { formatPercent, getRiskLabel } from '../types'
import api from '../api/client'

export default function DashboardPage() {
  const setPage = useUiStore((state) => state.setPage)
  const { analytics, lastResult } = useAnalysisStore()
  const { reddit, bluesky, mastodon, youtube, file, facebook, twitter, video } = usePlatformStore()

  const platformResults = [
    ['Reddit', reddit],
    ['Bluesky', bluesky],
    ['Mastodon', mastodon],
    ['YouTube', youtube],
    ['File Upload', file],
    ['Facebook', facebook],
    ['Twitter / X', twitter],
  ] as const

  // Per-platform analysis state from durable sessions
  // overall: mean risk score, nHigh: high-risk count, nPosts: items analysed,
  // status: 'connected' | 'analysed' | 'not_connected'
  const [platformAnalysis, setPlatformAnalysis] = useState<Record<string, {
    overall?: number
    nHigh?: number
    nPosts?: number
    status: 'connected' | 'analysed' | 'not_connected'
  }>>({})

  // Count platforms that have been analysed (status === 'analysed')
  const analysedEntries = Object.entries(platformAnalysis).filter(([, s]) => s.status === 'analysed')
  const platformCount = analysedEntries.length
  const postCount = analysedEntries.reduce((sum, [, s]) => sum + (s.nPosts || 0), 0)
  const highRiskCount = analysedEntries.reduce((sum, [, s]) => sum + (s.nHigh || 0), 0)

  // Compute scores from analysed platforms only
  const scores = [
    ...analysedEntries.map(([, s]) => s.overall).filter(Boolean) as number[],
    ...(video ? [video.risk] : []) as number[],
  ]
  const unifiedScore = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  const single = lastResult ? getRiskLabel(lastResult.prob) : null

  // Social accounts state (loaded from backend /self/social-accounts)
  const [socialAccounts, setSocialAccounts] = useState<any[]>([])
  const [hasError, setHasError] = useState<boolean>(false)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  // Analysis history sessions
  const [analysisSessions, setAnalysisSessions] = useState<any[]>([])
  const [sessionsLoaded, setSessionsLoaded] = useState<boolean>(false)

  useEffect(() => {
    api.get('/self/social-accounts').then(({ data }) => setSocialAccounts(data.accounts || [])).catch((_e: unknown) => {
      setHasError(true)
    })
  }, [])

  useEffect(() => {
    api.get('/self/analysis-sessions').then(({ data }) => {
      setAnalysisSessions(data.sessions || [])
      setSessionsLoaded(true)
    }).catch(() => {})
  }, [])

  const handleAnalyzeSelf = async (platform: string) => {
    const account = socialAccounts.find((a: any) => a.platform === platform)
    if (!account) {
      setHasError(true)
      return
    }
    setIsAnalyzing(true)
    setHasError(false)
    try {
      const body: any = { platform, handle: account.handle, text: account.handle }
      const resp = await api.post('/self/analyze', body)
      const data = resp.data

      const { data: sessionsData } = await api.get('/self/analysis-sessions')
      const session = sessionsData.sessions.find(
        (s: any) => s.analysis_type === 'social_wellbeing' && s.platforms_json
      )

      if (session && data.platform_data_available) {
        const findings = session.findings_json ? JSON.parse(session.findings_json) : {}
        const platforms: Record<string, { overall?: number; nHigh?: number; nPosts?: number }> = {}
        const platformMap: Record<string, string> = {
          reddit: 'reddit', bluesky: 'bluesky', mastodon: 'mastodon',
          instagram: 'instagram', twitter: 'twitter', youtube: 'youtube', facebook: 'facebook', file: 'file',
        }
        Object.entries(platformMap).forEach(([key, lower]) => {
          const platformLower = (findings.platform_key || '').toLowerCase()
          if (platformLower === lower) {
            platforms[key] = {
              overall: findings.risk_score != null ? findings.risk_score : 0,
              nHigh: findings.n_high != null ? findings.n_high : 0,
              nPosts: findings.n_posts != null ? findings.n_posts : 0,
            }
          }
        })
        const newPA: Record<string, { overall?: number; nHigh?: number; nPosts?: number; status: 'connected' | 'analysed' | 'not_connected' }> = {}
        platformResults.forEach(([name]) => {
          newPA[name] = { overall: platforms[name]?.overall, nHigh: platforms[name]?.nHigh, nPosts: platforms[name]?.nPosts, status: 'analysed' }
        })
        setPlatformAnalysis(newPA)
      } else if (session && !data.platform_data_available) {
        const newPA: Record<string, { overall?: number; nHigh?: number; nPosts?: number; status: 'connected' | 'analysed' | 'not_connected' }> = {}
        platformResults.forEach(([name]) => {
          newPA[name] = { overall: undefined, nHigh: 0, nPosts: 0, status: 'connected' }
        })
        setPlatformAnalysis(newPA)
      } else {
        const newPA: Record<string, { overall?: number; nHigh?: number; nPosts?: number; status: 'connected' | 'analysed' | 'not_connected' }> = {}
        platformResults.forEach(([name]) => {
          const hasAccount = socialAccounts.some((a: any) => a.platform === name)
          newPA[name] = { overall: undefined, nHigh: 0, nPosts: 0, status: hasAccount ? 'connected' : 'not_connected' }
        })
        setPlatformAnalysis(newPA)
      }

      api.get('/self/social-accounts').then(({ data }) => setSocialAccounts(data.accounts || [])).catch(() => {})
    } catch (e: unknown) {
      setHasError(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper: get per-platform status label
  const getPlatformStatusLabel = (name: string) => {
    const stats = platformAnalysis[name] || {}
    const status = stats.status || 'not_connected'
    if (status === 'not_connected') return 'Not connected'
    if (status === 'connected') return 'Connected but not analysed'
    if (status === 'analysed') return 'Analysed'
    return status
  }

  // Unified risk from analysed platforms only (recompute from platformAnalysis)
  const analysedScores = Object.values(platformAnalysis)
    .filter(s => s.status === 'analysed' && s.overall !== undefined)
    .map(s => s.overall!)
  const finalUnifiedScore = analysedScores.length ? analysedScores.reduce((sum, score) => sum + score, 0) / analysedScores.length : 0
  const finalUnifiedRisk = analysedScores.length ? getRiskLabel(finalUnifiedScore) : { label: '--', color: '#6b7280' }

  // Video analysed flag (safe null check)
  const videoAnalysed = Boolean(video?.ok)

  return (
    <div className="flex flex-col gap-[18px]">
      <section>
        <h2 className="text-[1.2rem] font-bold text-[#111827]">Dashboard</h2>
        <p className="text-[0.8rem] text-[#4b5563] mt-[8px]">
          Session overview for quick triage, recent activity, and next actions.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-[14px]">
        <MetricCard label="Platforms Analysed" value={String(platformCount)} icon="ti ti-share" />
        <MetricCard label="Posts / Items Reviewed" value={String(postCount)} icon="ti ti-files" />
        <MetricCard label="High-Risk Items" value={String(highRiskCount)} icon="ti ti-alert-triangle" tone={highRiskCount ? '#f97316' : '#22c55e'} />
        <MetricCard label="Unified Risk" value={platformCount > 0 ? formatPercent(unifiedScore) : '--'} icon="ti ti-activity" tone={platformCount > 0 ? finalUnifiedRisk.color : '#6b7280'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-[16px]">
        <section className="bg-white rounded-[10px] border border-[#d1d5db] p-[16px]">
          <div className="flex items-center justify-between gap-[12px] mb-[14px]">
            <h3 className="text-[0.86rem] font-bold uppercase text-[#4b5563]">Analysis Status</h3>
            {scores.length > 0 && (
              <span className="text-[0.74rem] font-semibold px-[10px] py-[5px] rounded-full" style={{ color: finalUnifiedRisk.color, background: `${finalUnifiedRisk.color}18` }}>
                {finalUnifiedRisk.label}
              </span>
            )}
          </div>
          <div className="space-y-[10px]">
            {platformResults.map(([name]) => {
              const statusLabel = getPlatformStatusLabel(name)
              return (
                <PlatformRow
                  key={name}
                  name={name}
                  done={platformAnalysis[name]?.status === 'analysed'}
                  overall={platformAnalysis[name]?.overall}
                  nHigh={platformAnalysis[name]?.nHigh}
                  nPosts={platformAnalysis[name]?.nPosts}
                  statusLabel={statusLabel}
                />
              )
            })}
            <PlatformRow name="Video" done={videoAnalysed} overall={video?.ok ? video.risk : undefined} statusLabel={videoAnalysed ? 'Analysed' : ''} />
          </div>
        </section>

        <section className="bg-white rounded-[10px] border border-[#d1d5db] p-[16px]">
          <h3 className="text-[0.86rem] font-bold uppercase text-[#4b5563] mb-[14px]">Analysis History</h3>
          {sessionsLoaded && (
            <div className="space-y-[8px] max-h-[200px] overflow-y-auto">
              {analysisSessions.length === 0 ? (
                <div className="text-[0.78rem] text-[#9ca3af] py-[18px]">
                  No analysis sessions found.
                </div>
              ) : (
                analysisSessions.slice(0, 10).map((s: any, idx: number) => {
                  const sessionDate = s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Unknown date'
                  const platforms = s.platforms_json ? (JSON.parse(s.platforms_json) as string[]).join(', ') : 'unknown'
                  const riskLabel = s.findings_json ? (() => {
                    const f = JSON.parse(s.findings_json)
                    if (f.risk_score !== undefined) return getRiskLabel(f.risk_score).label
                    if (f.overall !== undefined) return getRiskLabel(f.overall).label
                    return '--'
                  })() : '--'
                  const nHigh = s.findings_json ? (() => {
                    const f = JSON.parse(s.findings_json)
                    return f.n_high ?? f.n_posts ? (f.n_high || 0) : 0
                  })() : 0
                  const nPosts = s.findings_json ? (() => {
                    const f = JSON.parse(s.findings_json)
                    return f.n_posts || 0
                  })() : 0
                  return (
                    <div key={idx} className="p-[12px] border-b border-[#e5e7eb] hover:bg-[#f8fafc] cursor-pointer transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="text-[0.8rem] font-semibold text-[#1f2937]">
                          {sessionDate} • {platforms}
                        </div>
                        <div className="text-[0.72rem] text-[#6b7280]">
                          {riskLabel} risk
                        </div>
                      </div>
                      <div className="text-[0.72rem] text-[#9ca3af] mt-[4px]">
                        {nPosts} items analysed, {nHigh} high-risk
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </section>

        <section className="bg-white rounded-[10px] border border-[#d1d5db] p-[16px]">
          <h3 className="text-[0.86rem] font-bold uppercase text-[#4b5563] mb-[12px]">Recent Single-Item Analysis</h3>
          {lastResult && single ? (
            <div>
              <div className="text-[2.2rem] leading-none font-semibold" style={{ color: single.color }}>
                {formatPercent(lastResult.prob)}
              </div>
              <div className="text-[0.8rem] text-[#4b5563] mt-[8px]">{lastResult.label} - {single.label}</div>
              <div className="text-[0.72rem] text-[#9ca3af] mt-[4px]">Latency: {lastResult.latency_ms.toFixed(0)}ms</div>
            </div>
          ) : (
            <div className="text-[0.78rem] text-[#9ca3af] py-[18px]">
              No text or image analysis run yet.
            </div>
          )}
          <div className="grid grid-cols-3 gap-[8px] mt-[18px]">
            <MiniStat label="Analysed" value={analytics.total_analyses} />
            <MiniStat label="At-Risk" value={analytics.positive_count} tone="#ef4444" />
            <MiniStat label="Safe" value={analytics.negative_count} tone="#22c55e" />
          </div>
        </section>
      </div>

      <section className="bg-white rounded-[10px] border border-[#d1d5db] p-[16px]">
        <h3 className="text-[0.86rem] font-bold uppercase text-[#4b5563] mb-[12px]">Next Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
          <ActionButton icon="ti ti-pencil" label="Text / Image Analysis" onClick={() => setPage('text-image')} />

          <ActionButton
            icon="ti ti-brand-reddit"
            label="Run Platform Analysis"
            onClick={() => {
              if (socialAccounts.length === 0) {
                setHasError(true)
                return
              }
              const firstAccount = socialAccounts[0]
              if (!firstAccount?.platform) {
                setHasError(true)
                return
              }
              if (isAnalyzing) {
                return // already running; ignore further clicks
              }
              handleAnalyzeSelf(firstAccount.platform)
            }}
          />

          {hasError && (
            <div className="text-[0.78rem] text-[#dc2626] bg-[#fef2f2] rounded-[6px] px-[10px] py-[7px] mb-[8px] border border-[#fecaca]">
              No connected accounts found. Add accounts via My Accounts first.
            </div>
          )}

          <ActionButton icon="ti ti-file-report" label="View Unified Profile" onClick={() => setPage('unified')} />
        </div>
      </section>
    </div>
  )
}

function MetricCard({ label, value, icon, tone = '#0F766E' }: { label: string; value: string; icon: string; tone?: string }) {
  return (
    <div className="bg-white rounded-[10px] border border-[#d1d5db] p-[14px]">
      <div className="flex items-center justify-between">
        <span className="text-[0.72rem] text-[#4b5563]">{label}</span>
        <i className={`${icon} text-[18px]`} style={{ color: tone }} />
      </div>
      <div className="text-[1.8rem] leading-tight mt-[10px]" style={{ color: tone }}>{value}</div>
    </div>
  )
}

function PlatformRow({ name, done, overall, nHigh, nPosts, statusLabel }: { name: string; done: boolean; overall?: number; nHigh?: number; nPosts?: number; statusLabel?: string }) {
  const safePosts = nPosts != null ? nPosts - (nHigh || 0) : 0
  const highRisk = nHigh != null ? nHigh : 0
  const barWidth = overall != null ? Math.max(1, Math.min(100, overall * 100)) : 0
  return (
    <div className="flex items-center justify-between gap-[12px] rounded-[8px] bg-[#f8fafc] px-[12px] py-[9px]">
      <div className="flex items-center gap-[8px]">
        <span className={`w-[8px] h-[8px] rounded-full ${done ? 'bg-[#22c55e]' : 'bg-[#cbd5e1]'}`} />
        <span className="text-[0.8rem] font-semibold text-[#1f2937]">{name}</span>
      </div>
      <div className="flex-1 flex h-[24px] items-center gap-[4px]">
        <div className="flex-1 rounded-[4px] bg-[#e2e8f0]" style={{ width: `${barWidth}%` }}>
          <div className="rounded-[4px] bg-[#ffedcc]" style={{ width: `${highRisk > 0 ? highRisk / Math.max(nPosts || 1, 1) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="text-right">
        <span className="text-[0.72rem] font-semibold text-[#1f2937]">{highRisk}</span>
        <span className="text-[0.65rem] text-[#6b7280]">high / {safePosts > 0 ? safePosts : ''} safe</span>
      </div>
      <div className="text-[0.68rem] text-[#6b7280] mt-[2px]">{statusLabel}</div>
    </div>
  )
}

function MiniStat({ label, value, tone = '#0F766E' }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-[8px] border border-[#e5e7eb] p-[10px] text-center">
      <div className="text-[1.3rem] font-semibold" style={{ color: tone }}>{value}</div>
      <div className="text-[0.62rem] uppercase tracking-[0.08em] text-[#9ca3af] font-bold">{label}</div>
    </div>
  )
}

function ActionButton({ icon, label, onClick, disabled, loading }: { icon: string; label: string; onClick: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
      className="flex items-center justify-center gap-[8px] rounded-[8x] border border-[#d1d5db] bg-white px-[14px] py-[11px] text-[0.82rem] font-semibold text-[#4b5563] hover:border-[#0F766E] hover:text-[#0F766E]"
    >
      <i className={`${icon} text-[16px]`} />
      {loading ? (
        <i className="ti ti-loader ti-spin text-[16px] mx-1" />
      ) : (
        <i className={`${icon} text-[16px]`} />
      )}
      {loading ? 'Analysing…' : label}
    </button>
  )
}