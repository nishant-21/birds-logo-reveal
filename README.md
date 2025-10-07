# B.I.R.D.S — Live Logo Reveal (Egg Tap Experience)

Minimal scaffold for a React (Vite) + Firebase Realtime Database app to power a live-synced egg cracking reveal.

## Quick start

- Install deps:
  - npm install
- Configure Firebase in `src/firebase/firebaseConfig.js` (copy values from Firebase console)
- Optional: initialize a demo session in RTDB (`session/demo`) via Admin view
- Run locally:
  - npm run dev
- Open URLs:
  - Participant: http://localhost:5173/?session=demo
  - Main screen: http://localhost:5173/?session=demo&view=main
  - Admin: http://localhost:5173/?session=demo&view=admin

## Files

- `src/components/ParticipantView.jsx` — mobile tap UI, optimistic tap, progress bar
- `src/components/MainScreen.jsx` — full-screen SVG egg with stage-based visuals
- `src/components/AdminView.jsx` — configure `totalTaps`, `stageThresholds`, reset/override
- `src/components/SVGEgg.jsx` — placeholder egg SVG. Replace with layered `public/egg.svg`
- `src/firebase/rtdb.js` — RTDB init, transaction-based increment, session helpers
- `src/hooks/useTapRateLimit.js` — client-side 5 taps/sec guard
- `src/utils/sessionDefaults.json` — default total taps + thresholds
- `firebase.rules.json` — example rules. Tighten for production

## RTDB data model

/session/{sessionId}:
- totalTaps: number
- currentTaps: number
- status: "in_progress" | "revealed" | "reset"
- stageThresholds: number[]
- createdAt: ISO string
- lastTapAt: number (ms)

## Deploy (Firebase Hosting)

1) `firebase init` → Hosting + Realtime Database
2) Copy `firebase.rules.json` to RTDB rules (adjust for prod)
3) `npm run build`
4) `firebase deploy --only hosting`

Create a session at `/session/{sessionId}` or use Admin `Init Session`.
Generate QR to `https://<host>/?session={sessionId}` and `&view=main` for projector.

## Swapping in the production SVG

- Replace `src/components/SVGEgg.jsx` with a component that imports and controls a layered `public/egg.svg`.
- Maintain viewBox `-80 -105 160 210` and `preserveAspectRatio="xMidYMid meet"` for precision.
- Use `<mask>`/`<clipPath>` for reveal and separate `g#shell_piece_top_right` for the falling fragment.

## Notes

- Transactions: `incrementTap(sessionId)` uses RTDB `runTransaction` to avoid races and flips `status` to `revealed` when taps >= total.
- Client rate limit: 5 taps/sec in UI; server-side guard is a simple global check via `lastTapAt`. Replace with more robust rules or Cloud Functions if needed.
- Add `public/logo_placeholder.png` (1024×1024) for real logo in the mask layer.
