import { useState, useEffect } from 'react'
import api from '../api/client'

interface Counsellor {
  id: string
  name: string
  email: string
  status: string
  created_at: string
  assigned_student_count: number
  institution_id?: string | null
}

interface Institution { id: string; name: string }
interface Student { id: string; email: string; name: string }

export default function AdminCounsellorsPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formInstitution, setFormInstitution] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [selected, setSelected] = useState<Counsellor | null>(null)
  const [assigned, setAssigned] = useState<{ id: string; student_id: string; student_name: string; student_email: string }[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assignStudentId, setAssignStudentId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)

  const loadCounsellors = async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: cData }, { data: instData }] = await Promise.all([
        api.get('/admin/counsellors'),
        api.get('/v1/admin/institutions').catch(() => ({ data: { institutions: [] } })),
      ])
      setCounsellors(Array.isArray(cData) ? cData : cData.counsellors ?? cData)
      const insts = (instData as { institutions?: Institution[] }).institutions ?? (Array.isArray(instData) ? instData : [])
      setInstitutions(insts)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to load counsellors')
    } finally {
      setLoading(false)
    }
  }

  const loadAssignments = async (counsellorId: string) => {
    try {
      const { data } = await api.get('/admin/assignments', { params: { counsellor_id: counsellorId } })
      const list = Array.isArray(data) ? data : data.assignments ?? []
      setAssigned(list)
    } catch {}
  }

  const loadStudents = async () => {
    try {
      const { data } = await api.get('/admin/available-students')
      setStudents(data.students ?? data ?? [])
    } catch {}
  }

  useEffect(() => { loadCounsellors() }, [])
  useEffect(() => {
    if (selected) { loadAssignments(selected.id); loadStudents() }
  }, [selected?.id])

  const handleAdd = async () => {
    if (!formName.trim() || !formEmail.trim()) return
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      await api.post('/admin/counsellors', { name: formName.trim(), email: formEmail.trim().toLowerCase(), institution_id: formInstitution || undefined })
      setSuccess(`Invitation sent to ${formEmail.trim()}`)
      setFormName(''); setFormEmail(''); setFormInstitution(''); setShowAdd(false)
      loadCounsellors()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to invite counsellor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async (id: string) => {
    try {
      await api.post(`/admin/counsellors/${id}/resend-invite`)
      setSuccess('Invitation resent')
      loadCounsellors()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to resend')
    }
  }

  const handleDeactivate = async (c: Counsellor) => {
    if (!confirm(`Deactivate ${c.name} (${c.email})? They will lose access and their students will be unassigned.`)) return
    try {
      await api.patch(`/admin/counsellors/${c.id}`, { status: 'revoked' })
      loadCounsellors()
      if (selected?.id === c.id) setSelected({ ...c, status: 'revoked' })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to deactivate')
    }
  }

  const handleReactivate = async (c: Counsellor) => {
    try {
      await api.patch(`/admin/counsellors/${c.id}`, { status: 'approved' })
      loadCounsellors()
      if (selected?.id === c.id) setSelected({ ...c, status: 'approved' })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to reactivate')
    }
  }

  const handleAssign = async () => {
    if (!selected || !assignStudentId) return
    setAssignLoading(true)
    try {
      await api.post('/admin/assignments', { counsellor_id: selected.id, student_id: assignStudentId })
      setAssignStudentId('')
      loadAssignments(selected.id)
      loadCounsellors()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to assign')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm('Unassign this student?')) return
    try {
      await api.delete(`/admin/assignments/${assignmentId}`)
      if (selected) loadAssignments(selected.id)
      loadCounsellors()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to unassign')
    }
  }

  const statusBadge = (s: string) => {
    const v = s.toLowerCase()
    if (v === 'approved' || v === 'active') return 'bg-[#d1fae5] text-[#065f46]'
    if (v === 'pending' || v === 'invited') return 'bg-[#fef3c7] text-[#92400e]'
    return 'bg-[#f3f4f6] text-[#6b7280]'
  }

  const statusLabel = (s: string) => {
    const v = s.toLowerCase()
    if (v === 'pending') return 'Pending — invitation sent'
    if (v === 'approved' || v === 'active') return 'Active'
    if (v === 'revoked' || v === 'suspended') return 'Deactivated'
    return s
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.3rem] font-bold text-[#1f2937]">Counsellors</h2>
          <p className="text-[0.82rem] text-[#6b7280] mt-[2px]">Invite, manage and assign counsellors. Invitations use a secure one-time link (7-day expiry).</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-[16px] py-[9px] bg-[#0F766E] text-white rounded-[8px] text-[0.82rem] font-semibold flex items-center gap-[6px] hover:bg-[#115E59]">
          <i className="ti ti-plus text-[14px]" /> Add Counsellor
        </button>
      </div>

      {success && (
        <div className="px-[14px] py-[10px] bg-[#d1fae5] border border-[#6ee7b7] rounded-[8px] text-[0.82rem] text-[#065f46] flex items-center gap-[8px]">
          <i className="ti ti-circle-check" /> {success}
        </div>
      )}
      {error && (
        <div className="px-[14px] py-[10px] bg-[#fee2e2] border border-[#fca5a5] rounded-[8px] text-[0.82rem] text-[#991b1b] flex items-center gap-[8px]">
          <i className="ti ti-alert-circle" /> {error}
        </div>
      )}

      {showAdd && (
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-[20px]">
          <h3 className="text-[0.95rem] font-bold text-[#1f2937] mb-[12px]">Invite counsellor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
            <div>
              <label className="text-[0.72rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Name</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Jane Doe" className="w-full bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem] outline-none focus:border-[#0F766E]" />
            </div>
            <div>
              <label className="text-[0.72rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Email</label>
              <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="jane@school.edu" className="w-full bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem] outline-none focus:border-[#0F766E]" />
            </div>
            <div>
              <label className="text-[0.72rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Institution</label>
              <select value={formInstitution} onChange={(e) => setFormInstitution(e.target.value)} className="w-full bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem]">
                <option value="">No institution</option>
                {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-[8px] mt-[16px] justify-end">
            <button onClick={() => setShowAdd(false)} className="px-[14px] py-[8px] rounded-[8px] text-[0.82rem] font-semibold border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb]">Cancel</button>
            <button onClick={handleAdd} disabled={submitting || !formName.trim() || !formEmail.trim()} className="px-[16px] py-[8px] bg-[#0F766E] text-white rounded-[8px] text-[0.82rem] font-semibold disabled:opacity-50 hover:bg-[#115E59]">{submitting ? 'Sending…' : 'Send invitation'}</button>
          </div>
          <p className="text-[0.7rem] text-[#6b7280] mt-[10px]">No password is set by admin. The counsellor will receive a one-time link via <span className="font-semibold">noreply@mindguardai.me</span> to set their own password.</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[20px]">
        <div className="flex items-center gap-[8px] mb-[14px]">
          <i className="ti ti-stethoscope text-[20px] text-[#0F766E]" />
          <h3 className="text-[1rem] font-bold text-[#1f2937]">Counsellors ({counsellors.length})</h3>
        </div>
        {loading ? (
          <div className="flex items-center gap-[8px] text-[#6b7280] text-[0.82rem]"><div className="w-[18px] h-[18px] border-2 border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin" /> Loading…</div>
        ) : counsellors.length === 0 ? (
          <div className="text-center py-[24px] text-[#6b7280] text-[0.85rem]">No counsellors yet. Click “Add Counsellor” to invite your first counsellor.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[0.8rem]">
              <thead>
                <tr className="text-left text-[#9ca3af] border-b border-[#f3f4f6]">
                  <th className="pb-[8px] font-semibold">Name</th>
                  <th className="pb-[8px] font-semibold">Email</th>
                  <th className="pb-[8px] font-semibold">Institution</th>
                  <th className="pb-[8px] font-semibold">Status</th>
                  <th className="pb-[8px] font-semibold">Students</th>
                  <th className="pb-[8px] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {counsellors.map((c) => (
                  <tr key={c.id} className="border-b border-[#f9fafb] hover:bg-[#fafbfc]">
                    <td className="py-[9px] font-medium text-[#1f2937]">
                      <button onClick={() => setSelected(c)} className="hover:underline text-left font-medium">{c.name}</button>
                    </td>
                    <td className="py-[9px] text-[#6b7280]">{c.email}</td>
                    <td className="py-[9px] text-[#6b7280]">{institutions.find((i) => i.id === (c as unknown as { institution_id?: string }).institution_id)?.name ?? '—'}</td>
                    <td className="py-[9px]"><span className={`px-[8px] py-[2px] rounded-full text-[0.65rem] font-bold uppercase ${statusBadge(c.status)}`}>{statusLabel(c.status)}</span></td>
                    <td className="py-[9px] text-[#1f2937]">{c.assigned_student_count}</td>
                    <td className="py-[9px]">
                      <div className="flex flex-wrap gap-[6px]">
                        <button onClick={() => setSelected(c)} className="px-[8px] py-[4px] rounded-[6px] border border-[#e5e7eb] text-[0.7rem] font-semibold text-[#374151] hover:bg-[#f9fafb]">View</button>
                        {(c.status.toLowerCase() === 'pending' || c.status.toLowerCase() === 'invited') && (
                          <button onClick={() => handleResend(c.id)} className="px-[8px] py-[4px] rounded-[6px] bg-[#fef3c7] text-[#92400e] text-[0.7rem] font-semibold">Resend</button>
                        )}
                        {(c.status.toLowerCase() === 'approved' || c.status.toLowerCase() === 'active') && (
                          <button onClick={() => handleDeactivate(c)} className="px-[8px] py-[4px] rounded-[6px] bg-[#fee2e2] text-[#991b1b] text-[0.7rem] font-semibold">Deactivate</button>
                        )}
                        {(c.status.toLowerCase() === 'revoked' || c.status.toLowerCase() === 'suspended') && (
                          <button onClick={() => handleReactivate(c)} className="px-[8px] py-[4px] rounded-[6px] bg-[#d1fae5] text-[#065f46] text-[0.7rem] font-semibold">Reactivate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-[20px]">
          <div className="flex items-center justify-between mb-[14px]">
            <h3 className="text-[0.95rem] font-bold text-[#1f2937]">Assigned Students — {selected.name} <span className={`ml-[8px] px-[8px] py-[2px] rounded-full text-[0.65rem] font-bold uppercase ${statusBadge(selected.status)}`}>{statusLabel(selected.status)}</span></h3>
            <button onClick={() => setSelected(null)} className="text-[#6b7280] hover:text-[#1f2937]"><i className="ti ti-x text-[18px]" /></button>
          </div>

          <div className="flex gap-[10px] mb-[14px]">
            <select value={assignStudentId} onChange={(e) => setAssignStudentId(e.target.value)} className="flex-1 bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem]">
              <option value="">Select student to assign</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.email}</option>)}
            </select>
            <button onClick={handleAssign} disabled={!assignStudentId || assignLoading} className="px-[16px] py-[9px] bg-[#0F766E] text-white rounded-[8px] text-[0.82rem] font-semibold disabled:opacity-50">Assign</button>
          </div>

          {assigned.length === 0 ? (
            <div className="text-[0.82rem] text-[#6b7280] py-[12px]">No students assigned yet.</div>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {assigned.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-[10px] bg-[#f8fafc] rounded-[8px] border border-[#e5e7eb]">
                  <div>
                    <div className="text-[0.85rem] font-semibold text-[#1f2937]">{a.student_name}</div>
                    <div className="text-[0.75rem] text-[#6b7280]">{a.student_email}</div>
                  </div>
                  <button onClick={() => handleUnassign(a.id)} className="text-[0.7rem] font-semibold text-[#dc2626] hover:underline">Unassign</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
