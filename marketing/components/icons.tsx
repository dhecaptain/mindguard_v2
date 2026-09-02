import type { ReactNode } from 'react'

function Wrap({ children, bg = 'bg-teal-50', color = 'text-teal-600' }: { children: ReactNode; bg?: string; color?: string }) {
  return <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} mb-4`}>{children}</div>
}

const S = { strokeWidth: 1.7 } as const

export const Icons = {
  Shield: () => <Wrap><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z" strokeLinecap="round" strokeLinejoin="round"/></svg></Wrap>,
  Users: () => <Wrap bg="bg-sky-50" color="text-sky-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></Wrap>,
  School: () => <Wrap bg="bg-indigo-50" color="text-indigo-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M3 14l9 5 9-5"/><path d="M3 19l9 5 9-5"/></svg></Wrap>,
  Trash: () => <Wrap bg="bg-slate-50" color="text-slate-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></Wrap>,
  Clipboard: () => <Wrap><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg></Wrap>,
  Stethoscope: () => <Wrap bg="bg-emerald-50" color="text-emerald-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M4 8a4 4 0 0 1 8 0v6a4 4 0 0 0 4 4h1"/><circle cx="18" cy="18" r="3"/><path d="M8 14h4"/></svg></Wrap>,
  Doc: () => <Wrap bg="bg-amber-50" color="text-amber-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></Wrap>,
  Lock: () => <Wrap><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></Wrap>,
  Brain: () => <Wrap bg="bg-violet-50" color="text-violet-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M9 4a4 4 0 0 0-4 4c0 1.5 1 2.5 1 4s-1 2.5-1 4a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4c0-1.5-1-2.5-1-4s1-2.5 1-4a4 4 0 0 0-4-4H9z"/><path d="M12 8v8"/><path d="M9 12h6"/></svg></Wrap>,
  Compass: () => <Wrap bg="bg-orange-50" color="text-orange-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.08 20.12 12 14 5.88 9.92 16.24 7.76"/></svg></Wrap>,
  Refresh: () => <Wrap bg="bg-cyan-50" color="text-cyan-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></Wrap>,
  Scale: () => <Wrap bg="bg-slate-50" color="text-slate-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M12 3l7 4v5c0 3-2.5 6-7 8-4.5-2-7-5-7-8V7l7-4z"/><path d="M12 7v10"/><path d="M9 10h6"/></svg></Wrap>,
  Graduation: () => <Wrap bg="bg-indigo-50" color="text-indigo-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M12 5l9 4-9 4-9-4 9-4z"/><path d="M3 9v4l9 4 9-4V9"/><path d="M9 13a3 3 0 0 0 6 0"/></svg></Wrap>,
  Globe: () => <Wrap bg="bg-teal-50" color="text-teal-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10A15 15 0 0 1 8 12 15 15 0 0 1 12 2z"/></svg></Wrap>,
  Key: () => <Wrap bg="bg-amber-50" color="text-amber-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><circle cx="7" cy="7" r="5"/><path d="M7 12l10 10"/><path d="M13 18l2 2 4-4-2-2z"/></svg></Wrap>,
  ShieldCheck: () => <Wrap bg="bg-emerald-50" color="text-emerald-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/><path d="M9 12l2 2 4-4"/></svg></Wrap>,
  DocCheck: () => <Wrap bg="bg-slate-50" color="text-slate-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg></Wrap>,
  Sparkles: () => <Wrap bg="bg-violet-50" color="text-violet-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 13l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/><path d="M5 13l1 1 1 1-1 1-1 1-1-1-1-1 1-1 1-1z"/></svg></Wrap>,
  Trophy: () => <Wrap bg="bg-amber-50" color="text-amber-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M6 9H4a2 2 0 0 0 2 6h1"/><path d="M18 9h2a2 2 0 0 1-2 6h-1"/><path d="M6 9a6 6 0 0 0 12 0"/><path d="M12 15v4"/><path d="M8 19h8"/><path d="M8 9V7h8v2"/></svg></Wrap>,
  Heart: () => <Wrap bg="bg-rose-50" color="text-rose-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}><path d="M20 12a6 6 0 0 0-8-5.5A6 6 0 0 0 4 12c0 5 8 9 8 9s8-4 8-9z"/></svg></Wrap>,
}
