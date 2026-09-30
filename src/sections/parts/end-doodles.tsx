import { motion, useReducedMotion } from 'motion/react'

const ink = '#15130F'
const sun = '#FFCE3A'
const paw = '#FFA7B4'

/** Sun-yellow rounded square with the ink cat head, same as favicon.svg. */
export function LogoMark({ className = 'w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="18" fill={sun} />
      <path d="M17 45V22l9 7h12l9-7v23c0 5-6 9-15 9s-15-4-15-9Z" fill={ink} />
      <circle cx="26" cy="38" r="2.6" fill={sun} />
      <circle cx="38" cy="38" r="2.6" fill={sun} />
    </svg>
  )
}

/** Little house for the kitten to walk home to. The window glows softly. */
export function House({ className = 'w-24' }: { className?: string }) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden>
      <path d="M22 104V54L60 20l38 34v50Z" fill="#fff" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <path d="M10 58 60 14l50 44" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M78 40V22h10v27" fill="#fff" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <motion.rect
        x="46"
        y="52"
        width="28"
        height="22"
        rx="6"
        fill={sun}
        stroke={ink}
        strokeWidth="4"
        animate={reduced ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <path d="M60 52v22M46 63h28" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 104V86a10 10 0 0 1 20 0v18" fill={paw} stroke={ink} strokeWidth="4" />
      <path d="M6 104h108" stroke={ink} strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

/** Chain-link glyph for the share pill. */
export function LinkIcon({ className = 'w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  )
}

/* ---- Principle icons (How it feels). Each has a tiny idle loop. ---- */

type IconProps = { className?: string }

/** Two chips; a fingertip taps the second one and it fills in. */
export function TapIcon({ className = 'w-10' }: IconProps) {
  const reduced = useReducedMotion()
  const loop = { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const }
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="6" y="9" width="36" height="12" rx="6" fill={ink} />
      <path d="M13 15h10" stroke={sun} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="6" y="26" width="36" height="12" rx="6" fill="#fff" stroke={ink} strokeWidth="2.5" />
      <motion.rect
        x="6"
        y="26"
        width="36"
        height="12"
        rx="6"
        fill={ink}
        animate={reduced ? undefined : { opacity: [0, 0, 1, 1, 0] }}
        transition={{ ...loop, times: [0, 0.42, 0.5, 0.85, 1] }}
      />
      <motion.circle
        cx="24"
        cy="32"
        r="4"
        fill={sun}
        stroke={ink}
        strokeWidth="2"
        animate={reduced ? undefined : { y: [-12, 0, 0, -12], scale: [1, 0.85, 1, 1], opacity: [0, 1, 1, 0] }}
        transition={{ ...loop, times: [0, 0.45, 0.6, 1] }}
      />
    </svg>
  )
}

/** A heart that beats slowly. */
export function WarmIcon({ className = 'w-10' }: IconProps) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <motion.path
        d="M24 41S6 30 6 17a9 9 0 0 1 18-2 9 9 0 0 1 18 2c0 13-18 24-18 24z"
        fill={paw}
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
        style={{ originX: '50%', originY: '55%' }}
        animate={reduced ? undefined : { scale: [1, 1.1, 1, 1.06, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
      />
      <circle cx="17" cy="17" r="2.2" fill="#fff" />
    </svg>
  )
}

/** A toggle that idly flips off and on: everything can be skipped. */
export function OptionalIcon({ className = 'w-10' }: IconProps) {
  const reduced = useReducedMotion()
  const loop = { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const, times: [0, 0.4, 0.5, 0.9, 1] }
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="4" y="14" width="40" height="20" rx="10" fill="#fff" stroke={ink} strokeWidth="2.5" />
      <motion.rect
        x="4"
        y="14"
        width="40"
        height="20"
        rx="10"
        fill={sun}
        animate={reduced ? undefined : { opacity: [1, 1, 0, 0, 1] }}
        transition={loop}
      />
      <motion.circle
        cx="34"
        cy="24"
        r="7"
        fill={ink}
        animate={reduced ? undefined : { x: [0, 0, -20, -20, 0] }}
        transition={loop}
      />
    </svg>
  )
}

/** Crescent moon and a twinkling star: quiet unless it needs to speak up. */
export function QuietIcon({ className = 'w-10' }: IconProps) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <motion.path
        d="M29 8a16 16 0 1 0 11 27A13 13 0 0 1 29 8z"
        fill={sun}
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
        style={{ originX: '50%', originY: '50%' }}
        animate={reduced ? undefined : { rotate: [-6, 6, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M13 10l1.6 4.4L19 16l-4.4 1.6L13 22l-1.6-4.4L7 16l4.4-1.6z"
        fill={ink}
        style={{ originX: '13px', originY: '16px' }}
        animate={reduced ? undefined : { scale: [0.6, 1.15, 0.6], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="12"
        cy="34"
        r="2"
        fill={paw}
        animate={reduced ? undefined : { scale: [0.6, 1.2, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </svg>
  )
}
