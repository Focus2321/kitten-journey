import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { Phone } from '../components/Phone'
import { Reveal, WordReveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { Sticker } from '../components/Sticker'
import { CheckInCard } from './parts/mid-CheckInCard'
import { WeekTimeline } from './parts/mid-WeekTimeline'

const bellies = [
  { photo: 'juniperWk5', caption: 'Week 5', rotate: -10, delay: 0.1 },
  { photo: 'juniperWk6', caption: 'Week 6', rotate: 2, delay: 0.3 },
  { photo: 'juniperWk7', caption: 'Week 7', rotate: 11, delay: 0.5 },
] as const

export function Expecting() {
  const stage = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'end start'] })
  const yHome = useTransform(scrollYProgress, [0, 1], [50, -50])
  const yCheck = useTransform(scrollYProgress, [0, 1], [110, -90])
  const yCard = useTransform(scrollYProgress, [0, 1], [70, -110])
  const yBlob = useTransform(scrollYProgress, [0, 1], [-40, 40])

  return (
    <Section id="expecting" tone="ground">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-x-16 md:gap-y-14">
        <div className="md:col-start-1 md:row-start-1 md:self-end">
          <h2 className="display text-[44px] md:text-[80px]">
            <WordReveal text="Two taps and you’re done." />
          </h2>
          <Reveal delay={0.25} className="mt-5 max-w-[420px]">
            <p className="lead">A daily check-in becomes a gentle picture of the weeks ahead.</p>
          </Reveal>
        </div>

        {/* phones over a sun blob */}
        <div ref={stage} className="relative h-[600px] md:col-start-2 md:row-span-2 md:row-start-1 md:h-[760px]">
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sun-soft md:size-[620px]"
            style={{ y: yBlob }}
          />
          <motion.div className="absolute left-0 top-2 md:left-2 md:top-6" style={{ y: yHome }}>
            <Reveal y={40} amount={0.2}>
              <Phone screen="homeExpecting" alt="Home, expecting, week 7" className="w-[215px] md:w-[300px]" scroll />
            </Reveal>
          </motion.div>
          <motion.div className="absolute right-0 top-[130px] md:right-0 md:top-[150px]" style={{ y: yCheck }}>
            <Reveal y={60} delay={0.15} amount={0.2}>
              <motion.div className="origin-bottom-left" initial={{ rotate: 0 }} whileInView={{ rotate: 4 }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
                <Phone screen="checkIn" alt="Check-in sheet: Juniper’s day" className="w-[185px] md:w-[260px]" />
              </motion.div>
            </Reveal>
          </motion.div>
          <motion.div className="absolute -left-2 bottom-2 z-10 md:-left-6 md:bottom-10" style={{ y: yCard }}>
            <Reveal delay={0.4} y={30} scale={0.9} amount={0.6}>
              <CheckInCard className="w-[270px] md:w-[320px]" />
            </Reveal>
          </motion.div>
        </div>

        <div className="md:col-start-1 md:row-start-2 md:self-start">
          <Reveal delay={0.1} className="pt-6 md:pt-2">
            <WeekTimeline className="max-w-[440px]" />
          </Reveal>
          <div className="mt-14 flex items-end gap-2 md:mt-16 md:gap-3">
            {bellies.map((b, i) => (
              <div key={b.photo} className={i === 1 ? '-translate-y-4' : ''}>
                <Sticker photo={b.photo} caption={b.caption} rotate={b.rotate} delay={b.delay} className="w-[104px] md:w-[136px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
