import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'

import { Heart } from '../../cats'
import { LinkIcon } from './end-doodles'

type Props = {
  /** Path in a 0–100 × 0–100 box; coordinates map to percentages of the container. */
  d: string
  className?: string
}

/**
 * A dotted arc that draws itself, then a share-link pill travels along it on loop.
 * When the pill lands, a heart pops at the end of the path.
 */
export function LinkArc({ d, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const maskId = useId()
  const inView = useInView(ref, { amount: 0.4 })
  const reduced = useReducedMotion()
  const progress = useMotionValue(0)
  const [landed, setLanded] = useState(false)
  const [end, setEnd] = useState({ x: 100, y: 100 })

  const point = (p: number) => {
    const el = pathRef.current
    if (!el) return { x: 0, y: 0 }
    return el.getPointAtLength(p * el.getTotalLength())
  }
  const left = useTransform(progress, (p) => `${point(p).x}%`)
  const top = useTransform(progress, (p) => `${point(p).y}%`)
  const opacity = useTransform(progress, [0, 0.05, 0.93, 1], [0, 1, 1, 0])
  const scale = useTransform(progress, [0, 0.5, 1], [0.85, 1.08, 0.9])

  useEffect(() => {
    setEnd(point(1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d])

  useEffect(() => {
    if (reduced) {
      progress.set(1)
      setLanded(true)
      return
    }
    if (!inView) return
    const controls = animate(progress, [0, 1], { duration: 3.2, ease: [0.5, 0, 0.25, 1], repeat: Infinity, repeatDelay: 1.8 })
    return () => controls.stop()
  }, [inView, reduced, progress])

  useMotionValueEvent(progress, 'change', (v) => {
    if (v >= 0.985) setLanded(true)
    else if (v < 0.1) setLanded(false)
  })

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
            <motion.path
              d={d}
              fill="none"
              stroke="#fff"
              strokeWidth="26"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </mask>
        </defs>
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="#15130F"
          strokeOpacity="0.55"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="0 11"
          vectorEffect="non-scaling-stroke"
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* the travelling link */}
      <motion.div
        className="absolute flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink py-2 pl-3 pr-3.5 text-[12px] font-semibold tracking-[-0.01em] text-ground shadow-card md:text-[13px]"
        style={{ left, top, opacity, scale, x: '-50%', y: '-50%' }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sun text-ink">
          <LinkIcon className="w-3" />
        </span>
        kittenjourney.app/pip
      </motion.div>

      {/* landing heart */}
      <div className="absolute" style={{ left: `${end.x}%`, top: `${end.y}%` }}>
        <AnimatePresence>
          {landed && (
            <motion.div
              key="heart"
              className="absolute -left-6 -top-7"
              initial={{ scale: 0, y: 6, rotate: -12 }}
              animate={{ scale: 1, y: -10, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 14 }}>
              <Heart className="w-12" />
              <motion.span
                className="absolute inset-0 -m-2 rounded-full border-2 border-paw"
                initial={{ scale: 0.4, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
