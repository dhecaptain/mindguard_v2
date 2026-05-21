import { useEffect, useState, type ReactNode } from 'react'
import { useCounsellorStore } from '../store/counsellorStore'
import { getStudents, getStudentDetail, approveStudent, revokeStudent } from '../api/counsellor'
import type { StudentDetail } from '../api/counsellor'
import StudentTimeline from '../components/counsellor/StudentTimeline'
import StudentNotes from '../components/counsellor/StudentNotes'

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-[#d1fae5] text-[#065f46]',
  pending: 'bg-[#fef3c7] text-[#92400e]',
  revoked: 'bg-[#f1f5f9] text-[#6b7280]',
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CollapsibleSection({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-[20px] py-[14px] border-b border-[#f1f5f9] cursor-pointer bg-transparent text-left"
      >
        <h3 className="text-[0.9rem] font-bold text-[#1f2937] flex items-center gap-[8px]">
          <i className={`${icon} text-[16px] text-[#6b7280]`} />
          {title}
        </h3>
        <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'} text-[#9ca3af] text-[16px]`} />
      </button>
      {open && <div className="px-[20px] py-[14px]">{children}</div>}
    </div>
  )
}

function StudentDetailView({ student, onBack }: { student: StudentDetail; onBack: () => void }) {
  const gaugeAngle = Math.min(student.risk_summary.latest_prob * 180, 180)
  const gaugeColor = student.risk_summary.latest_prob >= 0.75 ? '#ef4444' : student.risk_summary.latest_prob >= 0.5 ? '#f59e0b' : '#22c55e'

  return (
    <div className="flex flex-col gap-[16px]">
      <button onClick={onBack} className="flex items-center gap-[6px] text-[#0F766E] text-[0.82rem] font-semibold cursor-pointer bg-transparent border-none w-fit">
        <i className="ti ti-arrow-left" /> Back to students
      </button>

      {/* Student header */}
      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[20px] flex items-center gap-[16px]">
        <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#0F766E] to-[#1D9E75] flex items-center justify-center text-white font-bold text-[1rem]">
          {student.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-[1.15rem] font-bold text-[#1f2937]">{student.name}</h2>
          <p className="text-[0.8rem] text-[#6b7280]">{student.email} · Joined {formatDate(student.created_at)}</p>
        </div>
        <span className={`inline-block px-[12px] py-[4px] rounded-full text-[0.72rem] font-bold uppercase ${STATUS_STYLES[student.status] || ''}`}>
          {student.status}
        </span>
      </div>

      {/* Risk gauge */}
      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[20px]">
        <h3 className="text-[0.9rem] font-bold text-[#1f2937] mb-[12px]">Risk Assessment</h3>
        <div className="flex items-center gap-[24px]">
          <div className="relative w-[140px] h-[80px] flex-shrink-0">
            <svg viewBox="0 0 160 90" className="w-[140px] h-[80px]">
              <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
              <path
                d="M 15 80 A 65 65 0 0 1 145 80"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${(gaugeAngle / 180) * 204} 204`}
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
              <text x="80" y="60" textAnchor="middle" fill={gaugeColor} fontSize="18" fontWeight="bold">
                {(student.risk_summary.latest_prob * 100).toFixed(0)}%
              </text>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-x-[24px] gap-y-[8px] text-[0.82rem]">
            <div><span className="text-[#6b7280]">Status</span><br /><span className="font-semibold text-[#1f2937]">{student.risk_summary.latest_label}</span></div>
            <div><span className="text-[#6b7280]">Total analyses</span><br /><span className="font-semibold text-[#1f2937]">{student.risk_summary.total_analyses}</span></div>
            <div><span className="text-[#6b7280]">Latest risk</span><br /><span className="font-semibold text-[#1f2937]">{(student.risk_summary.latest_prob * 100).toFixed(0)}%</span></div>
            <div><span className="text-[#6b7280]">High risk flags</span><br /><span className="font-semibold text-[#ef4444]">{student.risk_summary.high_risk_count}</span></div>
          </div>
        </div>
      </div>

      {/* Analysis history */}
      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)]">
        <div className="px-[20px] py-[14px] border-b border-[#f1f5f9]">
          <h3 className="text-[0.9rem] font-bold text-[#1f2937]">Analysis History</h3>
        </div>
        {student.analyses.length === 0 ? (
          <div className="py-[40px] text-center text-[#9ca3af] text-[0.82rem]">No analyses recorded yet</div>
        ) : (
          <div className="divide-y divide-[#f1f5f9] max-h-[320px] overflow-y-auto">
            {student.analyses.map((a) => (
              <div key={a.id} className="px-[20px] py-[10px] flex items-center gap-[12px]">
                <div className={`w-[8px] h-[8px] rounded-full flex-shrink-0 ${a.prob >= 0.75 ? 'bg-[#ef4444]' : a.prob >= 0.5 ? 'bg-[#f59e0b]' : 'bg-[#22c55e]'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8rem] text-[#1f2937] font-medium truncate">{a.text || `[${a.platform}]`}</div>
                  <div className="text-[0.7rem] text-[#9ca3af]">{a.platform} · {formatDate(a.created_at)}</div>
                </div>
                <span className={`text-[0.78rem] font-bold px-[6px] py-[1px] rounded ${a.prob >= 0.75 ? 'text-[#ef4444] bg-[#fef2f2]' : a.prob >= 0.5 ? 'text-[#f59e0b] bg-[#fffbeb]' : 'text-[#22c55e] bg-[#f0fdf4]'}`}>
                  {(a.prob * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Timeline */}
      <CollapsibleSection title="Risk Timeline" icon="ti ti-chart-line">
        <StudentTimeline studentId={student.id} />
      </CollapsibleSection>

      {/* Counsellor Notes */}
      <CollapsibleSection title="Counsellor Notes" icon="ti ti-notes">
        <StudentNotes studentId={student.id} />
      </CollapsibleSection>
    </div>
  )
}

export default function StudentManagementPage() {
  const { students, loading, setStudents, updateStudentStatus, setLoading } = useCounsellorStore()
  const [detailId, setDetailId] = useState<string | null>(null)
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (students.length === 0) {
      loadStudents()
    }
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const data = await getStudents()
      setStudents(data)
    } catch {}
    setLoading(false)
  }

  const openDetail = async (id: string) => {
    setDetailId(id)
    setDetailLoading(true)
    setStudentDetail(null)
    try {
      const data = await getStudentDetail(id)
      setStudentDetail(data)
    } catch {}
    setDetailLoading(false)
  }

  const closeDetail = () => {
    setDetailId(null)
    setStudentDetail(null)
  }

  if (detailId) {
    if (detailLoading) {
      return (
        <div className="flex items-center justify-center py-[80px]">
          <div className="w-[28px] h-[28px] border-2 border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin mr-[10px]" />
          <span className="text-[0.82rem] text-[#6b7280]">Loading student details...</span>
        </div>
      )
    }
    if (studentDetail) {
      return <StudentDetailView student={studentDetail} onBack={closeDetail} />
    }
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <div>
        <h2 className="text-[1.3rem] font-bold text-[#1f2937]">Student Management</h2>
        <p className="text-[0.82rem] text-[#6b7280] mt-[2px]">
          View and manage students assigned to you
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] overflow-hidden">
        <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#f1f5f9]">
          <div className="flex items-center gap-[8px]">
            <i className="ti ti-list text-[16px] text-[#6b7280]" />
            <span className="text-[0.9rem] font-bold text-[#1f2937]">Assigned students</span>
            <span className="text-[0.78rem] text-[#9ca3af] ml-[4px]">({students.length})</span>
          </div>
          <button
            onClick={loadStudents}
            className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#0F766E] text-white rounded-[7px] text-[0.78rem] font-semibold cursor-pointer hover:bg-[#115E59] transition-colors"
          >
            <i className="ti ti-refresh text-[14px]" />
            Refresh
          </button>
        </div>

        {loading && students.length === 0 ? (
          <div className="flex items-center justify-center py-[60px] text-[#6b7280]">
            <div className="w-[24px] h-[24px] border-2 border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin mr-[10px]" />
            <span className="text-[0.82rem]">Loading students...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] text-[#9ca3af]">
            <i className="ti ti-users text-[32px] mb-[8px]" />
            <span className="text-[0.82rem]">No students found</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="text-[#6b7280] font-semibold text-[0.72rem] uppercase tracking-wider">
                  <th className="text-left py-[12px] px-[20px]">Name</th>
                  <th className="text-left py-[12px] px-[20px]">Email</th>
                  <th className="text-left py-[12px] px-[20px]">Status</th>
                  <th className="text-left py-[12px] px-[20px]">Joined</th>
                  <th className="text-left py-[12px] px-[20px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-t border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                    onClick={() => openDetail(student.id)}
                  >
                    <td className="py-[12px] px-[20px] font-medium text-[#1f2937]">{student.name}</td>
                    <td className="py-[12px] px-[20px] text-[#6b7280]">{student.email}</td>
                    <td className="py-[12px] px-[20px]">
                      <span
                        className={`inline-block px-[10px] py-[3px] rounded-full text-[0.7rem] font-bold uppercase ${
                          STATUS_STYLES[student.status] || ''
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-[12px] px-[20px] text-[#6b7280]">{formatDate(student.created_at)}</td>
                    <td className="py-[12px] px-[20px]" onClick={(e) => e.stopPropagation()}>
                      {student.status === 'pending' ? (
                        <button
                          onClick={() => approveStudent(student.id).then(() => updateStudentStatus(student.id, 'approved')).catch((e) => alert(e.message))}
                          className="text-[#0F766E] font-bold cursor-pointer hover:underline bg-transparent border-none text-[0.82rem]"
                        >
                          Approve
                        </button>
                      ) : student.status === 'approved' ? (
                        <button
                          onClick={() => revokeStudent(student.id).then(() => updateStudentStatus(student.id, 'revoked')).catch((e) => alert(e.message))}
                          className="text-[#9ca3af] cursor-pointer hover:text-[#6b7280] bg-transparent border-none text-[0.82rem]"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-[#d1d5db]">Revoked</span>
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
