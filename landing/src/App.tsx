import Lenis from 'lenis'
import { MotionConfig } from 'motion/react'
import { useEffect } from 'react'

import { BirthNight } from './sections/BirthNight'
import { Expecting } from './sections/Expecting'
import { Feedback } from './sections/Feedback'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { HowItFeels } from './sections/HowItFeels'
import { Idea } from './sections/Idea'
import { Moment } from './sections/Moment'
import { Nav } from './sections/Nav'
import { NewHomes } from './sections/NewHomes'
import { Raising } from './sections/Raising'

export default function App() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: true, anchors: true })
    return () => lenis.destroy()
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero />
        <Moment />
        <Idea />
        <Expecting />
        <BirthNight />
        <Raising />
        <NewHomes />
        <HowItFeels />
        <Feedback />
      </main>
      <Footer />
    </MotionConfig>
  )
}
