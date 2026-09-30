import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { PeekingCat, Sparkle } from '../cats'
import { Phone } from '../components/Phone'
import { easeOut, Reveal, WordReveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { Sticker } from '../components/Sticker'

const spring = { type: 'spring', stiffness: 80, damping: 15, mass: 1 } as const

function Arrow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // Parallax while the hero scrolls out — each layer at its own speed.
  const textY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0, 0])
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const frontY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const backY = useTransform(scrollYProgress, [0, 1], [0, -170])
  const stickerAY = useTransform(scrollYProgress, [0, 1], [0, -240])
  const stickerBY = useTransform(scrollYProgress, [0, 1], [0, -130])

  const twinkle = (delay: number) =>
    reduce ? undefined : { scale: [0.6, 1, 0.6], rotate: [0, 25, 0], opacity: [0.5, 1, 0.5], transition: { duration: 2.6, delay, repeat: Infinity, ease: 'easeInOut' as const } }

  return (
    <Section id="top" tone="ground" className="md:flex md:min-h-screen md:items-center">
      <div ref={ref} className="relative pt-6 md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center md:gap-6 md:pt-0">
        {/* Copy */}
        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10">
          <h1 className="display text-[48px] md:text-[80px] lg:text-[96px]">
            <WordReveal text="From the first hint of kittens to the day they go home." />
          </h1>
          <Reveal delay={0.45} y={18}>
            <p className="lead mt-6 max-w-[440px] md:mt-8">A calm companion for first-time cat families.</p>
          </Reveal>
          <Reveal delay={0.6} y={18} className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 md:mt-10">
            <a
              href="#feedback"
              className="inline-flex items-center rounded-full bg-ink px-6 py-3.5 text-[16px] font-semibold text-ground shadow-card transition-transform duration-300 ease-[var(--ease-out-soft)] hover:scale-[1.04] active:scale-[0.98]">
              Tell us what you think
            </a>
            <a href="#idea" className="group inline-flex items-center gap-2 text-[16px] font-semibold text-ink">
              See how it works
              <Arrow className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1" />
            </a>
          </Reveal>
        </motion.div>

        {/* Visual */}
        <div className="relative mx-auto mt-16 h-[540px] w-full max-w-[380px] md:mx-0 md:mt-0 md:h-[600px] md:max-w-none">
          {/* Blobs */}
          <motion.div style={{ y: blobY }} className="absolute inset-0">
            <motion.div
              className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-paw-soft md:h-[560px] md:w-[560px]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: easeOut }}
            />
            <motion.div
              className="absolute left-[8%] top-[6%] h-[150px] w-[150px] rounded-full bg-sun-soft md:left-[2%] md:top-[4%] md:h-[220px] md:w-[220px]"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.15, ease: easeOut }}
            />
          </motion.div>

          {/* Back phone */}
          <motion.div style={{ y: backY }} className="absolute left-[48%] top-[6%] z-10 md:left-[54%] md:top-[0%]">
            <motion.div initial={{ opacity: 0, y: 160, rotate: 18 }} animate={{ opacity: 1, y: 0, rotate: 7 }} transition={{ ...spring, delay: 0.35 }}>
              <Phone screen="homeExpecting" alt="Home screen during Juniper's pregnancy, week 7" className="w-[180px] md:w-[262px]" scroll />
            </motion.div>
          </motion.div>

          {/* Cat peeking over the front phone (sits behind it and rises up) */}
          <motion.div
            className="absolute left-[16%] top-[15%] z-20 w-[104px] -translate-y-[82%] md:left-[21%] md:top-[7%] md:w-[150px]"
            initial={{ y: '40%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 1.5 }}>
            <PeekingCat className="w-full" color="tabby" />
          </motion.div>

          {/* Front phone */}
          <motion.div style={{ y: frontY }} className="absolute left-[10%] top-[16%] z-30 md:left-[16%] md:top-[7%]">
            <motion.div initial={{ opacity: 0, y: 200, rotate: -16 }} animate={{ opacity: 1, y: 0, rotate: -6 }} transition={{ ...spring, delay: 0.2 }}>
              <Phone screen="welcome" alt="Welcome screen: where's her story right now?" className="w-[200px] md:w-[284px]" priority />
            </motion.div>
          </motion.div>

          {/* Stickers */}
          <motion.div style={{ y: stickerAY }} className="absolute left-[-4%] top-[68%] z-40 md:left-[-6%] md:top-[60%]">
            <Sticker photo="juniperWk7" caption="Juniper · week 7" rotate={-7} className="w-[136px] md:w-36" delay={0.95} />
          </motion.div>
          <motion.div style={{ y: stickerBY }} className="absolute right-[-3%] top-[46%] z-40 md:right-[-52px] md:top-[48%]">
            <Sticker photo="pip" caption="Pip · 6 weeks" rotate={6} className="w-[128px] md:w-32" delay={1.1} />
          </motion.div>

          {/* Sparkles */}
          <motion.div className="absolute left-[2%] top-[9%] z-40 md:left-[-2%] md:top-[50%]" animate={twinkle(1.6)}>
            <Sparkle className="w-6 md:w-8" />
          </motion.div>
          <motion.div className="absolute right-[6%] top-[86%] z-40 md:right-[-3%] md:top-[74%]" animate={twinkle(2.3)}>
            <Sparkle className="w-5 md:w-6" color="#FFA7B4" />
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
