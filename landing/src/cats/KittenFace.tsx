import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'
import { FUR, whiskerColor } from './fur'
import { Cheek, Ear, Eyes, Muzzle, Whiskers } from './parts'
import type { CatProps } from './types'

const HEAD = 'M50 92 C26 92 12 76 12 56 C12 34 28 22 50 22 C72 22 88 34 88 56 C88 76 74 92 50 92 Z'

/** Round chibi kitten head (for litters / avatars). Springs in on view after `delay`, then blinks now and then. */
export function KittenFace({ className = 'w-32', color = 'ginger', delay = 0 }: CatProps & { delay?: number }) {
  const fur = FUR[color]
  const reduce = useReducedMotion() ?? false
  const clip = useId()

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: 'spring', stiffness: 240, damping: 15, mass: 0.9, delay, opacity: { duration: 0.25, delay } }}
      style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={clip}>
          <path d={HEAD} />
        </clipPath>
      </defs>

      <Ear x={24} y={34} fur={fur} patch={fur.patches?.[0]} rotate={-8} />
      <Ear x={76} y={34} fur={fur} flip rotate={8} patch={fur.patches?.[1]} />

      <path d={HEAD} fill={fur.base} />

      {fur.stripe && (
        <g clipPath={`url(#${clip})`} fill="none" stroke={fur.stripe} strokeWidth={4.2} strokeLinecap="round">
          <path d="M50 22 V37" />
          <path d="M40 24 L42 36" />
          <path d="M60 24 L58 36" />
          <path d="M12 60 Q20 61 26 66" />
          <path d="M13 70 Q20 70 25 74" />
          <path d="M88 60 Q80 61 74 66" />
          <path d="M87 70 Q80 70 75 74" />
        </g>
      )}
      {fur.patches && (
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={30} cy={36} rx={22} ry={18} fill={fur.patches[0]} />
          <ellipse cx={76} cy={38} rx={16} ry={14} fill={fur.patches[1]} />
        </g>
      )}

      <Cheek cx={23} cy={70} r={6.5} />
      <Cheek cx={77} cy={70} r={6.5} />
      <Eyes xs={[36, 64]} cy={58} r={6.2} ry={7.2} fur={fur} still={reduce} delay={delay} />
      <Muzzle x={50} y={68} s={1.05} />
      <Whiskers x={18} y={64} dir={-1} len={14} color={whiskerColor(fur)} />
      <Whiskers x={82} y={64} dir={1} len={14} color={whiskerColor(fur)} />
    </motion.svg>
  )
}
