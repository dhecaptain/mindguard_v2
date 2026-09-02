import { useSyncExternalStore } from 'react'

function subscribe(query: string, cb: () => void) {
  const mql = window.matchMedia(query)
  const handler = () => cb()
  mql.addEventListener('change', handler)
  return () => mql.removeEventListener('change', handler)
}

export function useMediaQuery(query: string): boolean {
  const getSnapshot = () => window.matchMedia(query).matches
  const getServerSnapshot = () => false
  return useSyncExternalStore(
    (cb) => subscribe(query, cb),
    getSnapshot,
    getServerSnapshot,
  )
}
