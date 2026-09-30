import { motion } from 'motion/react'
import { selfPivot } from './parts'

/** One paw print: a pad plus four toes, facing up (walking towards -y), centred on (0, 0). */
function Paw({ color }: { color: string }) {
  return (
    <g fill={color}>
      <path d="M-8 4 C-8 -2 -4 -5 0 -5 C4 -5 8 -2 8 4 C8 9 4 12 0 12 C-4 12 -8 9 -8 4 Z" />
      <ellipse cx={-9.5} cy={-6} rx={3.2} ry={4.2} transform="rotate(-20 -9.5 -6)" />
      <ellipse cx={-3.3} cy={-11} rx={3.2} ry={4.4} transform="rotate(-6 -3.3 -11)" />
      <ellipse cx={3.3} cy={-11} rx={3.2} ry={4.4} transform="rotate(6 3.3 -11)" />
      <ellipse cx={9.5} cy={-6} rx={3.2} ry={4.2} transform="rotate(20 9.5 -6)" />
    </g>
  )
}

/**
 * Paw prints walking left to right along a gentle curve, alternating left and right feet.
 * They appear one after another when scrolled into view and then stay.
 */
export function PawTrail({ className = 'w-64', count = 6, color = '#FFA7B4' }: { className?: string; count?: number; color?: string }) {
  const stepX = 46
  const width = count * stepX + 20
  const prints = Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1)
    const x = 26 + i * stepX
    const curve = Math.sin(t * Math.PI) * -12
    const side = i % 2 ? 1 : -1
    return { x, y: 48 + curve + side * 13, rotate: 90 + side * 14 + curve * 0.6 }
  })

  return (
    <motion.svg
      viewBox={`0 0 ${width} 96`}
      className={className}
      aria-hidden
      style={{ overflow: 'visible' }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ staggerChildren: 0.22 }}>
      {prints.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rotate})`}>
          <motion.g
            style={selfPivot('50% 50%')}
            variants={{ hidden: { scale: 0, opacity: 0 }, show: { scale: 1, opacity: 1 } }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}>
            <Paw color={color} />
          </motion.g>
        </g>
      ))}
    </motion.svg>
  )
}
