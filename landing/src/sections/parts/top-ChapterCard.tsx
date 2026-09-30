import { motion, type Variants } from 'motion/react'

import { easeOut } from '../../components/Reveal'
import { photos, type PhotoKey } from '../../screens'

export type Chapter = { n: number; title: string; line: string; href: string; photo: PhotoKey; alt: string; accent?: boolean }

const variants: Variants = {
  hidden: (tilt: number) => ({ opacity: 0, y: 56, rotate: tilt }),
  show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.9, ease: easeOut } },
}

/** One chapter of the journey: photo, number badge, title and a short line. Lifts on hover; the last card is sun yellow. */
export function ChapterCard({ chapter, index }: { chapter: Chapter; index: number }) {
  const { n, title, line, href, photo, alt, accent } = chapter
  return (
    <motion.a
      href={href}
      custom={index % 2 ? 4 : -4}
      variants={variants}
      whileHover={{ y: -10 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`group flex w-[240px] shrink-0 snap-center flex-col overflow-hidden rounded-lg shadow-card md:w-auto md:shrink ${
        accent ? 'bg-sun' : 'bg-surface'
      }`}>
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={photos[photo]}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
        />
        <span className="absolute left-3.5 top-3.5 inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-ground px-2 text-[13px] font-bold tabular-nums text-ink shadow-card">
          {String(n).padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-5 pb-6 pt-5">
        <h3 className="text-[24px] font-extrabold leading-none tracking-[-0.03em]">{title}</h3>
        <p className={`text-[15px] leading-snug ${accent ? 'text-ink/70' : 'text-muted'}`}>{line}</p>
      </div>
    </motion.a>
  )
}
