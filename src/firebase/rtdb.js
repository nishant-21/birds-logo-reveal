import { initializeApp } from 'firebase/app'
import { getDatabase, ref, runTransaction, set, onValue, update, serverTimestamp } from 'firebase/database'
import { firebaseConfig } from './firebaseConfig.js'
import defaults from '../utils/sessionDefaults.json'

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)

function getClientId() {
  let id = localStorage.getItem('birds_client_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('birds_client_id', id)
  }
  return id
}

export async function initSessionIfMissing(sessionId) {
  const r = ref(db, `/session/${sessionId}`)
  let exists = false
  await new Promise((resolve) => onValue(r, (snap) => { exists = !!snap.val(); resolve() }, { onlyOnce: true }))
  if (!exists) {
    await set(r, {
      totalTaps: defaults.totalTaps,
      currentTaps: 0,
      stageThresholds: defaults.stageThresholds,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      lastTapAt: 0
    })
  }
}

export async function setSessionConfig(sessionId, { totalTaps, stageThresholds }) {
  const r = ref(db, `/session/${sessionId}`)
  await update(r, { totalTaps, stageThresholds })
}

export async function overrideCurrentTaps(sessionId, value) {
  const r = ref(db, `/session/${sessionId}/currentTaps`)
  await set(r, value)
}

export async function resetSession(sessionId) {
  const r = ref(db, `/session/${sessionId}`)
  await update(r, { currentTaps: 0, status: 'in_progress' })
}

export async function incrementTap(sessionId) {
  const id = getClientId()
  const sessionRef = ref(db, `/session/${sessionId}`)
  await runTransaction(sessionRef, (current) => {
    if (!current) return current
    const now = Date.now()
    const lastTapAt = current.lastTapAt || 0
    // Simple global rate limit: ignore if too many in 200ms window (example)
    if (now - lastTapAt < 50) return current

    const next = { ...current }
    next.currentTaps = Math.min((current.currentTaps || 0) + 1, current.totalTaps || 0)
    next.lastTapAt = now
    if (next.currentTaps >= (next.totalTaps || 0)) next.status = 'revealed'
    return next
  })
}
