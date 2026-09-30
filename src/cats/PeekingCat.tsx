import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useId, useRef } from 'react'
import { FUR, INK, SUN, WHITE, whiskerColor } from './fur'
import { Cheek, Ear, Muzzle, Whiskers, selfPivot } from './parts'
import type { CatProps } from './types'

const HEAD = 'M80 88 C50 88 38 72 38 52 C38 30 56 18 80 18 C104 18 122 30 122 52 C122 72 110 88 80 88 Z'
/** The edge the cat peeks over, in viewBox units (of 110). Paws hang below it. */
export const PEEK_EDGE = 92

/**
 * Cat head and two front paws peeking up over a bottom edge. Blinks, twitches an ear, pupils follow the pointer,
 * and it pops up from below when scrolled into view.
 * The edge line is at 84% of the SVG height: to let the paws hang over a card, nudge it down with
 * `translate-y-[16%]` (or place the SVG so its bottom sits 16% of its height below the card's top).
 */
export function PeekingCat({ className = 'w-40', color = 'tabby', delay = 0 }: CatProps & { delay?: number }) {
  const fur = FUR[color]
  const reduce = useReducedMotion() ?? false
  const id = useId()
  const ref = useRef<SVGSVGElement>(null)
  const px = useSpring(0, { stiffness: 140, damping: 16, mass: 0.6 })
  const py = useSpring(0, { stiffness: 140, damping: 16, mass: 0.6 })

  useEffect(() => {
    if (reduce) return
    const onMove = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const b = el.getBoundingClientRect()
      const dx = e.clientX - (b.left + b.width / 2)
      const dy = e.clientY - (b.top + b.height * 0.45)
      const d = Math.hypot(dx, dy) || 1
      const k = Math.min(1, d / 240) * 3.4
      px.set((dx / d) * k)
      py.set((dy / d) * k)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, px, py])

  const sclera = fur.dark ? SUN : '#FFFDF7'

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 160 110"
      className={className}
      aria-hidden
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={`${id}e`}>
          <rect x={-40} y={-60} width={240} height={PEEK_EDGE + 60} />
        </clipPath>
        <clipPath id={`${id}h`}>
          <path d={HEAD} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}e)`}>
        <motion.g
          variants={{ hidden: { y: 100 }, show: { y: 0 } }}
          transition={{ type: 'spring', stiffness: 170, damping: 17, mass: 0.9, delay }}>
          {/* chest */}
          <path d={`M44 ${PEEK_EDGE + 10} V74 C44 62 54 58 64 58 H96 C106 58 116 62 116 74 V${PEEK_EDGE + 10} Z`} fill={fur.base} />
          <path d={`M60 ${PEEK_EDGE + 10} V82 C60 74 68 70 80 70 C92 70 100 74 100 82 V${PEEK_EDGE + 10} Z`} fill={fur.light} />

          {/* ears (right one twitches) */}
          <Ear x={52} y={30} fur={fur} patch={fur.patches?.[0]} rotate={-12} s={1.1} />
          <motion.g
            style={selfPivot('50% 100%')}
            animate={reduce ? undefined : { rotate: [0, 14, -5, 0] }}
            transition={{ duration: 0.55, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.6, delay: 2.2 + delay }}>
            <Ear x={108} y={30} fur={fur} flip rotate={12} s={1.1} patch={fur.patches?.[1]} />
          </motion.g>

          {/* head */}
          <path d={HEAD} fill={fur.base} />
          {fur.stripe && (
            <g clipPath={`url(#${id}h)`} fill="none" stroke={fur.stripe} strokeWidth={4.4} strokeLinecap="round">
              <path d="M80 18 V34" />
              <path d="M69 20 L71 34" />
              <path d="M91 20 L89 34" />
              <path d="M38 54 Q46 55 52 60" />
              <path d="M39 64 Q46 64 51 68" />
              <path d="M122 54 Q114 55 108 60" />
              <path d="M121 64 Q114 64 109 68" />
            </g>
          )}
          {fur.patches && (
            <g clipPath={`url(#${id}h)`}>
              <ellipse cx={56} cy={34} rx={24} ry={20} fill={fur.patches[0]} />
              <ellipse cx={108} cy={36} rx={18} ry={16} fill={fur.patches[1]} />
            </g>
          )}

          {/* eyes: sclera, pointer-following pupils, blink */}
          <motion.g
            style={selfPivot()}
            animate={reduce ? undefined : { scaleY: [1, 0.06, 1] }}
            transition={{ duration: 0.17, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3.3, delay: 1.6 + delay }}>
            <ellipse cx={64} cy={54} rx={8.5} ry={9.5} fill={sclera} />
            <ellipse cx={96} cy={54} rx={8.5} ry={9.5} fill={sclera} />
            <motion.g style={{ x: px, y: py }}>
              <circle cx={64} cy={55} r={5.2} fill={INK} />
              <circle cx={96} cy={55} r={5.2} fill={INK} />
              <circle cx={66} cy={52.5} r={1.8} fill={WHITE} />
              <circle cx={98} cy={52.5} r={1.8} fill={WHITE} />
            </motion.g>
          </motion.g>

          <Cheek cx={50} cy={68} r={6.5} />
          <Cheek cx={110} cy={68} r={6.5} />
          <Muzzle x={80} y={66} s={1.1} />
          <Whiskers x={42} y={66} dir={-1} len={18} color={whiskerColor(fur)} />
          <Whiskers x={118} y={66} dir={1} len={18} color={whiskerColor(fur)} />
        </motion.g>
      </g>

      {/* paws over the edge */}
      <motion.g
        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, delay: delay + 0.28 }}>
        {[50, 84].map((x) => (
          <g key={x}>
            <rect x={x} y={PEEK_EDGE - 12} width={26} height={28} rx={11} fill={fur.base} />
            <path d={`M${x + 9} ${PEEK_EDGE + 4} v8 M${x + 17} ${PEEK_EDGE + 4} v8`} stroke={fur.shade} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
          </g>
        ))}
      </motion.g>
    </motion.svg>
  )
}
