import { motion, type HTMLMotionProps, type Variants } from 'motion/react'

export const easeOut = [0.22, 1, 0.36, 1] as const

type RevealProps = HTMLMotionProps<'div'> & { delay?: number; y?: number; x?: number; scale?: number; amount?: number }

/** Fades + lifts its children in the first time they scroll into view. */
export function Reveal({ delay = 0, y = 28, x = 0, scale = 1, amount = 0.3, transition, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: easeOut, delay, ...transition }}
      {...rest}
    />
  )
}

const container: Variants = {
  hidden: {},
  show: (stagger: number = 0.08) => ({ transition: { staggerChildren: stagger } }),
}
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
}

/** Parent for staggered children: <Stagger><StaggerItem/>…</Stagger> */
export function Stagger({ stagger = 0.08, amount = 0.25, ...rest }: HTMLMotionProps<'div'> & { stagger?: number; amount?: number }) {
  return <motion.div variants={container} custom={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount }} {...rest} />
}

export function StaggerItem(props: HTMLMotionProps<'div'>) {
  return <motion.div variants={item} {...props} />
}

/** Headline that rises in word by word. */
export function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <motion.span className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.9, ease: easeOut, delay: delay + i * 0.06 } } }}>
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
