import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'

import { Heart, KittenFace, Sparkle } from '../../cats'

type Particle = { kind: 'heart' | 'sparkle' | 'face'; x: number; y: number; size: number; rotate: number; delay: number; drift: number }

const faceColors = ['tabby', 'ginger', 'grey', 'calico'] as const

/** Deterministic 0–1 noise so the layout is stable across renders. */
const noise = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/** A ring of hearts, sparkles and kitten faces that pops outwards from the centre and then floats. */
export function Burst({ count = 18, radius = 220 }: { count?: number; radius?: number }) {
  const reduced = useReducedMotion()
  const items = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (noise(i, 1) - 0.5) * 0.4
        const dist = radius * (0.6 + noise(i, 2) * 0.5)
        const kind: Particle['kind'] = i % 6 === 0 ? 'face' : i % 2 ? 'heart' : 'sparkle'
        return {
          kind,
          x: Math.cos(angle) * dist * 1.25,
          y: Math.sin(angle) * dist * 0.8,
          size: kind === 'face' ? 44 + noise(i, 3) * 16 : 18 + noise(i, 3) * 20,
          rotate: (noise(i, 4) - 0.5) * 40,
          delay: noise(i, 5) * 0.25,
          drift: 2.6 + noise(i, 6) * 1.6,
        }
      }),
    [count, radius],
  )

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {items.map((it, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{ x: it.x, y: it.y, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 110, damping: 13, delay: it.delay }}>
          <motion.div
            style={{ width: it.size }}
            animate={reduced ? undefined : { y: [0, -12, 0], rotate: [it.rotate - 8, it.rotate + 8, it.rotate - 8] }}
            transition={{ duration: it.drift, repeat: Infinity, ease: 'easeInOut', delay: it.delay }}>
            {it.kind === 'heart' && <Heart className="w-full" />}
            {it.kind === 'sparkle' && <Sparkle className="w-full" color={i % 4 ? '#15130F' : '#FFA7B4'} />}
            {it.kind === 'face' && <KittenFace className="w-full" color={faceColors[i % faceColors.length]} />}
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
