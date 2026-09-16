import { useEffect } from 'react'
import { useSelfStore } from '../store/selfStore'
import { useUiStore } from '../store'
import SessionCard from '../components/self/SessionCard'
import EmptyState from '../components/self/EmptyState'

export default function AnalysisHistoryPage() {
  const sessions = useSelfStore((s) => s.sessions)
  const catalogLoaded = useSelfStore((s) => s.catalogLoaded)
  const loadCatalog = useSelfStore((s) => s.loadCatalog)
  const openSession = useSelfStore((s) => s.openSession)
  const { setPage } = useUiStore()

  useEffect(() => {
    if (!catalogLoaded) loadCatalog()
  }, [catalogLoaded, loadCatalog])

  return (
    <div className="flex flex-col gap-[16px]">
      <div>
        <h1 className="text-[1.25rem] font-bold text-[#1f2937]">Analysis history</h1>
        <p className="text-[0.82rem] text-[#6b7280] mt-[3px]">
          Every analysis run you've requested. Select a session to see the full report.
        </p>
      </div>

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