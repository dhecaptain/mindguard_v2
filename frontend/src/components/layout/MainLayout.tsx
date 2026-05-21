import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useUiStore } from '../../store'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <div className="flex h-screen bg-[#f7f9fb] font-sans overflow-hidden">
      {/* Backdrop — only on mobile when sidebar is open */}
      {sidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-[14px] md:p-[22px_24px] flex flex-col gap-[12px] md:gap-[16px]">
          {children}
        </div>
      </div>
    </div>
  )
}
