import { motion, useReducedMotion } from 'motion/react'

import { Heart, Sparkle } from '../../cats'

// Deterministic scatter so the sky is the same on every render.
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
const stars = Array.from({ length: 46 }, (_, i) => ({
  x: rand(i + 1) * 100,
  y: rand(i + 101) * 100,
  s: 1.5 + rand(i + 201) * 2,
  d: 2.4 + rand(i + 301) * 3,
  o: rand(i + 401) * 2,
}))
const sparkles = [
  { x: 6, y: 18, w: 'w-3' },
  { x: 92, y: 12, w: 'w-4' },
  { x: 78, y: 82, w: 'w-3' },
  { x: 14, y: 76, w: 'w-2.5' },
  { x: 55, y: 6, w: 'w-2.5' },
]

/** Twinkling stars for the night band. Absolutely fills its parent. */
export function NightSky() {
  const reduce = useReducedMotion()
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {stars.map((st, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-ground"
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s }}
          animate={reduce ? { opacity: 0.6 } : { opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: st.d, repeat: Infinity, ease: 'easeInOut', delay: st.o }}
        />
      ))}
      {sparkles.map((sp, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
          animate={reduce ? {} : { scale: [0.6, 1, 0.6], rotate: [0, 25, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}>
          <Sparkle className={sp.w} />
        </motion.span>
      ))}
    </div>
  )
}

/** Soft warm moon glow. Place it behind the pinned phone. */
export function MoonGlow({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full bg-[radial-gradient(closest-side,rgb(255_244_204/0.22),rgb(255_206_58/0.06)_55%,transparent)] ${className}`}
      animate={reduce ? {} : { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

const hearts = [
  { x: 8, d: 0, s: 'w-4' },
  { x: 30, d: 0.5, s: 'w-6' },
  { x: 52, d: 0.2, s: 'w-4' },
  { x: 70, d: 0.9, s: 'w-5' },
  { x: 88, d: 0.35, s: 'w-3.5' },
  { x: 42, d: 1.3, s: 'w-3.5' },
]

/** Hearts drifting upward. Render it when the litter is complete. */
export function FloatingHearts({ className = '', active = true }: { className?: string; active?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      {hearts.map((h, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0"
          style={{ left: `${h.x}%` }}
          initial={{ opacity: 0, y: 0 }}
          animate={active ? { opacity: [0, 1, 1, 0], y: [0, -60, -120, -180], x: [0, 8, -6, 4] } : { opacity: 0 }}
          transition={active ? { duration: 3.2, delay: h.d, repeat: reduce ? 0 : Infinity, repeatDelay: 0.4, ease: 'easeOut' } : { duration: 0.3 }}>
          <Heart className={h.s} />
        </motion.span>
      ))}
    </div>
  )
}
