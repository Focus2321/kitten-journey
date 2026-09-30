import type { CatProps } from './types'

/** STUB — Side-view cat that walks across the full width of its container on loop */
export function WalkingCat({ className = 'w-32' }: CatProps & { delay?: number }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="40" fill="#FFCE3A" />
    </svg>
  )
}
