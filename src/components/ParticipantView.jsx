import React, { useCallback, useMemo, useState } from 'react'
import { incrementTap } from '../firebase/rtdb.js'
import { useTapRateLimit } from '../hooks/useTapRateLimit.js'

export default function ParticipantView({ sessionId, session }) {
  const [localTaps, setLocalTaps] = useState(0)
  const { acceptTap } = useTapRateLimit()

  const progress = useMemo(() => {
    const total = session?.totalTaps || 1
    return Math.min(100, Math.round(((session?.currentTaps || 0) / total) * 100))
  }, [session])

  const completed = useMemo(() => {
    if (session?.status === 'revealed') return true
    const total = session?.totalTaps ?? Infinity
    const current = session?.currentTaps ?? 0
    return current >= total
  }, [session])

  const onTap = useCallback(async () => {
    if (completed) return
    if (!acceptTap()) return
    setLocalTaps((t) => t + 1)
    try {
      await incrementTap(sessionId)
    } catch (e) {
      // ignore, RTDB listener is source of truth
      console.error(e)
    }
  }, [acceptTap, sessionId, completed])

  return (
    <div className="view participant">
      <header>
        <h1>Tap to Crack</h1>
        <div className="counter">{session?.currentTaps ?? 0} / {session?.totalTaps ?? 0}</div>
        <div className="progress"><div style={{ width: `${progress}%` }} /></div>
      </header>
      <button className="tap-area" aria-label="Tap to crack the egg" onClick={onTap} onTouchStart={onTap} disabled={completed} style={{ opacity: completed ? 0.6 : 1, cursor: completed ? 'not-allowed' : 'pointer' }}>
        TAP
      </button>
      <div className="hint">Local taps: {localTaps}</div>
    </div>
  )
}
