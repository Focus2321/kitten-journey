// Dev-only gallery for reviewing the cat illustrations: http://localhost:<port>/cats.html
import '@fontsource-variable/bricolage-grotesque'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { Heart, KittenFace, PawTrail, PeekingCat, Sparkle, SleepyCat, TailSwish, WalkingCat, YarnBall, Zzz, type CatColor } from './index'

const COLORS: CatColor[] = ['ginger', 'tabby', 'grey', 'black', 'cream', 'calico']

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-bold uppercase tracking-wider opacity-60">{title}</h2>
      <div className="flex flex-wrap items-end gap-8">{children}</div>
    </section>
  )
}

function Band({ dark, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <div className={`${dark ? 'bg-night text-ground' : 'bg-ground text-ink'} px-12 py-14`}>
      <div className="mx-auto flex max-w-[1300px] flex-col gap-14">{children}</div>
    </div>
  )
}

function Set({ dark }: { dark?: boolean }) {
  return (
    <Band dark={dark}>
      <Row title="KittenFace">
        {COLORS.map((c, i) => (
          <KittenFace key={c} color={c} className="w-28" delay={i * 0.08} />
        ))}
        <KittenFace color="ginger" className="w-14" />
        <KittenFace color="calico" className="w-14" />
      </Row>
      <Row title="SleepyCat">
        {COLORS.map((c) => (
          <SleepyCat key={c} color={c} className="w-56" />
        ))}
        <SleepyCat color="ginger" className="w-28" />
      </Row>
      <Row title="PeekingCat (paws hang over the pink edge line)">
        {COLORS.map((c) => (
          <div key={c} className="relative flex flex-col items-center">
            <PeekingCat color={c} className="w-40 translate-y-[16%]" />
            <div className={`h-16 w-52 rounded-t-lg ${dark ? 'bg-paw-soft/20' : 'bg-paw-soft'}`} />
          </div>
        ))}
      </Row>
      <Row title="WalkingCat (strip)">
        <div className="flex w-full flex-col gap-4">
          <WalkingCat color="black" className={`h-24 w-full border-b ${dark ? 'border-white/20' : 'border-line'}`} />
          <WalkingCat color="tabby" className={`h-28 w-full border-b ${dark ? 'border-white/20' : 'border-line'}`} delay={0.6} />
          <div className="flex gap-6">
            {COLORS.filter((c) => c !== 'black' && c !== 'tabby').map((c) => (
              <WalkingCat key={c} color={c} className={`h-20 w-72 border-b ${dark ? 'border-white/20' : 'border-line'}`} />
            ))}
          </div>
        </div>
      </Row>
      <Row title="TailSwish (hanging from a top edge)">
        {COLORS.map((c) => (
          <div key={c} className="flex flex-col items-center">
            <div className={`h-6 w-28 rounded-b-lg ${dark ? 'bg-white/10' : 'bg-surface'}`} />
            <TailSwish color={c} className="w-14" />
          </div>
        ))}
      </Row>
      <Row title="YarnBall + PawTrail">
        <YarnBall className="w-32" />
        <YarnBall className="w-32" tone="paw" />
        <YarnBall className="w-16" />
        <PawTrail className="w-72" />
        <PawTrail className="w-96" count={8} color={dark ? '#FFCE3A' : '#15130F'} />
        <PawTrail className="w-40" count={4} color="#FFCE3A" />
      </Row>
      <Row title="Doodles">
        <Sparkle className="w-8" />
        <Sparkle className="w-5" color="#FFA7B4" />
        <Heart className="w-8" />
        <Heart className="w-5" color="#FFCE3A" />
        <Zzz className="w-12" />
        <Zzz className="w-8" />
      </Row>
    </Band>
  )
}

function Gallery() {
  return (
    <main className="font-sans">
      <Set />
      <Set dark />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
)
