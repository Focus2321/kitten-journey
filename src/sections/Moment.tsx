import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'

import { Reveal, WordReveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { photos } from '../screens'

type PainChip = { label: string; className: string; rotate: number; jitter: number; strikeAt: number; fallX: number }

// Each chip has its own resting tilt, jitter speed, strike-through moment and fall direction.
const chips: PainChip[] = [
  { label: 'Notes everywhere', className: 'left-[-6%] top-[8%] md:left-[-14%] md:top-[10%]', rotate: -7, jitter: 3.1, strikeAt: 0.22, fallX: -60 },
  { label: '3am “is this normal?”', className: 'right-[-6%] top-[40%] md:right-[-12%] md:top-[36%]', rotate: 5, jitter: 2.6, strikeAt: 0.3, fallX: 70 },
  { label: 'Spreadsheet software', className: 'left-[4%] top-[74%] md:left-[-8%] md:top-[70%]', rotate: -4, jitter: 3.6, strikeAt: 0.38, fallX: -40 },
]

function Chip({ chip, progress, index }: { chip: PainChip; progress: MotionValue<number>; index: number }) {
  const reduce = useReducedMotion()
  const { strikeAt, fallX } = chip
  const strike = useTransform(progress, [strikeAt, strikeAt + 0.08], [0, 1])
  const fallStart = 0.5 + index * 0.04
  const y = useTransform(progress, [fallStart, fallStart + 0.2], [0, 260])
  const x = useTransform(progress, [fallStart, fallStart + 0.2], [0, fallX])
  const rotate = useTransform(progress, [fallStart, fallStart + 0.2], [0, fallX > 0 ? 28 : -32])
  const opacity = useTransform(progress, [fallStart + 0.04, fallStart + 0.18], [1, 0])
  const color = useTransform(progress, [strikeAt, strikeAt + 0.08], ['#15130F', '#9C978D'])

  return (
    <motion.div style={{ y, x, rotate, opacity }} className={`absolute z-20 ${chip.className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: chip.rotate - 10 }}
        whileInView={{ opacity: 1, scale: 1, rotate: chip.rotate }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.3 + index * 0.15 }}>
        <motion.div
          animate={reduce ? undefined : { y: [0, -6, 2, -4, 0], x: [0, 3, -2, 2, 0], rotate: [0, 2.5, -2, 1.5, 0] }}
          transition={{ duration: chip.jitter, repeat: Infinity, ease: 'easeInOut' }}
          className="relative rounded-full border border-line bg-ground px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em] shadow-card md:px-5 md:py-3 md:text-[16px]">
          <motion.span style={{ color }}>{chip.label}</motion.span>
          <motion.span style={{ scaleX: strike }} className="absolute left-4 right-4 top-1/2 h-[2px] origin-left -translate-y-1/2 rounded-full bg-ink md:left-5 md:right-5" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export function Moment() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: pinned } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const { scrollYProgress: passing } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // Keep the storytelling JS-driven: partial input ranges don't survive motion's native scroll-timeline path.
  const scrollYProgress = useTransform(pinned, (v) => v)

  const photoScale = useTransform(passing, [0, 1], [1.18, 1])
  const calmOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1])
  const calmY = useTransform(scrollYProgress, [0.62, 0.84], [70, 0])
  const calmScale = useTransform(scrollYProgress, [0.62, 0.84], [0.7, 1])
  const calmRotate = useTransform(scrollYProgress, [0.62, 0.84], [-10, -3])

  return (
    <Section id="moment" tone="surface" className="[&>div]:py-0">
      <div ref={ref} className="relative h-[190vh] md:h-[200vh]">
        <div className="sticky top-0 flex min-h-screen flex-col justify-center gap-12 py-20 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,520px)] md:items-center md:gap-16 md:py-24">
          <div>
            <h2 className="display text-[44px] md:text-[80px]">
              <WordReveal text="Your cat is having kittens. Now what?" />
            </h2>
            <Reveal delay={0.3} y={18}>
              <p className="lead mt-6 max-w-[420px] md:mt-8">Most people meet a litter once in their life. Nobody hands you a guide.</p>
            </Reveal>
          </div>

          <div className="relative mx-auto w-full max-w-[400px] md:mx-0 md:max-w-none">
            <Reveal y={40} scale={0.96} amount={0.2}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-line shadow-card">
                <motion.img
                  src={photos.juniper}
                  alt="Juniper, a tabby cat, looking up expectantly"
                  loading="lazy"
                  style={{ scale: photoScale }}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-ground px-3.5 py-2 text-[13px] font-semibold md:bottom-5 md:left-5 md:px-4 md:text-[14px]">
                  <span className="h-2 w-2 rounded-full bg-paw" />
                  Juniper · day 58
                </span>
              </div>
            </Reveal>

            {chips.map((chip, i) => (
              <Chip key={chip.label} chip={chip} progress={scrollYProgress} index={i} />
            ))}

            {/* The calm answer settles in once the noise has fallen away */}
            <motion.div
              style={{ opacity: calmOpacity, y: calmY, scale: calmScale, rotate: calmRotate }}
              className="absolute left-[-4%] top-[42%] z-30 md:left-[-16%] md:top-[44%]">
              <span className="inline-flex items-center gap-2.5 rounded-full bg-sun px-5 py-3 text-[16px] font-bold tracking-[-0.01em] text-ink shadow-card md:px-6 md:py-3.5 md:text-[19px]">
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
                One calm place
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  )
}
