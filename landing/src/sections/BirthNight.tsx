import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, useState } from 'react'

import { KittenFace, SleepyCat } from '../cats'
import { Phone } from '../components/Phone'
import { Reveal, WordReveal } from '../components/Reveal'
import { FloatingHearts, MoonGlow, NightSky } from './parts/mid-NightSky'
import { useDesktop } from './parts/mid-useDesktop'

const steps = ['birthCount', 'birthNamed', 'birthTempId', 'birthDone'] as const
const litter = [
  { name: 'Pip', color: 'tabby' },
  { name: 'Fig', color: 'grey' },
  { name: 'Orange Collar', color: 'ginger', dot: true },
  { name: 'Moth', color: 'calico' },
] as const
const pop = { type: 'spring', stiffness: 360, damping: 18 } as const

export function BirthNight() {
  const desktop = useDesktop()
  return (
    <section id="birth" className="relative overflow-clip bg-night text-ground">
      <NightSky />
      {desktop ? <PinnedSequence /> : <StackedSequence />}
    </section>
  )
}

function Heading({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? '' : 'flex flex-wrap items-end justify-between gap-x-12 gap-y-4'}>
      <h2 className={`display text-[44px] md:text-[72px] ${compact ? '' : 'max-w-[760px]'}`}>
        <WordReveal text="The big night, one kitten at a time." />
      </h2>
      <Reveal delay={0.3} className={compact ? 'mt-4' : 'pb-2'}>
        <p className="lead text-ground/60">Big buttons. No typing.</p>
      </Reveal>
    </div>
  )
}

function NamePill({ name, dot, className = '' }: { name: string; dot?: boolean; className?: string }) {
  return (
    <span className={`flex items-center justify-center gap-1.5 rounded-[14px] bg-ground/10 px-3 py-1 text-center text-[13px] font-bold leading-tight text-ground ${className}`}>
      {name}
      {dot && <span className="size-2 rounded-full bg-[#F2994A]" />}
    </span>
  )
}

/* ---------- desktop: pinned phone, scroll-driven ---------- */

function PinnedSequence() {
  const track = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setStep(Math.min(3, Math.max(0, Math.floor(v * 4)))))
  const done = step === 3

  return (
    <div ref={track} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center">
        <div className="relative mx-auto w-full max-w-[1200px] px-10">
          <Heading />

          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-10">
            {/* big rolling digit */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="relative h-[220px] w-[200px] overflow-hidden">
                {steps.map((s, i) => (
                  <motion.span
                    key={s}
                    className="display absolute inset-0 grid place-items-center text-[200px] leading-none text-sun"
                    initial={false}
                    animate={i === step ? { y: 0, opacity: 1, rotate: 0 } : i < step ? { y: -110, opacity: 0, rotate: -6 } : { y: 110, opacity: 0, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
                    {i + 1}
                  </motion.span>
                ))}
              </div>
              <motion.div
                className="mt-2 h-28"
                initial={false}
                animate={done ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.6, y: 20 }}
                transition={pop}>
                <SleepyCat color="tabby" className="w-28" />
              </motion.div>
            </div>

            {/* pinned phone */}
            <div className="relative">
              <MoonGlow className="left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2" />
              <div className="relative" style={{ width: 'min(280px, calc((100vh - 360px) * 0.46))', aspectRatio: '390 / 844' }}>
                {steps.map((s, i) => (
                  <motion.div
                    key={s}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: i === step ? 1 : 0, y: i === step ? 0 : i < step ? -30 : 30, scale: i === step ? 1 : 0.96 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{ zIndex: i === step ? 2 : 1 }}>
                    <Phone screen={s} alt={`Birth flow, step ${i + 1}`} className="w-full" />
                  </motion.div>
                ))}
              </div>
              <Progress progress={scrollYProgress} />
            </div>

            {/* kitten counter */}
            <div className="relative flex items-center justify-center">
              <FloatingHearts className="inset-x-6 bottom-1/2 top-0" active={done} />
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {litter.map((k, i) => (
                  <motion.div
                    key={k.name}
                    className="flex flex-col items-center gap-2"
                    initial={false}
                    animate={step >= i ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.3, y: 24 }}
                    transition={pop}>
                    <KittenFace color={k.color} className="w-20 lg:w-24" delay={0} />
                    <NamePill name={k.name} dot={'dot' in k} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Progress({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="mt-6 flex gap-1.5">
      {steps.map((s, i) => (
        <Segment key={s} progress={progress} index={i} />
      ))}
    </div>
  )
}

function Segment({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const scaleX = useTransform(progress, [0, index / 4, (index + 1) / 4, 1], [0, 0, 1, 1])
  return (
    <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-ground/15">
      <motion.span className="absolute inset-0 origin-left rounded-full bg-sun" style={{ scaleX }} />
    </span>
  )
}

/* ---------- mobile: snap scroller + counter on view ---------- */

function StackedSequence() {
  return (
    <div className="relative mx-auto w-full max-w-[1200px] px-6 py-24">
      <Heading compact />

      <div className="-mx-6 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {steps.map((s, i) => (
          <div key={s} className="relative shrink-0 snap-center">
            <MoonGlow className="left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2" />
            <Reveal delay={i * 0.08} y={30} amount={0.2} className="relative">
              <Phone screen={s} alt={`Birth flow, step ${i + 1}`} className="w-[220px]" />
            </Reveal>
            <span className="absolute left-1/2 top-full mt-3 flex -translate-x-1/2 gap-1.5">
              {steps.map((t, j) => (
                <span key={t} className={`h-1 rounded-full ${j === i ? 'w-5 bg-sun' : 'w-1.5 bg-ground/20'}`} />
              ))}
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-16 flex flex-col items-center">
        <FloatingHearts className="inset-x-10 bottom-1/2 top-0" />
        <div className="grid grid-cols-4 gap-3">
          {litter.map((k, i) => (
            <motion.div
              key={k.name}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, scale: 0.3, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ ...pop, delay: 0.15 + i * 0.22 }}>
              <KittenFace color={k.color} className="w-16" delay={0} />
              <NamePill name={k.name} dot={'dot' in k} className="max-w-[78px] px-2.5 text-[11px]" />
            </motion.div>
          ))}
        </div>
        <Reveal delay={1.2} scale={0.7} className="mt-8">
          <SleepyCat color="tabby" className="w-24" />
        </Reveal>
      </div>
    </div>
  )
}
