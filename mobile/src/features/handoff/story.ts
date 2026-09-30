import { useMemo } from 'react';

import { daysBetween, formatTime } from '@/data/dates';
import type { PhotoKey } from '@/data/photos';
import { displayName, firstsFor, momentsFor, useStore, weightsFor, type Kitten, type Moment, type Mother, type NewHome, type Weight } from '@/data/store';

/** What the owner chose to send along. Encoded into the `/shared/[id]?include=` param. */
export type Include = { photos: boolean; firsts: boolean; growth: boolean; family: boolean };
export type IncludeKey = keyof Include;

export const INCLUDE_KEYS: IncludeKey[] = ['photos', 'firsts', 'growth', 'family'];
export const ALL_INCLUDED: Include = { photos: true, firsts: true, growth: true, family: true };
/** Screen 18 default: mum & siblings starts off. */
export const DEFAULT_INCLUDE: Include = { photos: true, firsts: true, growth: true, family: false };

export function encodeInclude(i: Include): string {
  return INCLUDE_KEYS.filter((k) => i[k]).join(',');
}

/** Missing param → everything (a link opened cold shows the full story). */
export function decodeInclude(raw: string | string[] | undefined): Include {
  if (raw === undefined) return ALL_INCLUDED;
  const s = Array.isArray(raw) ? raw[0] : raw;
  const on = new Set(s.split(',').filter(Boolean));
  return { photos: on.has('photos'), firsts: on.has('firsts'), growth: on.has('growth'), family: on.has('family') };
}

/** Fake, stable share link. */
export const shareLink = (kittenId: string) => `https://kittenjourney.app/s/${kittenId}-7f3k`;

export type Pronouns = { subj: string; Subj: string; obj: string; poss: string; Poss: string; is: string };

function pronounsFor(k: Pick<Kitten, 'sex'>): Pronouns {
  if (k.sex === 'boy') return { subj: 'he', Subj: 'He', obj: 'him', poss: 'his', Poss: 'His', is: "he's" };
  if (k.sex === 'girl') return { subj: 'she', Subj: 'She', obj: 'her', poss: 'her', Poss: 'Her', is: "she's" };
  return { subj: 'they', Subj: 'They', obj: 'them', poss: 'their', Poss: 'Their', is: "they've" };
}

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];

/** Demo copy for the shared page. Anything not listed here falls back to generated text. */
const NOTES: Record<string, string> = {
  pip: "He was first out, and he's been first to everything since. He loves the blue mouse, the top of the sofa, and being carried like a baby for exactly ten seconds.",
};
const LOVES: Record<string, string> = { pip: "The blue mouse. It's coming with him." };
const COMFORT: Record<string, string> = { pip: 'his mouse' };

export type Story = {
  kitten: Kitten;
  name: string;
  pro: Pronouns;
  owner: { name: string; child: string | null };
  today: string;
  home: NewHome | null;
  /** "Sam & Rosa" or "their new family". */
  recipient: string;
  mother: Mother | null;
  siblings: Kitten[];
  birthDate: string | null;
  /** 1-based position in the litter by birth time. */
  birthOrder: number;
  litterSize: number;
  weights: Weight[];
  firstWeight: Weight | null;
  latestWeight: Weight | null;
  /** Age in whole weeks on moving day, when there is one. */
  weeksAtMove: number | null;
  /** Oldest first — the firsts rail. */
  firsts: Moment[];
  /** Newest first, firsts excluded — "lately". */
  moments: Moment[];
  /** Unique photos of this kitten (own photo, own moments, litter moments). */
  photoKeys: PhotoKey[];
  /** Note from the family, shown under "This is Pip." */
  note: string;
  loves: string;
  /** "his mouse" / "a soft blanket" — used in the first-week tips. */
  comfort: string;
};

type StoreSlice = ReturnType<typeof useStore.getState>;

