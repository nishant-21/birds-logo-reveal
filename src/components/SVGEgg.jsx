import React, { useEffect, useRef, useState } from 'react'

// Placeholder SVG egg. Replace with layered egg.svg using <svg> groups and proper masks.
export default function SVGEgg({ stage, thresholds, status, onTap }) {
  const topRightRef = useRef(null)
  const topLeftRef = useRef(null)
  const bottomRightRef = useRef(null)
  const bottomLeftRef = useRef(null)
  const shellBaseRef = useRef(null)
  const logoRef = useRef(null)
  const fragmentRefs = useRef([])
  const prevStageRef = useRef(stage || 0)

  const totalStages = Math.max(1, thresholds?.length || 8)
  const progress = Math.min(1, (stage || 0) / totalStages)
  const revealed = status === 'revealed' || (thresholds.length && stage >= thresholds.length)

  useEffect(() => {
    const isRevealed = status === 'revealed' || (thresholds.length && stage >= thresholds.length)
    // Toggle body background class when revealed
    if (isRevealed) {
      document.body.classList.add('bg-revealed')
    } else {
      document.body.classList.remove('bg-revealed')
    }

    if (!isRevealed) return
    const animations = [
      { ref: topRightRef, to: 'translate(140px,180px) rotate(-40deg)' },
      { ref: topLeftRef, to: 'translate(-140px,160px) rotate(40deg)' },
      { ref: bottomRightRef, to: 'translate(120px,220px) rotate(25deg)' },
      { ref: bottomLeftRef, to: 'translate(-120px,220px) rotate(-25deg)' },
    ]
    animations.forEach(({ ref, to }) => {
      const el = ref.current
      if (!el) return
      el.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: to, opacity: 0 }
      ], { duration: 900, easing: 'cubic-bezier(.22,.9,.35,1)', fill: 'forwards' })
    })

    // Fade out the main shell base
    if (shellBaseRef.current) {
      shellBaseRef.current.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], { duration: 700, easing: 'ease-in', fill: 'forwards' })
    }

    // Fade in the logo smoothly (only during egg phase, before cinematic)
    if (logoRef.current && !cineStart) {
      logoRef.current.animate([
        { opacity: 0 },
        { opacity: 1 }
      ], { duration: 800, easing: 'ease-out', fill: 'forwards' })
    }
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('bg-revealed')
    }
  }, [stage, status, thresholds])

  // Trigger a small fragment fall when stage increments
  useEffect(() => {
    const sPrev = prevStageRef.current || 0
    const sNow = stage || 0
    if (sNow > sPrev) {
      for (let i = sPrev; i < Math.min(sNow, 8); i++) {
        const el = fragmentRefs.current[i]
        if (!el) continue
        el.animate([
          { transform: 'translate(0px,0px) rotate(0deg)', opacity: 1 },
          { transform: `translate(${(i%2?1:-1)*(40+8*i)}px, ${80+10*i}px) rotate(${(i%2?1:-1)*(20+5*i)}deg)`, opacity: 0 }
        ], { duration: 900, easing: 'cubic-bezier(.22,.9,.35,1)', fill: 'forwards' })
      }
    }
    prevStageRef.current = sNow
  }, [stage])

  // Helper: opacity for crack line by stage index (1..8)
  const crackAlpha = (i) => {
    const s = stage || 0
    if (s <= 0) return 0
    const t = Math.min(1, Math.max(0, s - (i - 1)))
    return Math.max(0, Math.min(1, 0.25 + 0.75 * Math.min(1, t)))
  }
  // Cumulative main crack segments with zigzag pattern; stages 1..7
  const crackMain = [
    'M 0 -86 L -2 -80 L 1 -72 L -3 -66',
    'M 0 -86 L -2 -80 L 1 -72 L -3 -66 L 4 -58 L 2 -52 L 6 -50',
    'M 0 -86 L -2 -80 L 1 -72 L -3 -66 L 4 -58 L 2 -52 L 6 -50 L 0 -42 L -4 -36 L -6 -34',
    'M 0 -86 L -2 -80 L 1 -72 L -3 -66 L 4 -58 L 2 -52 L 6 -50 L 0 -42 L -4 -36 L -6 -34 L 2 -26 L 6 -20 L 8 -16',
    'M 0 -86 L -2 -80 L 1 -72 L -3 -66 L 4 -58 L 2 -52 L 6 -50 L 0 -42 L -4 -36 L -6 -34 L 2 -26 L 6 -20 L 8 -16 L 0 -8 L -3 -2 L -4 2',
    'M 0 -86 L -2 -80 L 1 -72 L -3 -66 L 4 -58 L 2 -52 L 6 -50 L 0 -42 L -4 -36 L -6 -34 L 2 -26 L 6 -20 L 8 -16 L 0 -8 L -3 -2 L -4 2 L 2 10 L 5 16 L 4 20',
    'M 0 -86 L -2 -80 L 1 -72 L -3 -66 L 4 -58 L 2 -52 L 6 -50 L 0 -42 L -4 -36 L -6 -34 L 2 -26 L 6 -20 L 8 -16 L 0 -8 L -3 -2 L -4 2 L 2 10 L 5 16 L 4 20 L 1 28 L -2 32 L 0 36'
  ]
  const mainCrackIndex = Math.max(0, Math.min(6, (stage || 0) - 1))

  // Cinematic sequence state
  const [cineStart, setCineStart] = useState(false)
  const [logoMoved, setLogoMoved] = useState(false)
  const [welcomeIn, setWelcomeIn] = useState(false)
  const [birdsIn, setBirdsIn] = useState(false)
  const [groupRaised, setGroupRaised] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [typingStarted, setTypingStarted] = useState(false)

  useEffect(() => {
    const isRevealed = revealed
    if (!isRevealed) return

    // Start cinematic sequence after a brief delay for clean transition
    setTimeout(() => setCineStart(true), 100)

    const timers = []
    // After 3.2s, move logo
    timers.push(setTimeout(() => setLogoMoved(true), 3200))
    // After logo move (0.8s), show Welcome to and then B.I.R.D.S
    timers.push(setTimeout(() => setWelcomeIn(true), 3200 + 820))
    timers.push(setTimeout(() => setBirdsIn(true), 3200 + 820 + 200))
    // Raise group after texts appear
    timers.push(setTimeout(() => setGroupRaised(true), 3200 + 820 + 200 + 800))
    // Start tagline typing after 0.5s delay
    timers.push(setTimeout(() => {
      setTypingStarted(true)
      const full = 'Where Brilliance meets Innovation and Creativity'
      const totalMs = 1800
      const step = Math.max(1, Math.floor(totalMs / full.length))
      let i = 0
      const typeTimer = setInterval(() => {
        i++
        setTypedText(full.slice(0, i))
        if (i >= full.length) clearInterval(typeTimer)
      }, step)
    }, 3200 + 820 + 200 + 800 + 500))

    return () => timers.forEach(clearTimeout)
  }, [revealed])

  return (
    <div className="egg-wrap" role="button" aria-label="Tap the egg" onClick={onTap} onTouchStart={onTap} style={{ cursor: 'pointer', pointerEvents: revealed ? 'none' : 'auto' }}>
      <svg viewBox="-80 -105 160 210" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="Egg">
        <defs>
          <clipPath id="revealMask">
            {/* Smoothly growing aperture to reveal the logo as progress increases */}
            <circle r={10 + progress * 70} cx="0" cy="0" />
          </clipPath>
          {/* Smooth egg shading */}
          <radialGradient id="eggShade" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#f5f2e8" stopOpacity="1" />
            <stop offset="100%" stopColor="#e9e4d6" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="shadowEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Logo layer - hidden when cinematic starts */}
        <g ref={logoRef} clipPath="url(#revealMask)" style={{ opacity: cineStart ? 0 : Math.min(1, progress * 1.1) }}>
          <image href="/logonobg.png" x="-70" y="-70" width="140" height="140" preserveAspectRatio="xMidYMid slice" />
        </g>
        {/* Front shell base — smooth, smaller, shaded egg */}
        <g ref={shellBaseRef} style={{ opacity: revealed ? 0 : 1 }}>
          <g transform="scale(0.92)">
            <ellipse rx="78" ry="102" fill="url(#eggShade)" stroke="#d8d3c4" strokeWidth="0.8" />
            {/* soft highlight */}
            <ellipse rx="30" ry="16" cx="-22" cy="-58" fill="#fff" opacity="0.22" />
            {/* base shadow */}
            <ellipse rx="64" ry="10" cx="0" cy="96" fill="url(#shadowEdge)" opacity="0.25" />
          </g>
        </g>
        {/* Cracking overlay: cumulative main crack from top + later side branches */}
        <g stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: revealed ? 0 : 1 }}>
          {stage > 0 && (
            <path d={crackMain[mainCrackIndex]} />
          )}
          {/* Left branch appears from stage 3 */}
          {stage >= 3 && (
            <path d="M -6 -34 L -14 -28 L -20 -22 L -26 -14 L -32 -6 L -34 2" />
          )}
          {/* Right branch appears from stage 4 */}
          {stage >= 4 && (
            <path d="M 8 -16 L 16 -10 L 22 -2 L 28 6 L 32 14 L 30 22" />
          )}
          {/* Additional left crack from stage 5 */}
          {stage >= 5 && (
            <path d="M -4 2 L -10 8 L -16 14 L -20 22 L -18 30" />
          )}
          {/* Additional right crack from stage 6 */}
          {stage >= 6 && (
            <path d="M 4 20 L 10 26 L 14 32 L 18 40 L 16 46" />
          )}
          {/* Small upper left from stage 7 */}
          {stage >= 7 && (
            <path d="M -3 -66 L -10 -62 L -16 -56 L -22 -48" />
          )}
        </g>
        {/* Stage fragments: eight small chips around the shell */}
        <g>
          {[
            { t: 'translate(14,-62)', d: 'M0 0 C 8 -4 18 -4 20 4 C 22 12 14 20 6 22 C -2 20 -6 12 0 0 Z' },
            { t: 'translate(-20,-64)', d: 'M0 0 C -8 -4 -16 -2 -18 6 C -20 14 -12 22 -4 24 C 6 22 8 14 0 0 Z' },
            { t: 'translate(34,-20)', d: 'M0 0 C 10 -2 18 6 16 12 C 14 20 4 22 -6 16 C -10 12 -6 4 0 0 Z' },
            { t: 'translate(-36,-18)', d: 'M0 0 C -10 -2 -18 6 -16 12 C -14 18 -4 22 6 16 C 10 12 6 4 0 0 Z' },
            { t: 'translate(40,8)', d: 'M0 0 C 8 2 16 8 12 16 C 8 22 -4 22 -10 16 C -14 12 -8 2 0 0 Z' },
            { t: 'translate(-42,10)', d: 'M0 0 C -8 2 -16 8 -12 16 C -8 22 4 22 10 16 C 14 12 8 2 0 0 Z' },
            { t: 'translate(18,38)', d: 'M0 0 C 8 2 14 8 10 14 C 6 20 -6 18 -12 12 C -14 8 -6 2 0 0 Z' },
            { t: 'translate(-16,40)', d: 'M0 0 C -8 2 -14 8 -10 14 C -6 20 6 18 12 12 C 14 8 6 2 0 0 Z' },
          ].map((f, i) => (
            <g key={i} ref={(el) => (fragmentRefs.current[i] = el)} transform={f.t} opacity={0}>
              <path d={f.d} fill="#efe9da" stroke="#d8d3c4" strokeWidth="0.8" />
            </g>
          ))}
        </g>
      </svg>
      {revealed && (
        <div className={`cine-overlay ${cineStart ? 'in' : ''}`} aria-hidden>
          <div className={`bg-fade ${cineStart ? 'in' : ''}`} />
          <div className={`cine-group ${groupRaised ? 'raised' : ''}`}>
            <div className={`cine-center ${logoMoved ? 'moved' : ''}`}>
              <img src="/logonobg.png" alt="B.I.R.D.S Club" className={`cine-logo ${cineStart ? 'in' : ''}`} />
              <div className={`text-col ${logoMoved ? 'in' : ''}`}>
                <div className={`welcome ${welcomeIn ? 'in' : ''}`}>Welcome to</div>
                <div className={`birds ${birdsIn ? 'in' : ''}`}>
                  <span className="birds-text">B.I.R.D.S</span>
                </div>
              </div>
            </div>
            <div className={`tagline ${typingStarted ? 'in' : ''}`}>
              <span className="type">{typedText}</span>
              <span className="cursor">|</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

