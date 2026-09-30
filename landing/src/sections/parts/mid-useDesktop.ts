import { useEffect, useState } from 'react'

const query = '(min-width: 768px)'

/** True at Tailwind's md breakpoint and up. Lets a section render one layout instead of hiding the other. */
export function useDesktop() {
  const [desktop, setDesktop] = useState(() => (typeof matchMedia === 'function' ? matchMedia(query).matches : true))
  useEffect(() => {
    const mq = matchMedia(query)
    const onChange = () => setDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return desktop
}
