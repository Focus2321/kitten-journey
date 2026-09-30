import type { ReactNode } from 'react'

const tones = {
  ground: 'bg-ground text-ink',
  surface: 'bg-surface text-ink',
  night: 'bg-night text-ground',
  paw: 'bg-paw-soft text-ink',
  sun: 'bg-sun text-ink',
} as const

type Props = { id: string; tone?: keyof typeof tones; className?: string; children: ReactNode }

/** Full-width band with the shared content container. Overflow is clipped so decorations can bleed. */
export function Section({ id, tone = 'ground', className = '', children }: Props) {
  return (
    <section id={id} className={`relative overflow-clip ${tones[tone]} ${className}`}>
      <div className="relative mx-auto w-full max-w-[1200px] px-6 py-24 md:px-10 md:py-36">{children}</div>
    </section>
  )
}
