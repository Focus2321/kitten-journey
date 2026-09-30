/** STUB — row/path of paw prints that appear one after another when scrolled into view. */
export function PawTrail({ className = 'w-64', count = 6, color = '#FFA7B4' }: { className?: string; count?: number; color?: string }) {
  return (
    <svg viewBox={`0 0 ${count * 40} 60`} className={className} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={i * 40 + 20} cy={i % 2 ? 40 : 20} r="10" fill={color} />
      ))}
    </svg>
  )
}
