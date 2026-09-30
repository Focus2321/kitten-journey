import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'
import { selfPivot } from './parts'
import type { CatProps } from './types'

const TONES = {
  sun: { ball: '#FFCE3A', wrap: '#E9B32A', thread: '#D9A322' },
  paw: { ball: '#FFA7B4', wrap: '#F08A9B', thread: '#E67C8E' },
}

/** Ball of yarn with wrap lines and a loose thread that draws itself in. Wobbles and rolls a little. */
export function YarnBall({ className = 'w-32', tone = 'sun' }: CatProps & { delay?: number; tone?: keyof typeof TONES }) {
  const reduce = useReducedMotion() ?? false
  const id = useId()
  const c = TONES[tone]

  return (
    <motion.svg
      viewBox="0 0 130 120"
      className={className}
      aria-hidden
      style={{ overflow: 'visible' }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}>
      <defs>
        <clipPath id={id}>
          <circle cx={54} cy={60} r={42} />
        </clipPath>
      </defs>

      {/* loose thread, draws itself in */}
      <motion.path
        d="M92 78 C112 84 122 100 110 112 C100 122 84 114 90 104 C94 98 106 100 112 106"
        fill="none"
        stroke={c.thread}
        strokeWidth={4}
        strokeLinecap="round"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1 } }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
      />

      <motion.g
        style={selfPivot('50% 50%')}
        animate={reduce ? undefined : { rotate: [-7, 7, -7], x: [-3, 3, -3] }}
        transition={{ duration: 3.4, ease: 'easeInOut', repeat: Infinity }}>
        <circle cx={54} cy={60} r={42} fill={c.ball} />
        <g clipPath={`url(#${id})`} fill="none" stroke={c.wrap} strokeWidth={4} strokeLinecap="round">
          <path d="M10 46 C34 22 74 22 100 46" />
          <path d="M8 70 C40 44 70 44 100 74" />
          <path d="M14 90 C40 66 76 70 94 96" />
          <path d="M40 16 C26 46 30 80 46 104" />
          <path d="M70 18 C52 50 56 84 72 104" />
          <path d="M92 40 C70 56 68 84 84 98" />
        </g>
        <ellipse cx={38} cy={40} rx={9} ry={5} fill="#FFFFFF" opacity={0.45} transform="rotate(-30 38 40)" />
      </motion.g>
    </motion.svg>
  )
}
