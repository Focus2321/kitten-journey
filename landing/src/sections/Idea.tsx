import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'

import { WordReveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { ChapterCard, type Chapter } from './parts/top-ChapterCard'

const chapters: Chapter[] = [
  { n: 1, title: 'Expecting', line: 'A two-tap check-in', href: '#expecting', photo: 'juniperResting', alt: 'Juniper resting on a warm manhole cover' },
  { n: 2, title: 'Birth', line: 'One kitten at a time', href: '#birth', photo: 'nap', alt: 'A black and white cat asleep on its back' },
  { n: 3, title: 'Newborns', line: 'Every gram counted', href: '#raising', photo: 'pip', alt: 'Pip as a tiny kitten hugging a blue toy' },
  { n: 4, title: 'Growing', line: 'Firsts, gathered', href: '#raising', photo: 'biscuit', alt: 'Biscuit, a cream kitten, waving a paw' },
  { n: 5, title: 'New homes', line: 'Their story, shared', href: '#new-homes', photo: 'cuddle', alt: 'A ginger mum cuddling her kitten', accent: true },
]

// Card centres on the 1120-wide desktop grid: five columns with 16px gaps.
const W = 1120
const cardCentres = [0, 1, 2, 3, 4].map((i) => 111.2 + i * 227.2)
const journeyPath = [
  `M0 44 C ${cardCentres[0] - 50} 44, ${cardCentres[0] - 50} 16, ${cardCentres[0]} 16`,
  `S ${cardCentres[1]} 44, ${cardCentres[1]} 44`,
  `S ${cardCentres[2]} 16, ${cardCentres[2]} 16`,
  `S ${cardCentres[3]} 44, ${cardCentres[3]} 44`,
  `S ${cardCentres[4]} 16, ${cardCentres[4]} 16`,
  `S ${W} 44, ${W} 44`,
].join(' ')

export function Idea() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.6'] })
  // JS-driven copy so the per-dot partial ranges below clamp correctly.
  const scrollYProgress = useTransform(raw, (v) => v)
  const pathLength = scrollYProgress

  return (
    <Section id="idea" tone="ground">
      <h2 className="display max-w-[900px] text-[44px] md:text-[80px]">
        <WordReveal text="One calm companion. Five chapters." />
      </h2>

      <div ref={ref} className="mt-14 md:mt-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
          className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 pt-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0 md:pt-0">
          {chapters.map((c, i) => (
            <ChapterCard key={c.n} chapter={c} index={i} />
          ))}
        </motion.div>

        {/* Journey line that draws itself under the cards as they scroll in; a paw of sun at each chapter. */}
        <div className="relative mt-8 hidden h-[60px] md:block" aria-hidden>
          <svg viewBox={`0 0 ${W} 60`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <motion.path d={journeyPath} fill="none" stroke="#FFCE3A" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 10" style={{ pathLength }} />
          </svg>
          {cardCentres.map((cx, i) => (
            <JourneyDot key={i} progress={scrollYProgress} at={(i + 0.5) / 5} x={cx} y={i % 2 ? 44 : 16} accent={i === 4} />
          ))}
        </div>
      </div>
    </Section>
  )
}

function JourneyDot({ progress, at, x, y, accent }: { progress: MotionValue<number>; at: number; x: number; y: number; accent: boolean }) {
  const scale = useTransform(progress, [at - 0.06, at], [0, 1])
  return (
    <motion.span
      style={{ scale, left: `${(x / W) * 100}%`, top: y }}
      className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${accent ? 'bg-ink' : 'bg-sun'}`}
    />
  )
}
