import { addDays, daysBetween, pregnancyWeek, toDate } from '@/data/dates';
import type { Appetite, Mother } from '@/data/store';

/** Cats carry roughly nine weeks. */
export const PREGNANCY_WEEKS = 9;
export const GESTATION_DAYS = 64;

export const APPETITE_OPTIONS: { value: Appetite; label: string }[] = [
  { value: 'hungry', label: 'Hungry' },
  { value: 'normal', label: 'Normal' },
  { value: 'picky', label: 'Picky' },
];

export const appetiteLabel = (a: Appetite | null) => APPETITE_OPTIONS.find((o) => o.value === a)?.label ?? null;

/** Mood chips shown in the check-in sheet. Nesting only makes sense while she's expecting. */
export function moodOptions(expecting: boolean): string[] {
  return expecting
    ? ['Calm', 'Nesting', 'Extra cuddly', 'Restless', 'Sleepy', 'Not quite herself']
    : ['Calm', 'Settled with kittens', 'Extra cuddly', 'Restless', 'Sleepy', 'Not quite herself'];
}

/** "How far along does she seem?" choices → rough estimated mating date offsets. */
export const STAGE_GUESSES = [
  { id: 'early', label: 'Just found out', daysAgo: 21 },
  { id: 'showing', label: "Belly's showing", daysAgo: 45 },
  { id: 'soon', label: 'Any day now', daysAgo: 60 },
  { id: 'unsure', label: 'Not sure', daysAgo: null },
] as const;
export type StageGuess = (typeof STAGE_GUESSES)[number]['id'];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "mid-October" — a deliberately loose window around the due date. */
export function duePeriod(dueISO: string): string {
  const d = toDate(dueISO);
  const day = d.getDate();
  const part = day <= 10 ? 'early' : day <= 20 ? 'mid' : 'late';
  return `${part}-${MONTHS[d.getMonth()]}`;
}

export function estimatedDue(matingISO: string): string {
  return addDays(matingISO, GESTATION_DAYS);
}

/** Current pregnancy week, or null when we don't know how far along she is. */
export function weekFor(mother: Mother | null, today: string): number | null {
  if (!mother?.matingDate) return null;
  return Math.min(PREGNANCY_WEEKS + 1, pregnancyWeek(mother.matingDate, today));
}

/** "Kittens could arrive in about 2 weeks. Give or take — she'll decide." */
export function arrivalSentence(mother: Mother | null, today: string): string {
  if (!mother?.dueDate) return "We'll get a feel for her timing as she changes. No rush.";
  const days = daysBetween(today, mother.dueDate);
  if (days <= 0) return 'Kittens could arrive any moment now. Keep her nest quiet and close.';
  if (days < 7) return `Kittens could arrive any day now — about ${days} ${days === 1 ? 'day' : 'days'} by our guess.`;
  const weeks = Math.round(days / 7);
  return `Kittens could arrive in about ${weeks} ${weeks === 1 ? 'week' : 'weeks'}. Give or take — she'll decide.`;
}

type WeekCopy = { headline: (name: string) => string; journal: string; guidance: string };

const WEEKS: Record<number, WeekCopy> = {
  1: {
    headline: (n) => `${n}'s story starts here`,
    journal: 'Nothing to see yet — she looks and acts exactly like herself. That will change.',
    guidance: 'Keep her routine as normal as you can. Good food, fresh water and her usual quiet spots are all she needs right now.',
  },
  2: {
    headline: (n) => `${n} is keeping her secret`,
    journal: 'Still no outward signs. Some cats get a little sleepier around now.',
    guidance: 'If you use flea or worm treatments, check with your vet that they are safe for an expecting cat before the next dose.',
  },
  3: {
    headline: (n) => `${n}'s nipples may be pinking up`,
    journal: 'Around week three her nipples often turn pinker and stand out more — the classic first sign.',
    guidance: "Her nipples going pink and swollen is normal and one of the first signs. No need to do anything — just keep an eye on her appetite.",
  },
  4: {
    headline: (n) => `${n} might be feeling queasy`,
    journal: 'A short spell of morning-sickness-style pickiness can happen now. It usually passes within days.',
    guidance: 'A few picky days are common around week four. Small, more frequent meals help. Off her food entirely for a day is worth a call to your vet.',
  },
  5: {
    headline: (n) => `${n}'s appetite is picking up`,
    journal: 'The belly starts to round out and she may want second breakfasts.',
    guidance: 'Expecting cats often get hungrier as the weeks go on. Keep fresh water close and let meals flex with her appetite.',
  },
  6: {
    headline: (n) => `${n} is starting to show`,
    journal: 'Her belly is clearly rounder now and she may be extra affectionate — or extra opinionated.',
    guidance: 'Switching gradually to a kitten or growth food from now on gives her the extra calories she needs. Ask your vet what they recommend.',
  },
  7: {
    headline: (n) => `${n}'s nesting era has begun`,
    journal: 'Her belly is rounding out and she may start scouting cosy hideouts. Lots of naps are completely normal now.',
    guidance: 'Set up a nesting box somewhere quiet and warm. Soft old towels, low sides, easy to clean. She may ignore it — that is her call.',
  },
  8: {
    headline: (n) => `${n} is slowing right down`,
    journal: 'You might feel the kittens move when she is resting. She is eating a lot and moving less.',
    guidance: 'Let her rest. Keep the nesting spot ready and gently discourage jumping from heights. A slight drop in appetite this week is normal.',
  },
  9: {
    headline: (n) => `${n} could go any day`,
    journal: 'Restlessness, pacing and hiding are all signs the kittens are close. Keep things calm.',
    guidance: 'Pacing, panting or nesting hard usually means kittens within a day or so. Have your vet number handy and mostly let her lead.',
  },
};

const LATE: WeekCopy = {
  headline: (n) => `${n} is taking her time`,
  journal: 'Past nine weeks is still within the normal range. Pacing and hiding mean kittens are close.',
  guidance: 'If she goes more than a few days past your best guess, or seems distressed, a quick call to your vet is a good idea.',
};

const UNKNOWN: WeekCopy = {
  headline: (n) => `${n} is expecting`,
  journal: "We don't know how far along she is yet, and that's fine. Her body will tell the story week by week.",
  guidance: 'Expecting cats often get hungrier as the weeks go on. Keep fresh water close and let meals flex with her appetite.',
};

export function weekCopy(week: number | null): WeekCopy {
  if (week === null) return UNKNOWN;
  return WEEKS[week] ?? (week > PREGNANCY_WEEKS ? LATE : UNKNOWN);
}

/** "Expecting · week 7-ish" / "Expecting · day one" */
export function expectingPill(week: number | null, firstDay: boolean): string {
  if (firstDay) return 'Expecting · day one';
  if (week === null) return 'Expecting';
  return week > PREGNANCY_WEEKS ? 'Expecting · any day now' : `Expecting · week ${week}-ish`;
}
