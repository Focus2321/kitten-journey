import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { easeOut } from '../../components/Reveal'

const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const target = 6 // index of week 7
const frac = target / (weeks.length - 1)

/** Slim pregnancy timeline. On view, the sun dot travels from week 1 and settles on week 7. */
export function WeekTimeline({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const travel = { duration: 1.6, ease: easeOut, delay: 0.2 }
  const dotX = width * frac

  return (
    <div className={`relative ${className}`}>
      {/* track */}
      <div ref={ref} className="relative h-4">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-line" />
        <motion.div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 origin-left rounded-full bg-sun"
          style={{ width: `${frac * 100}%` }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={travel}
        />
        {weeks.map((w, i) => (
          <span
            key={w}
            className="absolute top-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-line"
            style={{ left: `${(i / (weeks.length - 1)) * 100}%` }}
          />
        ))}
        {/* sun dot, driven in px so only transform animates */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2"
          initial={{ x: -10 }}
          animate={inView ? { x: dotX - 10 } : { x: -10 }}
          transition={travel}>
          <motion.span
            className="block size-5 rounded-full bg-sun ring-4 ring-ground shadow-[0_6px_16px_-4px_rgb(255_206_58/0.9)]"
            animate={inView ? { scale: [1, 1.25, 1] } : {}}
            transition={{ delay: 1.8, duration: 0.5 }}
          />
          <motion.span
            className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[12px] font-bold text-ground"
            initial={{ opacity: 0, y: 8, scale: 0.7 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 1.7 }}>
            Week 7
          </motion.span>
        </motion.div>
      </div>
      {/* labels */}
      <div className="relative mt-2 h-4">
        {weeks.map((w, i) => (
          <motion.span
            key={w}
            className="absolute -translate-x-1/2 text-[12px] font-semibold tabular-nums"
            style={{ left: `${(i / (weeks.length - 1)) * 100}%` }}
            initial={{ color: '#6E6A62' }}
            animate={inView && i === target ? { color: '#15130F' } : {}}
            transition={{ delay: 1.7 }}>
            {w}
          </motion.span>
        ))}
      </div>
    </div>
  )
}
