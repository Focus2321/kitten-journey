import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { INK, PINK, SUN, WHITE, type Fur } from './fur'

/** Pivot a group around a point in viewBox units (stable even when children move). */
export const pivot = (x: number, y: number): CSSProperties => ({ transformBox: 'view-box', transformOrigin: `${x}px ${y}px` })

/** Pivot a leaf group around a point relative to its own fill box. */
export const selfPivot = (origin = '50% 50%'): CSSProperties => ({ transformBox: 'fill-box', transformOrigin: origin })

/** Sine keyframes for chained swaying parts: `lag` shifts the phase. */
export const wave = (amp: number, lag = 0, n = 8) => Array.from({ length: n + 1 }, (_, k) => +(amp * Math.sin((2 * Math.PI * k) / n - lag)).toFixed(2))

type EyeProps = { cx: number; cy: number; r?: number; ry?: number; fur: Fur }

/** A chibi eye: solid ink with a white catchlight; sun iris on dark fur so it stays visible. */
export function Eye({ cx, cy, r = 6, ry = r * 1.15, fur }: EyeProps) {
  return (
    <g>
      {fur.dark ? (
        <>
          <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill={SUN} />
          <ellipse cx={cx} cy={cy + ry * 0.05} rx={r * 0.6} ry={ry * 0.7} fill={INK} />
        </>
      ) : (
        <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill={INK} />
      )}
      <circle cx={cx + r * 0.34} cy={cy - ry * 0.38} r={r * 0.3} fill={WHITE} />
    </g>
  )
}

type EyesProps = { xs: [number, number]; cy: number; r?: number; ry?: number; fur: Fur; still?: boolean; delay?: number }

/** Two eyes that blink every few seconds. */
export function Eyes({ xs, cy, r = 6, ry, fur, still, delay = 0 }: EyesProps) {
  return (
    <motion.g
      style={selfPivot()}
      animate={still ? undefined : { scaleY: [1, 0.08, 1] }}
      transition={{ duration: 0.16, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.9 + delay, delay: 1.2 + delay }}>
      <Eye cx={xs[0]} cy={cy} r={r} ry={ry} fur={fur} />
      <Eye cx={xs[1]} cy={cy} r={r} ry={ry} fur={fur} />
    </motion.g>
  )
}

/** Ink nose and a little "w" mouth, centred on (x, y) at scale s. */
export function Muzzle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={INK} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-3.4 -1.4 h6.8 l-3.4 3.6 z" fill={INK} strokeWidth={1.8} />
      <path d="M0 2.2 v2.6" />
      <path d="M0 4.8 c-1.5 2.8 -4.4 2.6 -5.6 0.6" />
      <path d="M0 4.8 c1.5 2.8 4.4 2.6 5.6 0.6" />
    </g>
  )
}

/** Three whiskers fanning from (x, y) towards `dir` (1 right, -1 left). */
type WhiskerProps = { x: number; y: number; dir?: 1 | -1; len?: number; spread?: number; color?: string }

export function Whiskers({ x, y, dir = 1, len = 16, spread = 4.5, color = INK }: WhiskerProps) {
  const ex = x + dir * len
  return (
    <g fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={0.65}>
      <path d={`M${x} ${y - spread} L${ex} ${y - spread * 2}`} />
      <path d={`M${x} ${y} L${ex + dir * 1.5} ${y + 0.5}`} />
      <path d={`M${x} ${y + spread} L${ex} ${y + spread * 2}`} />
    </g>
  )
}

export function Cheek({ cx, cy, r = 5.5 }: { cx: number; cy: number; r?: number }) {
  return <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.78} fill={PINK} opacity={0.9} />
}

type EarProps = { x: number; y: number; s?: number; flip?: boolean; rotate?: number; fur: Fur; patch?: string }

/**
 * A rounded, outward-leaning ear with a pink inner. Placed with its base centre at (x, y).
 * `flip` mirrors it for the right side of the head.
 */
export function Ear({ x, y, s = 1, flip, rotate = 0, fur, patch }: EarProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-12 8 L-5 -15 L14 3 Z" fill={patch ?? fur.base} stroke={patch ?? fur.base} strokeWidth={6} strokeLinejoin="round" />
      <path d="M-6 4 L-3 -6 L6 2 Z" fill={PINK} stroke={PINK} strokeWidth={3} strokeLinejoin="round" />
    </g>
  )
}

/** A hand-drawn "z" glyph, 8 units wide at scale 1, anchored at its top-left. Uses the text colour by default. */
export function Zed({ s = 1, color = 'currentColor' }: { s?: number; color?: string }) {
  return <path d="M0 0 H8 L0 8 H8" transform={`scale(${s})`} fill="none" stroke={color} strokeWidth={2.2 / s} strokeLinecap="round" strokeLinejoin="round" />
}

type ZsProps = { x: number; y: number; count?: number; still?: boolean; color?: string; drift?: number }

/** Little z's that rise from (x, y), grow and fade out, one after another. */
export function FloatingZs({ x, y, count = 3, still, color = 'currentColor', drift = 26 }: ZsProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: count }, (_, i) => (
        <motion.g
          key={i}
          style={selfPivot()}
          initial={{ opacity: still ? 0.8 - i * 0.25 : 0, x: still ? i * 9 : 0, y: still ? -i * 11 : 6, scale: still ? 0.8 + i * 0.25 : 0.6 }}
          animate={still ? undefined : { opacity: [0, 1, 1, 0], x: [0, 4, 9, 14], y: [6, -drift * 0.3, -drift * 0.7, -drift], scale: [0.6, 0.9, 1.15, 1.3] }}
          transition={{ duration: 3.2, ease: 'easeOut', repeat: Infinity, delay: i * 1.05, times: [0, 0.25, 0.7, 1] }}>
          <Zed s={1 + i * 0.15} color={color} />
        </motion.g>
      ))}
    </g>
  )
}
