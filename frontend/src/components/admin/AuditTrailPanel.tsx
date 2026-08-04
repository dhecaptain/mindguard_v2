import { useCallback, useEffect, useState } from 'react'
import { getAdminAuditLog } from '../../api/admin'
import type { AuditEvent } from '../../types'

const HIGHLIGHT: Record<string, string> = {
  TERMS_ACCEPTED: 'bg-[#d1fae5] text-[#065f46]',
  USER_REGISTERED: 'bg-[#dbeafe] text-[#1e40af]',
  CONSENT_ACCEPTED: 'bg-[#d1fae5] text-[#065f46]',
  CONSENT_DECLINED: 'bg-[#fee2e2] text-[#991b1b]',
  CONSENT_REVOKED: 'bg-[#fee2e2] text-[#991b1b]',
  CONSENT_DISPATCHED: 'bg-[#fef3c7] text-[#92400e]',
  DEMO_REQUEST_CREATED: 'bg-[#ede9fe] text-[#5b21b6]',
  DEMO_REQUEST_UPDATED: 'bg-[#ede9fe] text-[#5b21b6]',
  ROSTER_UPLOAD: 'bg-[#ccfbf1] text-[#115e59]',
}

function formatTime(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatAction(action: string) {
  return action
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export default function AuditTrailPanel() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEvents(await getAdminAuditLog(50))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = events.filter((e) =>
    /^(TERMS_ACCEPTED|USER_REGISTERED|CONSENT_|DEMO_REQUEST_|ROSTER_UPLOAD|DEMO_REQUEST_CREATED|DEMO_REQUEST_UPDATED)/.test(e.action))

  return (
    <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] overflow-hidden">
      <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#f1f5f9]">
        <div className="flex items-center gap-[8px]">
          <i className="ti ti-shield-lock text-[16px] text-[#6b7280]" />
          <span className="text-[0.9rem] font-bold text-[#1f2937]">Compliance & audit trail</span>
          {!loading && (
            <span className="text-[0.78rem] text-[#9ca3af] ml-[4px]">
              ({filtered.length} recent)
            </span>
          )}
        </div>
        <button
          onClick={load}
          className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#0F766E] text-white rounded-[7px] text-[0.78rem] font-semibold cursor-pointer hover:bg-[#115E59] transition-colors"
        >
          <i className="ti ti-refresh text-[14px]" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mx-[20px] my-[12px] rounded-[8px] bg-[#fee2e2] border border-[#fca5a5] px-[12px] py-[8px] text-[0.78rem] text-[#991b1b]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-[40px] text-[#6b7280]">
          <div className="w-[24px] h-[24px] border-2 border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin mr-[10px]" />
          <span className="text-[0.82rem]">Loading audit trail...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[40px] text-[#9ca3af]">
          <i className="ti ti-clipboard-list text-[28px] mb-[6px]" />
          <span className="text-[0.82rem]">No compliance events yet.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[0.82rem]">
            <thead className="bg-[#f9fafb]">
              <tr className="text-[#6b7280] font-semibold text-[0.72rem] uppercase tracking-wider">
                <th className="text-left py-[10px] px-[20px]">Time</th>
                <th className="text-left py-[10px] px-[20px]">Action</th>
                <th className="text-left py-[10px] px-[20px]">Role</th>
                <th className="text-left py-[10px] px-[20px]">Target</th>
                <th className="text-left py-[10px] px-[20px]">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-[10px] px-[20px] text-[#6b7280] whitespace-nowrap">{formatTime(e.occurred_at)}</td>
                  <td className="py-[10px] px-[20px]">
                    <span className={`inline-block px-[8px] py-[2px] rounded-full text-[0.7rem] font-semibold ${HIGHLIGHT[e.action] || 'bg-[#f1f5f9] text-[#6b7280]'}`}>
                      {formatAction(e.action)}
                    </span>
                  </td>
                  <td className="py-[10px] px-[20px] text-[#6b7280] capitalize">{e.actor_role || 'public'}</td>
                  <td className="py-[10px] px-[20px] text-[#9ca3af]">
                    {e.target_type ? `${e.target_type}${e.target_id ? ` #${e.target_id.slice(0, 8)}` : ''}` : '—'}
                  </td>
                  <td className="py-[10px] px-[20px] text-[#9ca3af]">{e.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
