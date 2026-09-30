import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const chips = ['Hungry', 'Normal', 'Picky'] as const
const order = [0, 1, 2, 1]
const spring = { type: 'spring', stiffness: 420, damping: 32 } as const

/** The app's appetite chips, tapping themselves on a loop: pill slides, a ripple lands, "Saved" ticks. */
export function CheckInCard({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.6 })
  const reduce = useReducedMotion()
  // With reduced motion the card shows a finished check-in and never loops.
  const [active, setActive] = useState<number | null>(reduce ? 0 : null)
  const [saved, setSaved] = useState(!!reduce)
  const [tap, setTap] = useState(0)

  useEffect(() => {
    if (reduce || !inView) return
    let alive = true
    let i = 0
    let t: ReturnType<typeof setTimeout>
    const run = () => {
      if (!alive) return
      setActive(order[i % order.length])
      setTap((n) => n + 1)
      setSaved(false)
      t = setTimeout(() => {
        if (!alive) return
        setSaved(true)
        t = setTimeout(() => {
          i++
          run()
        }, 1500)
      }, 800)
    }
    t = setTimeout(run, 700)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [inView, reduce])

  return (
    <div ref={ref} className={`rounded-lg bg-ground p-4 shadow-card md:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold tracking-title md:text-[17px]">How&rsquo;s her appetite?</p>
        <AnimatePresence>
          {saved && (
            <motion.span
              key="saved"
              className="flex items-center gap-1.5 rounded-full bg-sun-soft py-1 pl-1.5 pr-2.5 text-[12px] font-bold"
              initial={{ opacity: 0, scale: 0.6, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}>
              <span className="grid size-4 place-items-center rounded-full bg-ink">
                <svg viewBox="0 0 12 12" className="w-2.5" aria-hidden>
                  <path d="M2.5 6.5l2.3 2.2L9.5 3.7" fill="none" stroke="#FFCE3A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Saved
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex gap-1 rounded-full bg-surface p-1">
        {chips.map((label, i) => {
          const on = active === i
          return (
            <span key={label} className="relative flex-1">
              {on && <motion.span layoutId="appetite-pill" className="absolute inset-0 rounded-full bg-ink" transition={spring} />}
              {on && !reduce && (
                <motion.span
                  key={tap}
                  className="pointer-events-none absolute inset-0 rounded-full border-2 border-ink"
                  initial={{ opacity: 0.5, scale: 0.85 }}
                  animate={{ opacity: 0, scale: 1.25 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
              )}
              <motion.span
                className="relative block py-2 text-center text-[13px] font-semibold md:text-[14px]"
                animate={{ color: on ? '#FFFFFF' : '#15130F', scale: on ? 1 : 0.98 }}
                transition={{ duration: 0.25 }}>
                {label}
              </motion.span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
