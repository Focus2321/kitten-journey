import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'

import { KittenFace } from '../../cats'
import { easeOut } from '../../components/Reveal'

// Pip's weekly weights, birth to week 6.
const grams = [102, 165, 240, 320, 410, 510, 612]
const W = 320
const H = 120
const pad = { l: 14, r: 18, t: 16, b: 14 }
const pts = grams.map((g, i) => ({
  x: pad.l + (i * (W - pad.l - pad.r)) / (grams.length - 1),
  y: H - pad.b - ((g - 80) / (660 - 80)) * (H - pad.t - pad.b),
}))
const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
const area = `${d} L${pts[pts.length - 1].x.toFixed(1)} ${H} L${pts[0].x.toFixed(1)} ${H} Z`
const draw = 1.8

/** Growth chart in the app's card style: the line draws itself, dots pop, the number counts 102 → 612 g. */
export function GrowthCard({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const count = useMotionValue(grams[0])
  const rounded = useTransform(count, (v) => Math.round(v).toString())

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, grams[grams.length - 1], { duration: draw, ease: easeOut, delay: 0.15 })
    return () => controls.stop()
  }, [inView, count])

  return (
    <div ref={ref} className={`rounded-lg bg-ground p-5 shadow-card md:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <KittenFace color="tabby" className="w-10" />
          <span className="rounded-full bg-surface px-3 py-1 text-[13px] font-bold">Pip</span>
        </div>
        <div className="flex items-baseline gap-1 leading-none">
          <motion.span className="display text-[48px] tabular-nums md:text-[56px]">{rounded}</motion.span>
          <span className="text-[18px] font-bold text-muted">g</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="mid-growth-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFCE3A" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFCE3A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* baseline */}
        <line x1={pad.l} x2={W - pad.r} y1={H - 2} y2={H - 2} stroke="#E7E5DF" strokeWidth="1.5" strokeLinecap="round" />
        <motion.path
          d={area}
          fill="url(#mid-growth-fill)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: draw * 0.7 }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke="#15130F"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: draw, ease: easeOut, delay: 0.15 }}
        />
        {pts.map((p, i) => {
          const last = i === pts.length - 1
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={last ? 7 : 4.5}
              fill={last ? '#FFCE3A' : '#15130F'}
              stroke={last ? '#15130F' : '#FFFFFF'}
              strokeWidth={last ? 2.5 : 2}
              style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: 'view-box' }}
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.15 + (i / (pts.length - 1)) * draw * 0.9 }}
            />
          )
        })}
      </svg>

      <div className="mt-1 flex items-center justify-between text-[12px] font-semibold text-muted">
        <span>Birth · 102 g</span>
        <motion.span className="text-ink" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: draw }}>
          Today · 612 g
        </motion.span>
      </div>
    </div>
  )
}
