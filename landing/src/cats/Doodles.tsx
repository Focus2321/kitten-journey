/** STUB — small hand-drawn decorations: sparkle, heart, zzz. Animate subtly. */
export function Sparkle({ className = 'w-6', color = '#FFCE3A' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill={color} />
    </svg>
  )
}
export function Heart({ className = 'w-6', color = '#FFA7B4' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 21s-9-6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12z" fill={color} />
    </svg>
  )
}
export function Zzz({ className = 'w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <text x="4" y="30" fontSize="24" fontWeight="800" fill="#15130F">z</text>
    </svg>
  )
}
