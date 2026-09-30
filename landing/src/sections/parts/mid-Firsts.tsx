import { motion } from 'motion/react'

const stroke = { fill: 'none', stroke: '#15130F', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const icons = {
  eye: (
    <svg viewBox="0 0 24 24" className="w-4" aria-hidden>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" {...stroke} />
      <circle cx="12" cy="12" r="2.6" fill="#15130F" />
    </svg>
  ),
  steps: (
    <svg viewBox="0 0 24 24" className="w-4" aria-hidden>
      <ellipse cx="8" cy="15" rx="2.6" ry="3.4" fill="#15130F" />
      <circle cx="4.6" cy="9.6" r="1.3" fill="#15130F" />
      <circle cx="8" cy="8" r="1.3" fill="#15130F" />
      <circle cx="11.4" cy="9.6" r="1.3" fill="#15130F" />
      <ellipse cx="17" cy="9" rx="2.2" ry="2.8" fill="#15130F" opacity="0.45" />
      <circle cx="14.4" cy="4.4" r="1.1" fill="#15130F" opacity="0.45" />
      <circle cx="17" cy="3.4" r="1.1" fill="#15130F" opacity="0.45" />
      <circle cx="19.6" cy="4.4" r="1.1" fill="#15130F" opacity="0.45" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" className="w-4" aria-hidden>
      <path d="M4 9h16l-1.2 10.5a1.5 1.5 0 0 1-1.5 1.3H6.7a1.5 1.5 0 0 1-1.5-1.3L4 9z" {...stroke} />
      <path d="M3 9l2-4h14l2 4" {...stroke} />
      <path d="M9 14h6" {...stroke} />
    </svg>
  ),
}

const firsts = [
  { icon: icons.eye, label: 'Eyes open', when: 'day 9', tint: 'bg-sun-soft' },
  { icon: icons.steps, label: 'First wobbly steps', when: 'day 17', tint: 'bg-paw-soft' },
  { icon: icons.box, label: 'Litter box, solo', when: 'week 4', tint: 'bg-surface' },
]

/** Milestone pills that pop in one after another. */
export function Firsts({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2.5 md:gap-3 ${className}`}>
      {firsts.map((f, i) => (
        <motion.span
          key={f.label}
          className="flex items-center gap-2.5 rounded-full bg-ground py-1.5 pl-1.5 pr-4 text-[14px] font-bold shadow-card md:text-[15px]"
          initial={{ opacity: 0, scale: 0.5, rotate: -8, y: 12 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.25 + i * 0.22 }}>
          <span className={`grid size-8 place-items-center rounded-full ${f.tint}`}>{f.icon}</span>
          {f.label}
          <span className="font-semibold text-muted">· {f.when}</span>
        </motion.span>
      ))}
    </div>
  )
}
