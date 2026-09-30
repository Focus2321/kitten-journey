import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { WalkingCat } from '../cats'
import { Phone } from '../components/Phone'
import { Reveal, WordReveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { Sticker } from '../components/Sticker'
import { House } from './parts/end-doodles'
import { LinkArc } from './parts/end-LinkArc'
import { useIsMobile } from './parts/end-utils'

// Arc paths in a 0–100 box that maps to the stage. They start at the share phone and end on the shared view.
const ARC_DESKTOP = 'M 31 34 C 40 4, 68 -2, 79 18'
const ARC_MOBILE = 'M 55 16 C 74 10, 86 34, 71 55'

export function NewHomes() {
  const stage = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'end start'] })
  const blobY = useTransform(scrollYProgress, [0, 1], [80, -80])
  const stickerY = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <Section id="new-homes" tone="paw" className="pb-10 md:pb-16">
      <div className="text-center">
        <h2 className="display text-[44px] md:text-[80px]">
          <WordReveal text="Their story goes with them." />
        </h2>
        <Reveal delay={0.25} y={16}>
          <p className="lead mt-5 md:mt-7">One link. No app to install.</p>
        </Reveal>
      </div>

      <div ref={stage} className="relative mt-12 h-[940px] md:mt-20 md:h-[680px]">
        {/* soft blobs */}
        <motion.div style={{ y: blobY }} className="absolute left-[-6%] top-[8%] h-[360px] w-[360px] rounded-full bg-ground/60 blur-3xl md:left-[2%] md:h-[520px] md:w-[520px]" />
        <motion.div style={{ y: stickerY }} className="absolute bottom-[4%] right-[-8%] h-[320px] w-[320px] rounded-full bg-sun-soft/80 blur-3xl md:right-[4%] md:h-[460px] md:w-[460px]" />

        {/* share phone */}
        <Reveal x={-40} className="absolute left-0 top-0 md:left-[7%] md:top-[2%]">
          <motion.div initial={{ rotate: -8 }} whileInView={{ rotate: -4 }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
            <Phone screen="share" alt="Send Pip off with his story" scroll className="w-[200px] md:w-[290px]" />
          </motion.div>
        </Reveal>

        {/* shared view phone */}
        <Reveal x={40} delay={0.15} className="absolute bottom-0 right-0 md:bottom-auto md:right-[7%] md:top-[8%]">
          <motion.div initial={{ rotate: 8 }} whileInView={{ rotate: 4 }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
            <Phone screen="sharedView" alt="Pip's story as Sam and Rosa see it" scroll className="w-[200px] md:w-[290px]" />
          </motion.div>
        </Reveal>

        <LinkArc d={isMobile ? ARC_MOBILE : ARC_DESKTOP} />

        <motion.div style={{ y: stickerY }} className="absolute left-1/2 top-[62%] hidden -translate-x-1/2 md:block">
          <Sticker photo="pip" caption="Pip · going home" rotate={5} className="w-36" delay={0.4} />
        </motion.div>
      </div>

      {/* the kitten walks home along the bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 md:h-24">
        <div className="relative mx-auto h-full w-full max-w-[1200px] px-6 md:px-10">
          <div className="absolute bottom-2 left-6 right-28 md:left-10 md:right-44">
            <WalkingCat className="h-12 w-full md:h-16" color="tabby" />
          </div>
          <Reveal x={20} className="absolute bottom-2 right-6 md:right-10">
            <House className="w-20 md:w-28" />
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
