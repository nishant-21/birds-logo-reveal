import React, { useMemo } from 'react'
import SVGEgg from './SVGEgg.jsx'

function computeStage(currentTaps, thresholds) {
  let stage = 0
  thresholds.forEach((t, i) => {
    if (currentTaps >= t) stage = i + 1
  })
  return stage
}

export default function MainScreen({ sessionId, session, lastUpdate }) {
  const thresholds = session?.stageThresholds || []
  const stage = useMemo(() => computeStage(session?.currentTaps || 0, thresholds), [session, thresholds])
  const live = useMemo(() => Date.now() - (lastUpdate || 0) < 1500, [lastUpdate])

  return (
    <div className="view main">
      <SVGEgg stage={stage} thresholds={thresholds} status={session?.status} />
      <div className="caption">
        <span style={{ color: live ? '#22c55e' : '#9ca3af' }}>●</span>
        {" "}Live — Stage {stage} — {session?.currentTaps ?? 0} / {session?.totalTaps ?? 0}
      </div>
    </div>
  )
}
