import { motion, useInView } from 'motion/react'
import { useRef, type CSSProperties } from 'react'

import { screens, type ScreenKey } from '../screens'

type Props = {
  screen: ScreenKey
  alt: string
  /** Size the phone with width classes, e.g. "w-[260px] md:w-[300px]". Height follows the 390×844 ratio. */
  className?: string
  style?: CSSProperties
  /** Tall screens slowly scroll top → bottom → top while the phone is on screen. */
  scroll?: boolean
  /** Seconds for one scroll pass (default scales with screen length). */
  scrollDuration?: number
  priority?: boolean
}

/** Ink bezel phone with a real app screen inside. Fluid: everything inside scales with the frame width. */
export function Phone({ screen, alt, className = 'w-[280px]', style, scroll = false, scrollDuration, priority }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.3 })
  const { src, h } = screens[screen]
  const overflow = h > 844 ? (1 - 844 / h) * -100 : 0
  const canScroll = scroll && overflow < 0
  const duration = scrollDuration ?? Math.max(6, (h / 844) * 4)

  return (
    <div ref={ref} className={`relative shrink-0 [container-type:inline-size] ${className}`} style={{ aspectRatio: '390 / 844', ...style }}>
      <div className="relative h-full w-full rounded-[15.5cqw] bg-ink p-[2.8cqw] shadow-phone">
      <div className="relative h-full w-full overflow-hidden rounded-[12.8cqw] bg-ground">
        <motion.img
          src={src}
          alt={alt}
          draggable={false}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="block w-full select-none"
          animate={canScroll && inView ? { y: ['0%', '0%', `${overflow}%`, `${overflow}%`, '0%'] } : { y: '0%' }}
          transition={
            canScroll && inView
              ? { duration: duration * 2, times: [0, 0.12, 0.5, 0.62, 1], ease: 'easeInOut', repeat: Infinity }
              : { duration: 0.6 }
          }
        />
      </div>
      {/* glass sheen */}
      <div className="pointer-events-none absolute inset-[2.8cqw] rounded-[12.8cqw] bg-[linear-gradient(115deg,rgb(255_255_255/0.14)_0%,transparent_38%)]" />
      </div>
    </div>
  )
}
