import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'

import { SleepyCat } from '../cats'
import { Phone } from '../components/Phone'
import { Reveal, Stagger, StaggerItem, WordReveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { OptionalIcon, QuietIcon, TapIcon, WarmIcon } from './parts/end-doodles'

const principles: { title: string; icon: ReactNode; tint: string }[] = [
  { title: 'Two taps, not twenty forms', icon: <TapIcon className="w-9" />, tint: 'bg-sun-soft' },
  { title: 'Warm, not clinical', icon: <WarmIcon className="w-9" />, tint: 'bg-paw-soft' },
  { title: 'Everything is optional', icon: <OptionalIcon className="w-9" />, tint: 'bg-surface' },
  { title: 'Knows when to step back', icon: <QuietIcon className="w-9" />, tint: 'bg-sun-soft' },
]

export function HowItFeels() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const journalY = useTransform(scrollYProgress, [0, 1], [70, -70])
  const pipY = useTransform(scrollYProgress, [0, 1], [140, -110])
  const blobY = useTransform(scrollYProgress, [0, 1], [-40, 60])

  return (
    <Section id="how-it-feels" tone="surface">
      <div ref={ref} className="grid gap-16 md:grid-cols-12 md:items-center md:gap-10">
        <div className="md:col-span-6">
          <h2 className="display text-[44px] md:text-[80px]">
            <WordReveal text="Calm by design." />
          </h2>

          <Stagger stagger={0.12} className="relative mt-10 grid grid-cols-2 gap-3 md:mt-14 md:gap-4">
            {principles.map((p) => (
              <StaggerItem key={p.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex h-full flex-col gap-5 rounded-lg bg-ground p-5 shadow-card md:gap-7 md:p-6">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-full ${p.tint}`}>{p.icon}</span>
                  <h3 className="text-[17px] font-bold leading-[1.15] tracking-title text-balance md:text-[21px]">{p.title}</h3>
                </motion.div>
              </StaggerItem>
            ))}
            <Reveal delay={0.6} y={10} className="pointer-events-none absolute -top-11 right-4 z-10 md:-top-14 md:right-6">
              <SleepyCat className="w-24 md:w-32" color="ginger" />
            </Reveal>
          </Stagger>
        </div>

        <div className="relative h-[560px] md:col-span-6 md:h-[720px]">
          <motion.div style={{ y: blobY }} className="absolute left-[10%] top-[6%] h-[300px] w-[300px] rounded-full bg-sun-soft blur-3xl md:h-[480px] md:w-[480px]" />
          <motion.div style={{ y: blobY }} className="absolute bottom-[4%] right-0 h-[240px] w-[240px] rounded-full bg-paw-soft blur-3xl md:h-[380px] md:w-[380px]" />

          <motion.div style={{ y: journalY }} className="absolute left-0 top-0">
            <Reveal y={40}>
              <motion.div initial={{ rotate: -7 }} whileInView={{ rotate: -4 }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
                <Phone screen="journal" alt="Juniper's pregnancy journal" scroll className="w-[200px] md:w-[280px]" />
              </motion.div>
            </Reveal>
          </motion.div>

          <motion.div style={{ y: pipY }} className="absolute right-0 top-[150px] md:top-[140px]">
            <Reveal y={60} delay={0.15}>
              <motion.div initial={{ rotate: 7 }} whileInView={{ rotate: 4 }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
                <Phone screen="pipDay" alt="Pip today check-in" className="w-[170px] md:w-[240px]" />
              </motion.div>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
