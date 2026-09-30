import { motion } from 'motion/react'

import { photos, type PhotoKey } from '../screens'

type Props = { photo: PhotoKey; caption?: string; rotate?: number; className?: string; float?: boolean; delay?: number }

/** Polaroid-ish cat photo with a caption, springing in and then gently bobbing. */
export function Sticker({ photo, caption, rotate = -4, className = 'w-40', float = true, delay = 0 }: Props) {
  return (
    <motion.div
      className={className}
      animate={float ? { y: [0, -8, 0] } : undefined}
      transition={float ? { duration: 5 + delay * 2, repeat: Infinity, ease: 'easeInOut' } : undefined}>
      <motion.figure
        className="rounded-[22px] bg-ground p-2 shadow-card"
        initial={{ opacity: 0, scale: 0.8, rotate: rotate - 8 }}
        whileInView={{ opacity: 1, scale: 1, rotate }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ type: 'spring', stiffness: 160, damping: 16, delay }}>
        <img src={photos[photo]} alt="" loading="lazy" className="aspect-square w-full rounded-[16px] object-cover" />
        {caption && <figcaption className="px-1.5 pb-0.5 pt-2 text-[13px] font-semibold tracking-[-0.01em]">{caption}</figcaption>}
      </motion.figure>
    </motion.div>
  )
}
