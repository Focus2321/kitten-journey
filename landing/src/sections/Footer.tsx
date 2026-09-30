import { TailSwish } from '../cats'
import { LogoMark } from './parts/end-doodles'

export function Footer() {
  return (
    <footer id="footer" className="relative overflow-clip bg-ink text-ground">
      <div className="pointer-events-none absolute right-8 top-0 md:left-1/2 md:right-auto md:-translate-x-1/2" aria-hidden>
        <TailSwish className="w-12 md:w-14" color="ginger" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-start gap-5 px-6 py-14 md:flex-row md:items-center md:justify-between md:px-10 md:py-20">
        <a href="#top" className="flex items-center gap-3">
          <LogoMark className="w-9 md:w-10" />
          <span className="text-[17px] font-bold tracking-title md:text-[19px]">Kitten Journey</span>
        </a>
        <p className="text-[13px] font-semibold text-ground/55 md:text-[14px]">Concept preview · 2026</p>
      </div>
    </footer>
  )
}
