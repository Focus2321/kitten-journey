import type { CatProps } from './types'

/** STUB — Cat head and two paws peeking over a bottom edge; blinks, ears twitch, pupils follow the pointer */
export function PeekingCat({ className = 'w-32' }: CatProps & { delay?: number }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="40" fill="#FFCE3A" />
    </svg>
  )
}
