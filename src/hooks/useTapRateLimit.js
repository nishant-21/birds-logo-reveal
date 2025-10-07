import { useRef } from 'react'

export function useTapRateLimit({ perSecond } = {}) {
  const timesRef = useRef([])

  function acceptTap() {
    const now = performance.now()
    const windowMs = 1000
    // If no finite limit is provided, allow unlimited taps
    if (!Number.isFinite(perSecond)) return true
    timesRef.current = timesRef.current.filter((t) => now - t < windowMs)
    if (timesRef.current.length >= perSecond) return false
    timesRef.current.push(now)
    return true
  }

  return { acceptTap }
}
