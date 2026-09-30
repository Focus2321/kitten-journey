import type { CatProps } from './types'

/** STUB — Ball of yarn that wobbles/rolls with a trailing thread */
export function YarnBall({ className = 'w-32' }: CatProps & { delay?: number }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="40" fill="#FFCE3A" />
    </svg>
  )
}
