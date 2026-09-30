import { useSyncExternalStore } from 'react'

/** True while the media query matches. SSR-safe, updates live. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => matchMedia(query).matches,
    () => false,
  )
}

/** Tailwind's `md` breakpoint. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
