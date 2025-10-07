import React, { useMemo, useState } from 'react'
import { db, incrementTap, resetSession, setSessionConfig, overrideCurrentTaps, initSessionIfMissing } from '../firebase/rtdb.js'
import defaults from '../utils/sessionDefaults.json'

export default function AdminView({ sessionId, session }) {
  const [totalTaps, setTotalTaps] = useState(session?.totalTaps ?? defaults.totalTaps)
  const [thresholdsText, setThresholdsText] = useState((session?.stageThresholds || defaults.stageThresholds).join(','))

  const sessionLink = useMemo(() => `${window.location.origin}/?session=${encodeURIComponent(sessionId)}`, [sessionId])
  const mainLink = useMemo(() => `${sessionLink}&view=main`, [sessionLink])

  async function onSave() {
    const stageThresholds = thresholdsText.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n))
    await setSessionConfig(sessionId, { totalTaps: parseInt(totalTaps, 10), stageThresholds })
  }

  async function onInit() {
    await initSessionIfMissing(sessionId)
  }

  return (
    <div className="view admin">
      <h1>Admin</h1>
      <div className="row">
        <label>Total taps</label>
        <input type="number" value={totalTaps} onChange={(e) => setTotalTaps(e.target.value)} />
      </div>
      <div className="row">
        <label>Stage thresholds (comma-separated)</label>
        <input value={thresholdsText} onChange={(e) => setThresholdsText(e.target.value)} />
      </div>
      <div className="actions">
        <button onClick={onSave}>Save Config</button>
        <button onClick={() => overrideCurrentTaps(sessionId, 0)}>Override currentTaps=0</button>
        <button onClick={() => resetSession(sessionId)}>Reset Session</button>
        <button onClick={() => incrementTap(sessionId)}>+1 Test Tap</button>
        <button onClick={onInit}>Init Session If Missing</button>
      </div>

      <h2>Links</h2>
      <div className="links">
        <div>
          Participant: <a href={sessionLink}>{sessionLink}</a>
        </div>
        <div>
          Main Screen: <a href={mainLink}>{mainLink}</a>
        </div>
      </div>
    </div>
  )
}
