import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { YarnBall } from '../cats'
import { Phone } from '../components/Phone'
import { Reveal, WordReveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { Firsts } from './parts/mid-Firsts'
import { GrowthCard } from './parts/mid-GrowthCard'

export function Raising() {
  const stage = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'end start'] })
  const yWeigh = useTransform(scrollYProgress, [0, 1], [90, -70])
  const yPip = useTransform(scrollYProgress, [0, 1], [30, -60])
  const yBlob = useTransform(scrollYProgress, [0, 1], [40, -40])
  const yYarn = useTransform(scrollYProgress, [0, 1], [120, -40])
  const rYarn = useTransform(scrollYProgress, [0, 1], [-60, 60])

  return (
    <Section id="raising" tone="surface">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-x-16 md:gap-y-12">
        <div className="md:col-start-2 md:row-start-1 md:self-end">
          <h2 className="display text-[44px] md:text-[80px]">
            <WordReveal text="Every gram. Every first." />
          </h2>
          <Reveal delay={0.25} className="mt-5 max-w-[420px]">
            <p className="lead">Weigh the whole litter in under a minute.</p>
          </Reveal>
        </div>

        {/* phones over a paw blob */}
        <div ref={stage} className="relative h-[500px] md:col-start-1 md:row-span-2 md:row-start-1 md:h-[820px]">
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 size-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-paw-soft md:size-[600px]"
            style={{ y: yBlob }}
          />
          <motion.div className="absolute left-0 top-10 z-10 md:left-0 md:top-24" style={{ y: yWeigh }}>
            <Reveal y={50} amount={0.2}>
              <motion.div className="origin-bottom-right" initial={{ rotate: 0 }} whileInView={{ rotate: -5 }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
                <Phone screen="weighIn" alt="Morning weigh-in" className="w-[186px] md:w-[280px]" />
              </motion.div>
            </Reveal>
          </motion.div>
          <motion.div className="absolute right-0 top-0 md:right-2 md:top-0" style={{ y: yPip }}>
            <Reveal y={70} delay={0.15} amount={0.2}>
              <Phone screen="pipProfile" alt="Pip’s profile, week 6" className="w-[186px] md:w-[280px]" scroll />
            </Reveal>
          </motion.div>
          <motion.div className="absolute bottom-0 left-[6%] z-10 md:bottom-8 md:left-[36%]" style={{ y: yYarn, rotate: rYarn }}>
            <Reveal scale={0.6} delay={0.3}>
              <YarnBall color="ginger" className="w-16 md:w-24" />
            </Reveal>
          </motion.div>
        </div>

        <div className="md:col-start-2 md:row-start-2 md:self-start">
          <Reveal delay={0.1} scale={0.96} amount={0.4}>
            <GrowthCard className="max-w-[440px]" />
          </Reveal>
          <Firsts className="mt-7 max-w-[480px] md:mt-8" />
        </div>
      </div>
    </Section>
  )
}
