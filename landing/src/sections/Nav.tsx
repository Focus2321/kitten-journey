import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'

import { easeOut } from '../components/Reveal'

/** Logo mark from public/favicon.svg, inlined so it scales crisply. */
function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="18" fill="#FFCE3A" />
      <path d="M17 45V22l9 7h12l9-7v23c0 5-6 9-15 9s-15-4-15-9Z" fill="#15130F" />
      <circle cx="26" cy="38" r="2.6" fill="#FFCE3A" />
      <circle cx="38" cy="38" r="2.6" fill="#FFCE3A" />
    </svg>
  )
}

/** Slim fixed bar: transparent at the top, frosted once scrolled, hides on scroll down and returns on scroll up. */
export function Nav() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    if (y < 80) setHidden(false)
    else if (y - prev > 2) setHidden(true)
    else if (prev - y > 2) setHidden(false)
  })

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={false}
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.4, ease: easeOut }}>
      <div
        className={`transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled ? 'bg-white/75 shadow-[inset_0_-1px_0_0_var(--color-line)] backdrop-blur-xl' : 'bg-transparent'
        }`}>
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 md:px-10">
          <a href="#top" className="flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.02em] text-ink">
            <LogoMark />
            Kitten Journey
          </a>
          <a
            href="#feedback"
            className="rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-ground transition-transform duration-300 ease-[var(--ease-out-soft)] hover:scale-[1.04] active:scale-[0.98] md:px-5 md:text-[15px]">
            Would you use it?
          </a>
        </div>
      </div>
    </motion.header>
  )
}
