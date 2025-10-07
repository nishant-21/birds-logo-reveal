import { initSessionIfMissing } from './rtdb.js'

export async function ensureDemoSession() {
  await initSessionIfMissing('demoo')
}
