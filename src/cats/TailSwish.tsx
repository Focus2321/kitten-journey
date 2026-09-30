import { motion, useReducedMotion } from 'motion/react'
import { FUR, tipColor } from './fur'
import { pivot, wave } from './parts'
import type { CatProps } from './types'

const X = 40
const DUR = 3.6

function Rings({ ys, color }: { ys: number[]; color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={5} strokeLinecap="round">
      {ys.map((y) => (
        <path key={y} d={`M${X - 6} ${y} H${X + 6}`} />
      ))}
    </g>
  )
}

/**
 * A long tail hanging down from the top edge, swishing lazily like a cat dangling it off a shelf.
 * Place it with its top flush against the edge it hangs from.
 */
export function TailSwish({ className = 'w-16', color = 'ginger' }: CatProps & { delay?: number }) {
  const fur = FUR[color]
  const reduce = useReducedMotion() ?? false
  const loop = { duration: DUR, ease: 'easeInOut' as const, repeat: Infinity }
  const stripe = fur.stripe

  return (
    <svg viewBox="0 0 80 170" className={className} aria-hidden style={{ overflow: 'visible' }}>
      <motion.g style={pivot(X, -2)} animate={reduce ? undefined : { rotate: wave(6) }} transition={loop}>
        <path d={`M${X} -6 V62`} fill="none" stroke={fur.base} strokeWidth={18} strokeLinecap="round" />
        {stripe && <Rings ys={[20, 42]} color={stripe} />}

        <motion.g style={pivot(X, 60)} animate={reduce ? undefined : { rotate: wave(9, 0.8) }} transition={loop}>
          <path d={`M${X} 60 V112`} fill="none" stroke={fur.base} strokeWidth={18} strokeLinecap="round" />
          {stripe && <Rings ys={[74, 96]} color={stripe} />}

          <motion.g style={pivot(X, 110)} animate={reduce ? undefined : { rotate: wave(13, 1.6) }} transition={loop}>
            <path d={`M${X} 110 V150`} fill="none" stroke={fur.base} strokeWidth={18} strokeLinecap="round" />
            <path d={`M${X} 136 V150`} fill="none" stroke={tipColor(fur)} strokeWidth={18} strokeLinecap="round" />
            {stripe && <Rings ys={[124]} color={stripe} />}
          </motion.g>
        </motion.g>
      </motion.g>
    </svg>
  )
}
