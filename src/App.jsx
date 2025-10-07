import React, { useEffect, useMemo, useState } from 'react'
import EggView from './components/EggView.jsx'
import { onValue, ref } from 'firebase/database'
import { db, initSessionIfMissing } from './firebase/rtdb.js'
import defaults from './utils/sessionDefaults.json'

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), [])
}

export default function App() {
  const query = useQuery()
  const sessionId = query.get('session') || 'demo'

  const [session, setSession] = useState({
    totalTaps: defaults.totalTaps,
    currentTaps: 0,
    stageThresholds: defaults.stageThresholds,
    status: 'in_progress',
  })
  const [lastUpdate, setLastUpdate] = useState(0)

  // Ensure the session node exists (demo convenience)
  useEffect(() => {
    initSessionIfMissing(sessionId)
  }, [sessionId])

  useEffect(() => {
    const r = ref(db, `/session/${sessionId}`)
    return onValue(r, (snap) => {
      const val = snap.val()
      if (val) {
        console.log('[RTDB]', sessionId, val)
        setSession(val)
        setLastUpdate(Date.now())
      }
    })
  }, [sessionId])

  return <EggView sessionId={sessionId} session={session} lastUpdate={lastUpdate} />
}
