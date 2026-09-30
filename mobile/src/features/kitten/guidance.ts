import type { Kitten } from '@/data/store';

/** Subject pronoun to pair with the store's possessive `pronoun(k)`. */
export const subject = (k: Pick<Kitten, 'sex'>) => (k.sex === 'boy' ? 'he' : k.sex === 'girl' ? 'she' : 'they');
export const reflexive = (k: Pick<Kitten, 'sex'>) => (k.sex === 'boy' ? 'himself' : k.sex === 'girl' ? 'herself' : 'themselves');
export const object = (k: Pick<Kitten, 'sex'>) => (k.sex === 'boy' ? 'him' : k.sex === 'girl' ? 'her' : 'them');

type Guidance = { eyebrow: string; text: string };

/**
 * Age-based, illustrative-only guidance for the kitten profile.
 * Every card renders through <GuidanceCard>, which always adds "General guidance · ask your vet if unsure".
 */
export function guidanceFor(k: Pick<Kitten, 'sex'>, ageDays: number): Guidance {
  const his = k.sex === 'boy' ? 'his' : k.sex === 'girl' ? 'her' : 'their';
  const he = subject(k);
  const week = Math.floor(ageDays / 7);

  if (ageDays < 7) {
    return {
      eyebrow: 'Days 1–7 · warm and fed',
      text: `Mostly sleeping and nursing is exactly right. A steady little gain each day is the thing to watch.`,
    };
  }
  if (ageDays < 14) {
    return {
      eyebrow: 'Week 2 · eyes and ears',
      text: `Eyes open around now and ${he} will start to hear you. Keep the nest dim and quiet so it isn't too much at once.`,
    };
  }
  if (week < 4) {
    return {
      eyebrow: `Week ${week} · finding ${his} feet`,
      text: `Wobbly steps turn into short walks this week. A low-sided box lets ${object(k)} explore without a tumble.`,
    };
  }
  if (week < 6) {
    return {
      eyebrow: `Week ${week} · tasting the world`,
      text: `A shallow dish of wet food is worth offering. ${cap(he)} may walk through it first. That still counts.`,
    };
  }
  if (week < 8) {
    return {
      eyebrow: `Week ${week} · play is practice`,
      text: `Pouncing on ${his} siblings is how ${he} learns gentle paws. A wand toy keeps fingers out of it.`,
    };
  }
  return {
    eyebrow: `Week ${week} · nearly ready`,
    text: `Around now ${he} is ready for a first vet check and, soon after, a new home. ${cap(his)} siblings taught ${object(k)} the rest.`,
  };
}

/** The reassuring line under the weight chart. */
export function weightLine(count: number, ageDays: number): string {
  if (count === 0) return 'No weigh-ins yet. The first one is the hardest to remember.';
  if (count === 1) return 'One weigh-in so far. The line starts tomorrow.';
  if (ageDays < 14) return 'Gaining a little every day. That’s exactly what you want to see.';
  return 'Steady gains every week. That’s exactly what you want to see.';
}

/** Firsts most families log, with the rough age they tend to happen. Used for the dashed "up next" cards. */
export const UPCOMING_FIRSTS: { label: string; hint: string; day: number; match: RegExp }[] = [
  { label: 'Eyes open', hint: 'Around day 7–10', day: 10, match: /eye/i },
  { label: 'Wobbly first steps', hint: 'Around day 17', day: 17, match: /step|walk/i },
  { label: 'Litter box, solo', hint: 'Around week 4', day: 28, match: /litter/i },
  { label: 'First taste of food', hint: 'Around week 4–5', day: 32, match: /food|eat|dish/i },
  { label: 'First vet check', hint: 'Around week 8', day: 56, match: /vet/i },
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
