import { getAuth, signInAnonymously, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { app } from './rtdb.js'

const auth = getAuth(app)

async function ensureAnonAuth() {
  try {
    await setPersistence(auth, browserLocalPersistence)
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
  } catch (e) {
    // Non-fatal for local dev; logs help diagnose rules-related issues
    console.warn('Anon auth failed or not permitted:', e?.code || e?.message)
  }
}

ensureAnonAuth()
