import { useEffect, useState } from 'react'
import { getConsentDetail } from '../../api/counsellor'
import type { ConsentDetail, ConsentEvent, ConsentAuditEntry } from '../../types'

function fmt(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

const EVENT_LABEL: Record<string, string> = {
  viewed: 'Link opened',
  accepted: 'Consent accepted',
  declined: 'Consent declined',
  revoked: 'Consent revoked',
  expired: 'Link expired',
  reminder: 'Reminder sent',
}

const AUDIT_LABEL: Record<string, string> = {
  CONSENT_DISPATCHED: 'Consent dispatched',
  CONSENT_EMAIL_SENT: 'Request email sent',
  CONSENT_EMAIL_FAILED: 'Request email failed',
  CONSENT_REMINDER_SENT: 'Reminder email sent',
  CONSENT_REMINDER_FAILED: 'Reminder email failed',
  CONSENT_VIEWED: 'Link viewed',
  CONSENT_ACCEPTED: 'Accepted',
  CONSENT_DECLINED: 'Declined',
  CONSENT_REVOKED: 'Revoked',
}

interface ConsentDetailDrawerProps {
  consentId: string
  onClose: () => void
}

export default function ConsentDetailDrawer({ consentId, onClose }: ConsentDetailDrawerProps) {
  const [detail, setDetail] = useState<ConsentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getConsentDetail(consentId)
      .then((d) => { if (active) setDetail(d) })
      .catch((e: any) => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [consentId])

  const renderEvent = (e: ConsentEvent) => {
    let label = EVENT_LABEL[e.event_type] ?? e.event_type.replace(/_/g, ' ')
    const meta = e.metadata_json ? JSON.parse(e.metadata_json) : null
    if (e.event_type === 'reminder' && meta?.day) label = `Reminder sent (day ${meta.day})`
    return { label, meta, actor: e.actor_type, at: e.created_at }
  }

  const renderAudit = (a: ConsentAuditEntry) => {
    let label = AUDIT_LABEL[a.action] ?? a.action.replace(/_/g, ' ')
    const payload = a.payload_json ? JSON.parse(a.payload_json) : null
    return { label, payload, actor: a.actor_role ?? a.actor_id, ip: a.ip, at: a.occurred_at }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-[#f1f5f9] text-[#6b7280]',
      PENDING: 'bg-[#fef3c7] text-[#92400e]',
      VIEWED: 'bg-[#dbeafe] text-[#1e40af]',
      ACCEPTED: 'bg-[#d1fae5] text-[#065f46]',
      DECLINED: 'bg-[#fee2e2] text-[#991b1b]',
      EXPIRED: 'bg-[#f1f5f9] text-[#6b7280]',
      REVOKED: 'bg-[#fee2e2] text-[#991b1b]',
      RENEWAL_DUE: 'bg-[#fff7ed] text-[#9a3412]',
    }
    return (
      <span className={`inline-block px-[8px] py-[2px] rounded-full text-[0.7rem] font-semibold ${styles[status] ?? styles.DRAFT}`}>
        {status.replace(/_/g, ' ')}
      </span>
    )
  }

  const DELIVERY_BADGE: Record<string, { style: string; label: string }> = {
    delivered: { style: 'bg-[#d1fae5] text-[#065f46]', label: 'Delivered' },
    bounced: { style: 'bg-[#fee2e2] text-[#991b1b]', label: 'Bounced' },
    complained: { style: 'bg-[#fef3c7] text-[#92400e]', label: 'Complaint' },
  }

  const deliveryBadge = (d?: string) => {
    if (!d) return null
    const cfg = DELIVERY_BADGE[d]
    if (!cfg) return null
    return (
      <span className={`inline-block px-[8px] py-[2px] rounded-full text-[0.7rem] font-semibold ${cfg.style}`}>
        {cfg.label}
      </span>
    )
  }

  const c = detail?.consent

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-[520px] h-full bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-[#0F766E] px-[20px] py-[14px] flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <i className="ti ti-file-check text-[16px] text-[#ccfbf1]" />
            <span className="text-[0.95rem] font-bold text-white">Consent details</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-[18px] bg-transparent border-none cursor-pointer"
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-[60px] text-[#6b7280]">
            <div className="w-[24px] h-[24px] border-2 border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin mr-[10px]" />
            <span className="text-[0.82rem]">Loading details...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-[60px] text-[#ef4444]">
            <i className="ti ti-alert-circle text-[32px] mb-[8px]" />
            <span className="text-[0.82rem]">{error}</span>
          </div>
        ) : c ? (
          <>
            <div className="px-[20px] py-[16px] border-b border-[#f1f5f9]">
              <div className="flex items-center gap-[8px] mb-[10px]">
                <span className="text-[1.05rem] font-bold text-[#1f2937]">
                  {c.student_name || c.student_id}
                </span>
                {statusBadge(c.status)}
                {deliveryBadge(c.delivery_status)}
              </div>
              <div className="grid grid-cols-2 gap-[8px] text-[0.8rem]">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-wider text-[#9ca3af] font-semibold">Student email</div>
                  <div className="text-[#1f2937] break-all">{c.student_email || '—'}</div>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-wider text-[#9ca3af] font-semibold">Recipient</div>
                  <div className="text-[#1f2937] break-all">{c.recipient_email}</div>
                  <div className="text-[0.7rem] text-[#9ca3af] capitalize">{c.recipient_role}</div>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-wider text-[#9ca3af] font-semibold">Mode</div>
                  <div className="text-[#1f2937]">{c.mode === 'ON_DEMAND' ? 'On-demand' : 'Continuous'}</div>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-wider text-[#9ca3af] font-semibold">Platforms</div>
                  <div className="text-[#1f2937]">
                    {JSON.parse(c.platforms_json || '[]').join(', ') || '—'}
                  </div>
                </div>
              </div>
              <div className="mt-[12px] pt-[12px] border-t border-[#f1f5f9] grid grid-cols-2 gap-[8px] text-[0.8rem]">
                {[
                  ['Created', fmt(c.created_at)],
                  ['Dispatched', fmt(c.dispatched_at)],
                  ['Viewed', fmt(c.viewed_at)],
                  ['Accepted', fmt(c.accepted_at)],
                  ['Declined', fmt(c.declined_at)],
                  ['Expires', fmt(c.expires_at)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[0.68rem] uppercase tracking-wider text-[#9ca3af] font-semibold">{k}</div>
                    <div className="text-[#374151]">{v}</div>
                  </div>
                ))}
                <div>
                  <div className="text-[0.68rem] uppercase tracking-wider text-[#9ca3af] font-semibold">Delivery</div>
                  <div className="text-[#374151]">
                    {c.delivery_status
                      ? (DELIVERY_BADGE[c.delivery_status]?.label ?? c.delivery_status)
                      : '—'}
                    {c.last_delivery_event_at ? ` · ${fmt(c.last_delivery_event_at)}` : ''}
                  </div>
                </div>
              </div>
              <div className="mt-[12px] pt-[12px] border-t border-[#f1f5f9]">
                <div className="text-[0.68rem] uppercase tracking-wider text-[#9ca3af] font-semibold mb-[6px]">Delivery routing</div>
                <div className="flex items-start gap-[8px] text-[0.8rem] text-[#374151]">
                  <i className="ti ti-route text-[14px] text-[#0F766E] mt-[2px]" aria-hidden="true" />
                  <div>
                    {c.recipient_role === 'parent' ? (
                      <>
                        Request routed to the parent/guardian (
                        <span className="font-semibold break-all">{c.recipient_email}</span>).
                        {c.student_email && c.student_email !== c.recipient_email && (
                          <div className="mt-[2px] text-[#6b7280]">
                            A courtesy copy is also sent to the student (
                            <span className="font-semibold break-all">{c.student_email}</span>).
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        Request routed directly to the student (
                        <span className="font-semibold break-all">{c.recipient_email}</span>).
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-[20px] py-[14px]">
              <div className="text-[0.78rem] font-bold text-[#1f2937] mb-[8px] flex items-center gap-[6px]">
                <i className="ti ti-timeline text-[14px] text-[#0F766E]" /> Timeline
              </div>
              {detail.events.length === 0 ? (
                <div className="text-[0.8rem] text-[#9ca3af] py-[8px]">No activity recorded yet.</div>
              ) : (
                <div className="flex flex-col gap-0">
                  {[...detail.events].reverse().map((e) => {
                    const r = renderEvent(e)
                    return (
                      <div key={e.id} className="flex gap-[12px] py-[6px]">
                        <div className="w-[6px] shrink-0 mt-[6px] h-[6px] rounded-full bg-[#0F766E]" />
                        <div className="flex-1">
                          <div className="text-[0.82rem] text-[#1f2937]">{r.label}</div>
                          <div className="text-[0.7rem] text-[#9ca3af]">
                            {r.actor} · {fmt(r.at)}
                            {r.meta && r.meta.ip ? ` · ${r.meta.ip}` : ''}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="px-[20px] py-[14px] border-t border-[#f1f5f9]">
              <div className="text-[0.78rem] font-bold text-[#1f2937] mb-[8px] flex items-center gap-[6px]">
                <i className="ti ti-shield-lock text-[14px] text-[#0F766E]" /> Audit trail
              </div>
              {detail.audit_log.length === 0 ? (
                <div className="text-[0.8rem] text-[#9ca3af] py-[8px]">No audit entries yet.</div>
              ) : (
                <div className="flex flex-col gap-0">
                  {detail.audit_log.map((a) => {
                    const r = renderAudit(a)
                    return (
                      <div key={a.id} className="flex gap-[12px] py-[6px]">
                        <div className="w-[6px] shrink-0 mt-[6px] h-[6px] rounded-full bg-[#64748b]" />
                        <div className="flex-1">
                          <div className="text-[0.82rem] text-[#1f2937]">{r.label}</div>
                          <div className="text-[0.7rem] text-[#9ca3af]">
                            {r.actor || 'system'}{r.ip ? ` · ${r.ip}` : ''} · {fmt(r.at)}
                          </div>
                          {r.payload && r.payload.error && (
                            <div className="text-[0.7rem] text-[#991b1b] mt-[2px] break-all">Error: {r.payload.error}</div>
                          )}
                          {r.payload && r.payload.signature && (
                            <div className="text-[0.7rem] text-[#6b7280] mt-[2px]">Signed: {r.payload.signature}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
