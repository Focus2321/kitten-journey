import { motion, useReducedMotion } from 'motion/react'
import { FloatingZs, selfPivot } from './parts'

/** Four-point sparkle that twinkles by scaling and turning. */
export function Sparkle({ className = 'w-6', color = '#FFCE3A' }: { className?: string; color?: string }) {
  const reduce = useReducedMotion() ?? false
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden style={{ overflow: 'visible' }}>
      <motion.g
        style={selfPivot('50% 50%')}
        animate={reduce ? undefined : { scale: [0.75, 1.1, 0.75], rotate: [0, 25, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}>
        <path d="M12 1 C12.6 7 14.5 9.5 23 12 C14.5 14.5 12.6 17 12 23 C11.4 17 9.5 14.5 1 12 C9.5 9.5 11.4 7 12 1 Z" fill={color} />
      </motion.g>
      <motion.circle
        cx={20}
        cy={4}
        r={1.5}
        fill={color}
        animate={reduce ? undefined : { scale: [0, 1, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, delay: 0.9 }}
        style={selfPivot('50% 50%')}
      />
    </svg>
  )
}

/** Chunky heart with a soft double beat. */
export function Heart({ className = 'w-6', color = '#FFA7B4' }: { className?: string; color?: string }) {
  const reduce = useReducedMotion() ?? false
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden style={{ overflow: 'visible' }}>
      <motion.g
        style={selfPivot('50% 60%')}
        animate={reduce ? undefined : { scale: [1, 1.18, 1, 1.1, 1] }}
        transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, times: [0, 0.18, 0.36, 0.5, 1] }}>
        <path d="M12 21.5 C9 19 2.5 14.5 2.5 8.6 C2.5 5.4 5 3 8 3 C9.8 3 11.2 3.9 12 5.2 C12.8 3.9 14.2 3 16 3 C19 3 21.5 5.4 21.5 8.6 C21.5 14.5 15 19 12 21.5 Z" fill={color} />
        <ellipse cx={8} cy={7.5} rx={1.8} ry={1.1} fill="#FFFFFF" opacity={0.55} transform="rotate(-35 8 7.5)" />
      </motion.g>
    </svg>
  )
}

/** Three little z's drifting up and fading, for sleeping things. */
export function Zzz({ className = 'w-10' }: { className?: string }) {
  const reduce = useReducedMotion() ?? false
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden style={{ overflow: 'visible' }}>
      <FloatingZs x={4} y={30} still={reduce} drift={24} />
    </svg>
  )
}
