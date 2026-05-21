import { useEffect } from 'react'
import { useCounsellorStore } from '../store/counsellorStore'
import { getDashboard } from '../api/counsellor'
import { useUiStore } from '../store'

function formatDate(d: string) {
  if (!d) return '—'
  const dt = new Date(d)
  const now = new Date()
  const diff = now.getTime() - dt.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CounsellorDashboardPage() {
  const { dashboard, setDashboard, setLoading, loading } = useCounsellorStore()
  const setPage = useUiStore((s) => s.setPage)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const data = await getDashboard()
      setDashboard(data)
    } catch {}
    setLoading(false)
  }

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center py-[80px] text-[#6b7280]">
        <div className="w-[28px] h-[28px] border-2 border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin mr-[10px]" />
        Loading dashboard...
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="flex flex-col gap-[16px]">
      <div>
        <h2 className="text-[1.3rem] font-bold text-[#1f2937]">Counsellor Dashboard</h2>
        <p className="text-[0.82rem] text-[#6b7280] mt-[2px]">
          Overview of your students and activities
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px]">
        <div onClick={() => setPage('students')} className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[18px] cursor-pointer hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-[10px]">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-[#e0f2fe] flex items-center justify-center">
              <i className="ti ti-users text-[#0284c7] text-[20px]" />
            </div>
            <div>
              <div className="text-[1.3rem] font-bold text-[#1f2937]">{dashboard.total_students}</div>
              <div className="text-[0.72rem] text-[#6b7280]">Total Students</div>
            </div>
          </div>
        </div>
        <div onClick={() => setPage('students')} className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[18px] cursor-pointer hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-[10px]">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-[#fef3c7] flex items-center justify-center">
              <i className="ti ti-clock text-[#d97706] text-[20px]" />
            </div>
            <div>
              <div className="text-[1.3rem] font-bold text-[#1f2937]">{dashboard.pending_approvals}</div>
              <div className="text-[0.72rem] text-[#6b7280]">Pending Approvals</div>
            </div>
          </div>
        </div>
        <div onClick={() => setPage('referrals')} className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[18px] cursor-pointer hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-[10px]">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-[#d1fae5] flex items-center justify-center">
              <i className="ti ti-file-description text-[#059669] text-[20px]" />
            </div>
            <div>
              <div className="text-[1.3rem] font-bold text-[#1f2937]">{dashboard.open_referrals}</div>
              <div className="text-[0.72rem] text-[#6b7280]">Open Referrals</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[18px]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-[#fee2e2] flex items-center justify-center">
              <i className="ti ti-alert-triangle text-[#dc2626] text-[20px]" />
            </div>
            <div>
              <div className="text-[1.3rem] font-bold text-[#dc2626]">{dashboard.crisis_flags_7d}</div>
              <div className="text-[0.72rem] text-[#6b7280]">Crisis Alerts (7d)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent referrals */}
      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)]">
        <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#f1f5f9]">
          <h3 className="text-[0.9rem] font-bold text-[#1f2937]">Recent Referrals</h3>
          <button onClick={() => setPage('referrals')} className="text-[0.78rem] text-[#0F766E] font-semibold cursor-pointer bg-transparent border-none hover:underline">
            View all
          </button>
        </div>
        {dashboard.recent_referrals.length === 0 ? (
          <div className="py-[40px] text-center text-[#9ca3af] text-[0.82rem]">No recent referrals</div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {dashboard.recent_referrals.map((r) => (
              <div key={r.id} className="px-[20px] py-[10px] flex items-center gap-[12px]">
                <div className={`w-[8px] h-[8px] rounded-full flex-shrink-0 ${
                  r.urgency === 'crisis' ? 'bg-[#dc2626] animate-pulse' :
                  r.urgency === 'high' ? 'bg-[#ef4444]' :
                  r.urgency === 'medium' ? 'bg-[#f59e0b]' : 'bg-[#9ca3af]'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8rem] text-[#1f2937] font-medium">{r.student_name || r.student_id}</div>
                  <div className="text-[0.7rem] text-[#6b7280] capitalize">{r.urgency} urgency · {r.status}</div>
                </div>
                <span className="text-[0.7rem] text-[#9ca3af] flex-shrink-0">{formatDate(r.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
