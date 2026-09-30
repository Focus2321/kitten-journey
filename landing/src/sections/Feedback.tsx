import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { PeekingCat } from '../cats'
import { Reveal, Stagger, StaggerItem, WordReveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { Sticker } from '../components/Sticker'
import { Burst } from './parts/end-Burst'

/** Set to receive feedback by email; the answers are always saved to localStorage too. */
export const FEEDBACK_EMAIL = ''

const USE = ['Yes, I would', 'Maybe', 'Not for me']
const MOMENTS = ['Pregnancy', 'Birth night', 'Raising', 'New homes']

type Answers = { use: string | null; moment: string | null; missing: string }

function summarise(a: Answers) {
  return [
    'Kitten Journey feedback',
    '',
    `Would you use it if your cat was expecting? ${a.use ?? '—'}`,
    `Which moment matters most? ${a.moment ?? '—'}`,
    `What's missing? ${a.missing.trim() || '—'}`,
  ].join('\n')
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      animate={{ scale: selected ? 1.05 : 1 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 520, damping: 16 }}
      className={`rounded-full px-4 py-2.5 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-200 ${
        selected ? 'bg-ink text-ground' : 'bg-surface text-ink hover:bg-line'
      }`}>
      {label}
    </motion.button>
  )
}

function Card({ n, tint, question, children }: { n: number; tint: string; question: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-ground p-5 shadow-card md:p-7">
      <div className="flex items-start gap-3.5">
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${tint}`}>{n}</span>
        <p className="text-[18px] font-bold leading-[1.2] tracking-title text-balance md:text-[22px]">{question}</p>
      </div>
      <div className="mt-4 pl-0 md:mt-5 md:pl-[46px]">{children}</div>
    </div>
  )
}

export function Feedback() {
  const [answers, setAnswers] = useState<Answers>({ use: null, moment: null, missing: '' })
  const [sent, setSent] = useState(false)
  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => setAnswers((a) => ({ ...a, [key]: value }))

  const send = () => {
    if (!answers.use) return
    const summary = summarise(answers)
    try {
      localStorage.setItem('kj-feedback', JSON.stringify({ ...answers, at: new Date().toISOString() }))
    } catch {
      /* private mode: ignore */
    }
    if (FEEDBACK_EMAIL) {
      window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Kitten Journey feedback')}&body=${encodeURIComponent(summary)}`
    }
    setSent(true)
  }

  return (
    <Section id="feedback" tone="sun">
      <div className="grid gap-16 md:grid-cols-12 md:items-center md:gap-10">
        <div className="md:col-span-5">
          <h2 className="display text-[56px] md:text-[80px]">
            <WordReveal text="Would you use this?" />
          </h2>
          <Reveal delay={0.25} y={16}>
            <p className="lead mt-5 max-w-[26ch] text-ink/65 md:mt-7">It's an early concept. Honest reactions help most.</p>
          </Reveal>
        </div>

        <div className="relative mt-14 md:col-span-7 md:mt-0 md:pl-8">
          {/* a cat peeks over the top of the stack */}
          <Reveal delay={0.5} y={30} className="pointer-events-none absolute -top-[66px] left-[8%] z-0 md:-top-[84px] md:left-[18%]">
            <PeekingCat className="w-24 md:w-32" color="tabby" />
          </Reveal>
          <div className="pointer-events-none absolute -top-[132px] right-0 z-20 md:-right-16 md:-top-24">
            <Sticker photo="pip" caption="Pip · 6 weeks" rotate={8} className="w-28 md:w-32" delay={0.3} />
          </div>
          <div className="pointer-events-none absolute -bottom-14 -left-2 z-20 md:-bottom-16 md:-left-10">
            <Sticker photo="juniperWk7" caption="Juniper · week 7" rotate={-7} className="w-32" delay={0.5} />
          </div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="relative flex min-h-[420px] items-center justify-center rounded-lg bg-ground shadow-card md:min-h-[520px]">
                  <Burst />
                  <motion.h3
                    className="display relative text-[48px] md:text-[72px]"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}>
                    Thank you!
                  </motion.h3>
                </motion.div>
              ) : (
                <motion.div key="stack" exit={{ opacity: 0, scale: 0.96, y: -12, transition: { duration: 0.3 } }}>
                  <Stagger stagger={0.12} className="flex flex-col gap-3 md:gap-4">
                    <StaggerItem>
                      <Card n={1} tint="bg-ink text-ground" question="Would you use it if your cat was expecting?">
                        <div className="flex flex-wrap gap-2">
                          {USE.map((o) => (
                            <Chip key={o} label={o} selected={answers.use === o} onClick={() => set('use', o)} />
                          ))}
                        </div>
                      </Card>
                    </StaggerItem>
                    <StaggerItem>
                      <Card n={2} tint="bg-paw text-ink" question="Which moment matters most?">
                        <div className="flex flex-wrap gap-2">
                          {MOMENTS.map((o) => (
                            <Chip key={o} label={o} selected={answers.moment === o} onClick={() => set('moment', o)} />
                          ))}
                        </div>
                      </Card>
                    </StaggerItem>
                    <StaggerItem>
                      <Card n={3} tint="bg-sun-soft text-ink" question="What's missing?">
                        <textarea
                          value={answers.missing}
                          onChange={(e) => set('missing', e.target.value)}
                          placeholder="Anything confusing, unnecessary or missing"
                          rows={3}
                          className="w-full resize-none rounded-md bg-surface px-4 py-3.5 text-[16px] leading-[1.45] text-ink outline-none transition-shadow placeholder:text-muted/80 focus:ring-2 focus:ring-ink/80"
                        />
                      </Card>
                    </StaggerItem>
                    <StaggerItem className="flex justify-end pt-1 md:pt-2">
                      <motion.button
                        type="button"
                        onClick={send}
                        disabled={!answers.use}
                        whileHover={answers.use ? { scale: 1.04 } : undefined}
                        whileTap={answers.use ? { scale: 0.95 } : undefined}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="rounded-full bg-ink px-8 py-4 text-[16px] font-semibold text-ground shadow-card transition-colors duration-300 disabled:cursor-not-allowed disabled:bg-ground/60 disabled:text-ink/40 disabled:shadow-none">
                        Send
                      </motion.button>
                    </StaggerItem>
                  </Stagger>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  )
}
