import React, { useCallback, useMemo, useState } from 'react'
import SVGEgg from './SVGEgg.jsx'
import { incrementTap } from '../firebase/rtdb.js'
import { useTapRateLimit } from '../hooks/useTapRateLimit.js'

function computeStage(currentTaps, thresholds) {
  let stage = 0
  thresholds.forEach((t, i) => {
    if (currentTaps >= t) stage = i + 1
  })
  return stage
}

export default function EggView({ sessionId, session, lastUpdate }) {
  const { acceptTap } = useTapRateLimit()
  const thresholds = session?.stageThresholds || []
  const stage = useMemo(() => computeStage(session?.currentTaps || 0, thresholds), [session, thresholds])
  const progress = useMemo(() => {
    const total = session?.totalTaps || 1
    return Math.min(100, Math.round(((session?.currentTaps || 0) / total) * 100))
  }, [session])

  const revealed = useMemo(() => {
    if (session?.status === 'revealed') return true
    if (thresholds.length && stage >= thresholds.length) return true
    return false
  }, [session, thresholds, stage])

  const onTap = useCallback(async () => {
    if (revealed) return
    if (!acceptTap()) return
    try {
      await incrementTap(sessionId)
    } catch (e) {
      console.error(e)
    }
  }, [acceptTap, sessionId, revealed])

  const live = useMemo(() => Date.now() - (lastUpdate || 0) < 1500, [lastUpdate])

  return (
    <div className="view main">
      <SVGEgg stage={stage} thresholds={thresholds} status={session?.status} onTap={onTap} />
      <div className="caption">
        <span style={{ color: live ? '#22c55e' : '#9ca3af' }}>●</span>
        {" "}Live — Stage {stage} — {session?.currentTaps ?? 0} / {session?.totalTaps ?? 0} — {progress}%
      </div>
      <div className="progress" style={{ width: 'min(90vw,900px)' }}>
        <div style={{ width: `${progress}%` }} />
      </div>
      <div style={{ opacity: .7, fontSize: 14 }}>Tap directly on the egg</div>
    </div>
  )
}
