import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'
import { FUR, INK, tipColor, whiskerColor } from './fur'
import { Cheek, Ear, FloatingZs, Muzzle, Whiskers, selfPivot } from './parts'
import type { CatProps } from './types'

const BODY = 'M38 86 C36 54 68 34 110 36 C158 38 192 62 188 92 C185 114 152 120 108 120 C66 120 40 112 38 86 Z'
const HEAD_C = { cx: 68, cy: 78, r: 30 }

/** Curled-up sleeping cat, seen from the side. The body breathes slowly and little z's drift up from its head. */
export function SleepyCat({ className = 'w-48', color = 'ginger' }: CatProps & { delay?: number }) {
  const fur = FUR[color]
  const reduce = useReducedMotion() ?? false
  const id = useId()
  const tip = tipColor(fur)

  return (
    <svg viewBox="0 0 200 132" className={className} aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={`${id}b`}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={`${id}h`}>
          <circle {...HEAD_C} />
        </clipPath>
      </defs>

      <ellipse cx={112} cy={122} rx={78} ry={5} fill={INK} opacity={0.07} />

      <motion.g
        style={selfPivot('50% 85%')}
        animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
        transition={{ duration: 3.8, ease: 'easeInOut', repeat: Infinity }}>
        {/* body */}
        <path d={BODY} fill={fur.base} />
        {fur.stripe && (
          <g clipPath={`url(#${id}b)`} fill="none" stroke={fur.stripe} strokeWidth={6} strokeLinecap="round">
            <path d="M104 36 C110 50 106 64 100 74" />
            <path d="M128 38 C136 52 134 66 128 78" />
            <path d="M152 46 C162 58 160 72 154 84" />
            <path d="M174 60 C182 72 180 84 174 96" />
          </g>
        )}
        {fur.patches && (
          <g clipPath={`url(#${id}b)`}>
            <ellipse cx={126} cy={58} rx={30} ry={22} fill={fur.patches[0]} />
            <ellipse cx={176} cy={92} rx={24} ry={18} fill={fur.patches[1]} />
          </g>
        )}

        {/* tail wrapped around the front */}
        <path d="M162 105 C146 124 102 130 64 121 C48 117 41 106 48 99" fill="none" stroke={fur.base} strokeWidth={13} strokeLinecap="round" />
        <path d="M64 121 C48 117 41 106 48 99" fill="none" stroke={tip} strokeWidth={13} strokeLinecap="round" />

        {/* tucked front paw */}
        <rect x={78} y={102} width={20} height={13} rx={6.5} fill={fur.light} />
        <path d="M85 110 v4 M91 110 v4" stroke={fur.shade} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />

        {/* head */}
        <motion.g
          style={selfPivot('50% 100%')}
          animate={reduce ? undefined : { rotate: [0, -3, 0, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 5.2, ease: 'easeInOut' }}>
          <Ear x={48} y={58} fur={fur} patch={fur.patches?.[0]} rotate={-14} s={0.95} />
          <Ear x={86} y={54} fur={fur} flip rotate={6} s={0.95} />
        </motion.g>
        <circle {...HEAD_C} fill={fur.base} />
        {fur.stripe && (
          <g clipPath={`url(#${id}h)`} fill="none" stroke={fur.stripe} strokeWidth={4} strokeLinecap="round">
            <path d="M68 48 V62" />
            <path d="M58 50 L60 62" />
            <path d="M78 50 L76 62" />
          </g>
        )}
        {fur.patches && (
          <g clipPath={`url(#${id}h)`}>
            <circle cx={50} cy={60} r={18} fill={fur.patches[0]} />
          </g>
        )}

        {/* closed eyes */}
        <g fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round">
          <path d="M50 80 Q56 86 62 80" />
          <path d="M74 80 Q80 86 86 80" />
        </g>
        <Cheek cx={48} cy={90} r={5.5} />
        <Cheek cx={88} cy={90} r={5.5} />
        <Muzzle x={68} y={87} s={0.95} />
        <Whiskers x={44} y={88} dir={-1} len={13} spread={4} color={whiskerColor(fur)} />
        <Whiskers x={92} y={88} dir={1} len={13} spread={4} color={whiskerColor(fur)} />
      </motion.g>

      <FloatingZs x={100} y={40} still={reduce} />
    </svg>
  )
}
