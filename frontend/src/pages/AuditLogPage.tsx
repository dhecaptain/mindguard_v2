import { useEffect, useState } from 'react'
import { getAuditLog } from '../api/counsellor'
import type { AuditEvent } from '../types'

function formatTime(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function formatAction(action: string) {
  return action
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      const data = await getAuditLog()
      setEvents(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Auto-refresh every 30s
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[1.3rem] font-bold text-[#1f2937]">Audit Log</h2>
          <p className="text-[0.82rem] text-[#6b7280] mt-[2px]">
            System event history — auto-refreshes every 30 seconds
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#0F766E] text-white rounded-[7px] text-[0.78rem] font-semibold cursor-pointer hover:bg-[#115E59] transition-colors"
        >
          <i className="ti ti-refresh text-[14px]" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] overflow-hidden">
        <div className="flex items-center gap-[8px] px-[20px] py-[14px] border-b border-[#f1f5f9]">
          <i className="ti ti-history text-[16px] text-[#6b7280]" />
          <span className="text-[0.9rem] font-bold text-[#1f2937]">Events</span>
          {!loading && (
            <span className="text-[0.78rem] text-[#9ca3af] ml-[4px]">({events.length})</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-[60px] text-[#6b7280]">
            <div className="w-[24px] h-[24px] border-2 border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin mr-[10px]" />
            <span className="text-[0.82rem]">Loading audit log...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-[60px] text-[#ef4444]">
            <i className="ti ti-alert-circle text-[32px] mb-[8px]" />
            <span className="text-[0.82rem]">{error}</span>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] text-[#9ca3af]">
            <i className="ti ti-clipboard-list text-[32px] mb-[8px]" />
            <span className="text-[0.82rem]">No audit events yet</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead className="bg-[#f9fafb]">
                <tr className="text-[#6b7280] font-semibold text-[0.72rem] uppercase tracking-wider">
                  <th className="text-left py-[10px] px-[20px]">Time</th>
                  <th className="text-left py-[10px] px-[20px]">Actor Role</th>
                  <th className="text-left py-[10px] px-[20px]">Action</th>
                  <th className="text-left py-[10px] px-[20px]">Target</th>
                  <th className="text-left py-[10px] px-[20px]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-[10px] px-[20px] text-[#6b7280] whitespace-nowrap">
                      {formatTime(ev.occurred_at)}
                    </td>
                    <td className="py-[10px] px-[20px]">
                      {ev.actor_role ? (
                        <span className="inline-block px-[8px] py-[2px] rounded-full text-[0.7rem] font-semibold bg-[#f1f5f9] text-[#6b7280] capitalize">
                          {ev.actor_role}
                        </span>
                      ) : (
                        <span className="text-[#d1d5db]">—</span>
                      )}
                    </td>
                    <td className="py-[10px] px-[20px] font-medium text-[#1f2937]">
                      {formatAction(ev.action)}
                    </td>
                    <td className="py-[10px] px-[20px] text-[#6b7280]">
                      {ev.target_type ? (
                        <span>
                          <span className="capitalize">{ev.target_type.toLowerCase()}</span>
                          {ev.target_id && (
                            <span className="text-[#9ca3af]"> #{ev.target_id.slice(0, 8)}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[#d1d5db]">—</span>
                      )}
                    </td>
                    <td className="py-[10px] px-[20px] text-[#9ca3af] max-w-[200px] truncate">
                      {ev.payload_json ? (
                        <span title={ev.payload_json} className="cursor-help">
                          {ev.payload_json.slice(0, 60)}{ev.payload_json.length > 60 ? '…' : ''}
                        </span>
                      ) : (
                        <span className="text-[#d1d5db]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