export function buildStory(s: StoreSlice, id: string): Story | null {
  const kitten = s.kittens.find((k) => k.id === id);
  if (!kitten) return null;

  const name = displayName(kitten);
  const pro = pronounsFor(kitten);
  const home = s.homes.find((h) => h.kittenId === id) ?? null;
  const weights = weightsFor(s.weights, id);
  const birthDate = s.birth?.date ?? weights[0]?.date ?? null;
  const ordered = [...s.kittens].sort((a, b) => (a.birthTime ?? '99:99').localeCompare(b.birthTime ?? '99:99'));
  const birthOrder = ordered.findIndex((k) => k.id === id) + 1;
  const firsts = firstsFor(s.moments, id);
  const moments = momentsFor(s.moments, id).filter((m) => !m.first);

  const photoKeys: PhotoKey[] = [];
  const push = (p: PhotoKey | null) => {
    if (p && !photoKeys.includes(p)) photoKeys.push(p);
  };
  push(kitten.photo);
  momentsFor(s.moments, id).forEach((m) => push(m.photo));
  momentsFor(s.moments, 'litter').forEach((m) => push(m.photo));

  const firstWeight = weights[0] ?? null;
  const latestWeight = weights[weights.length - 1] ?? null;
  const weeksAtMove = home && birthDate ? Math.round(daysBetween(birthDate, home.movingDay) / 7) : null;

  const note = NOTES[id] ?? generatedNote({ pro, birthOrder, litterSize: s.kittens.length, kitten, firsts, owner: s.owner.name });

  return {
    kitten,
    name,
    pro,
    owner: s.owner,
    today: s.today,
    home,
    recipient: home?.names ?? 'their new family',
    mother: s.mother,
    siblings: s.kittens.filter((k) => k.id !== id),
    birthDate,
    birthOrder,
    litterSize: s.kittens.length,
    weights,
    firstWeight,
    latestWeight,
    weeksAtMove,
    firsts,
    moments,
    photoKeys,
    note,
    loves: LOVES[id] ?? 'Warm laps and a sunny window.',
    comfort: COMFORT[id] ?? 'a soft blanket that smells of home',
  };
}

function generatedNote(a: { pro: Pronouns; birthOrder: number; litterSize: number; kitten: Kitten; firsts: Moment[]; owner: string }): string {
  const { pro, birthOrder, litterSize, kitten, firsts } = a;
  const parts: string[] = [];
  if (birthOrder === 1) parts.push(`${pro.Subj} was first out, and ${pro.is} been first to everything since.`);
  else if (birthOrder > 0) {
    const when = kitten.birthTime ? ` at ${formatTime(kitten.birthTime)}` : '';
    parts.push(`${pro.Subj} was ${ORDINALS[birthOrder - 1] ?? `number ${birthOrder}`} of ${litterSize}${when}.`);
  }
  if (kitten.tagline) parts.push(`At home ${pro.subj} ${pro.subj === 'they' ? 'are' : 'is'} "${kitten.tagline}".`);
  const last = firsts[firsts.length - 1];
  if (last?.first) parts.push(`Latest first: ${last.first.toLowerCase()}.`);
  if (!parts.length) parts.push(`${pro.Subj} ${pro.subj === 'they' ? 'are' : 'is'} small, curious and very loved.`);
  return parts.join(' ');
}

/** Story for a kitten id, or null when the id is unknown. */
export function useStory(id: string | undefined): Story | null {
  const s = useStore();
  return useMemo(() => (id ? buildStory(s, id) : null), [s, id]);
}

/** "Day 9" / "Week 4" for a moment, or the short date when the birth date is unknown. */
export function ageAt(birthDate: string | null, date: string): string {
  if (!birthDate) return date;
  const days = daysBetween(birthDate, date);
  return days < 14 ? `Day ${days}` : `Week ${Math.floor(days / 7)}`;
}

/** Days since birth for chart x positions; falls back to sample index. */
export function dayOffsets(weights: Weight[], birthDate: string | null): number[] {
  const origin = birthDate ?? weights[0]?.date;
  return weights.map((w, i) => (origin ? daysBetween(origin, w.date) : i));
}

/** Friendly share sheet copy. */
export function shareMessage(story: Story): string {
  const who = story.owner.child ? `${story.owner.name} and ${story.owner.child}` : story.owner.name;
  return `Meet ${story.name}! ${who} put together ${story.pro.poss} story for you — how ${story.pro.subj} grew, ${story.pro.poss} firsts and a few favourite moments.`;
}
