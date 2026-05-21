import { useEffect, useRef, useCallback } from 'react'

const IDLE_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const

export function useIdleTimeout(
  onWarning: () => void,
  onTimeout: () => void,
  timeoutMs = 15 * 60 * 1000,
  warningMs = 60 * 1000,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warnRef.current) clearTimeout(warnRef.current)
    warnRef.current = setTimeout(onWarning, timeoutMs - warningMs)
    timeoutRef.current = setTimeout(onTimeout, timeoutMs)
  }, [onWarning, onTimeout, timeoutMs, warningMs])

  useEffect(() => {
    IDLE_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, reset))
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warnRef.current) clearTimeout(warnRef.current)
    }
  }, [reset])

  return { reset }
}
