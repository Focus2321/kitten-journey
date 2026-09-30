import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { FUR, INK, tipColor, whiskerColor } from './fur'
import { Cheek, Ear, Eyes, Muzzle, Whiskers, pivot } from './parts'
import type { CatProps } from './types'

const VW = 170
const VH = 100
const BODY = 'M42 64 C40 43 62 34 92 34 C122 34 140 42 142 60 C144 74 124 81 92 81 C60 81 44 78 42 64 Z'
const STEP = 0.62 // seconds per stride

type LegProps = { x: number; fill: string; phase: 0 | 1; still: boolean }

function Leg({ x, fill, phase, still }: LegProps) {
  const swing = phase ? [22, -22, 22] : [-22, 22, -22]
  return (
    <motion.g
      style={pivot(x, 68)}
      animate={still ? undefined : { rotate: swing }}
      transition={{ duration: STEP, ease: 'easeInOut', repeat: Infinity }}>
      <rect x={x - 6.5} y={64} width={13} height={31} rx={6.5} fill={fill} />
    </motion.g>
  )
}

/**
 * Side-view cat walking left to right across the full width of its container, on loop.
 * Give the wrapper a height (default h-24) and a width (w-full); the cat is bottom-aligned, so it
 * works as a strip along the bottom edge of a section.
 */
export function WalkingCat({ className = 'h-24 w-full', color = 'black', delay = 0 }: CatProps & { delay?: number }) {
  const fur = FUR[color]
  const reduce = useReducedMotion() ?? false
  const id = useId()
  const wrap = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const catW = (box.h * VW) / VH
  const distance = box.w + catW * 1.4
  const duration = distance / 85
  const ready = box.w > 0 && box.h > 0

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`} aria-hidden>
      {ready && (
        <motion.div
          key={`${box.w}-${box.h}`}
          className="absolute bottom-0 left-0 h-full"
          initial={{ x: reduce ? box.w * 0.15 : -catW * 1.2 }}
          animate={reduce ? undefined : { x: [-catW * 1.2, box.w + catW * 0.2] }}
          transition={{ duration, ease: 'linear', repeat: Infinity, delay }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} className="h-full w-auto" style={{ overflow: 'visible' }}>
            <defs>
              <clipPath id={`${id}b`}>
                <path d={BODY} />
              </clipPath>
            </defs>

            <ellipse cx={96} cy={96.5} rx={54} ry={3.2} fill={INK} opacity={0.08} />

            {/* far legs */}
            <Leg x={66} fill={fur.shade} phase={1} still={reduce} />
            <Leg x={114} fill={fur.shade} phase={0} still={reduce} />

            {/* tail (swings from the rump) */}
            <motion.g
              style={pivot(48, 52)}
              animate={reduce ? undefined : { rotate: [-9, 9, -9] }}
              transition={{ duration: STEP * 2, ease: 'easeInOut', repeat: Infinity }}>
              <path d="M48 54 C32 46 20 30 28 14 C32 5 44 5 48 12" fill="none" stroke={fur.base} strokeWidth={11} strokeLinecap="round" />
              <path d="M28 14 C32 5 44 5 48 12" fill="none" stroke={tipColor(fur)} strokeWidth={11} strokeLinecap="round" />
              {fur.stripe && <path d="M24 34 L34 30 M26 24 L36 22" stroke={fur.stripe} strokeWidth={3.5} strokeLinecap="round" />}
            </motion.g>

            {/* body + head bob together */}
            <motion.g
              animate={reduce ? undefined : { y: [0, -2.4, 0, -2.4, 0] }}
              transition={{ duration: STEP, ease: 'easeInOut', repeat: Infinity }}>
              <path d={BODY} fill={fur.base} />
              <path d="M60 77 C64 85 118 85 130 73 C120 81 66 81 60 77 Z" fill={fur.light} opacity={0.9} />
              {fur.stripe && (
                <g clipPath={`url(#${id}b)`} fill="none" stroke={fur.stripe} strokeWidth={5} strokeLinecap="round">
                  <path d="M76 34 C78 44 76 52 70 58" />
                  <path d="M96 34 C98 44 96 52 90 58" />
                  <path d="M116 37 C120 46 118 54 112 60" />
                </g>
              )}
              {fur.patches && (
                <g clipPath={`url(#${id}b)`}>
                  <ellipse cx={72} cy={46} rx={26} ry={18} fill={fur.patches[0]} />
                  <ellipse cx={122} cy={44} rx={18} ry={14} fill={fur.patches[1]} />
                </g>
              )}

              {/* head, slightly turned to us */}
              <motion.g
                style={pivot(140, 60)}
                animate={reduce ? undefined : { rotate: [0, 2, 0, -2, 0] }}
                transition={{ duration: STEP * 2, ease: 'easeInOut', repeat: Infinity }}>
                <Ear x={126} y={30} fur={fur} rotate={-14} s={0.9} patch={fur.patches?.[0]} />
                <Ear x={152} y={28} fur={fur} flip rotate={14} s={0.9} patch={fur.patches?.[1]} />
                <path d="M141 68 C124 68 118 58 118 47 C118 33 129 26 141 26 C156 26 164 36 164 48 C164 60 156 68 141 68 Z" fill={fur.base} />
                {fur.stripe && (
                  <g fill="none" stroke={fur.stripe} strokeWidth={3.6} strokeLinecap="round">
                    <path d="M140 27 V38" />
                    <path d="M132 29 L134 39" />
                    <path d="M148 28 L147 38" />
                  </g>
                )}
                {fur.patches && <ellipse cx={128} cy={40} rx={11} ry={12} fill={fur.patches[0]} />}
                <Eyes xs={[134, 152]} cy={47} r={3.6} ry={4.2} fur={fur} still={reduce} delay={delay + 0.4} />
                <Cheek cx={126} cy={55} r={4.2} />
                <Cheek cx={160} cy={55} r={4.2} />
                <Muzzle x={143} y={54} s={0.72} />
                <Whiskers x={158} y={56} dir={1} len={12} spread={3} color={whiskerColor(fur)} />
                <Whiskers x={128} y={58} dir={-1} len={9} spread={2.5} color={whiskerColor(fur)} />
              </motion.g>
            </motion.g>

            {/* near legs */}
            <Leg x={54} fill={fur.base} phase={0} still={reduce} />
            <Leg x={126} fill={fur.base} phase={1} still={reduce} />
          </svg>
        </motion.div>
      )}
    </div>
  )
}
