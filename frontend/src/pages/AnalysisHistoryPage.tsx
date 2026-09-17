import { useEffect } from 'react'
import { useSelfStore } from '../store/selfStore'
import { useUiStore } from '../store'
import SessionCard from '../components/self/SessionCard'
import EmptyState from '../components/self/EmptyState'

export default function AnalysisHistoryPage() {
  const sessions = useSelfStore((s) => s.sessions)
  const catalogLoaded = useSelfStore((s) => s.catalogLoaded)
  const error = useSelfStore((s) => s.error)
  const loadCatalog = useSelfStore((s) => s.loadCatalog)
  const clearError = useSelfStore((s) => s.clearError)
  const openSession = useSelfStore((s) => s.openSession)
  const { setPage } = useUiStore()

  useEffect(() => {
    if (!catalogLoaded) loadCatalog()
  }, [catalogLoaded, loadCatalog])

  if (!catalogLoaded) {
    return (
      <div className="flex flex-col gap-[16px]">
        <div>
          <h1 className="text-[1.25rem] font-bold text-[#1f2937]">Analysis history</h1>
          <p className="text-[0.82rem] text-[#6b7280] mt-[3px]">
            Every analysis run you've requested. Select a session to see the full report.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-[32px] flex items-center gap-[10px] text-[0.85rem] text-[#6b7280]">
          <div className="w-[18px] h-[18px] border-[2px] border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin" />
          Loading your analysis history…
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <div>
        <h1 className="text-[1.25rem] font-bold text-[#1f2937]">Analysis history</h1>
        <p className="text-[0.82rem] text-[#6b7280] mt-[3px]">
          Every analysis run you've requested. Select a session to see the full report.
        </p>
      </div>

      {error && (
        <div className="px-[14px] py-[10px] rounded-[8px] bg-[#fef2f2] border border-[#fecaca] text-[0.8rem] text-[#991b1b] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-[0.78rem] font-semibold underline cursor-pointer bg-transparent border-none text-[#991b1b] hover:text-[#dc2626]">Dismiss</button>
        </div>
      )}

      {sessions.length === 0 ? (
        <EmptyState
          icon="ti ti-clock"
          title="No analysis history yet"
          body="When you run your first analysis, the results will appear here. Connect your accounts and run an analysis to get started."
          action={
            <button
              onClick={() => setPage('dashboard')}
              className="px-[16px] py-[9px] rounded-[8px] bg-[#0F766E] text-white text-[0.85rem] font-semibold cursor-pointer hover:bg-[#115E59]"
            >
              Go to dashboard
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-[8px]">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onOpen={(id) => {
                openSession(id)
                setPage('self-session')
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}