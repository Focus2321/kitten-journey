import type { CatProps } from './types'

/** STUB — A cat tail hanging down from a top edge, swishing */
export function TailSwish({ className = 'w-32' }: CatProps & { delay?: number }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="40" fill="#FFCE3A" />
    </svg>
  )
}
