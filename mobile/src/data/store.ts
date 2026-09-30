import { create } from 'zustand';

import { colors } from '@/theme/tokens';

import { addDays, DEMO, toISO } from './dates';
import type { Photo } from './photos';

export type Phase = 'new' | 'expecting' | 'newborn' | 'growing';
export type Sex = 'boy' | 'girl' | 'unknown';

export type Mother = {
  name: string;
  photo: Photo | null;
  /** Everything below is optional — unknowns never block. */
  /** Free text, e.g. "2 years". */
  age: string | null;
  matingDate: string | null;
  dueDate: string | null;
  firstLitter: boolean | null;
  vet: string | null;
};

export type Kitten = {
  id: string;
  /** null until the family picks a name — the temporary collar ID is shown instead. */
  name: string | null;
  tempId: string;
  tempColor: string;
  sex: Sex;
  coat: string;
  photo: Photo | null;
  birthTime: string | null;
  birthWeight: number | null;
  tagline: string | null;
};

export type Weight = { id: string; kittenId: string; date: string; grams: number };

/** 'litter' and 'mother' are valid subjects alongside kitten ids. */
export type SubjectId = string;

export type Moment = {
  id: string;
  subjectId: SubjectId;
  date: string;
  text: string;
  photo: Photo | null;
  /** A "first" shows in the kitten's firsts rail. */
  first: string | null;
  kind: 'moment' | 'photo' | 'feeding' | 'checkin';
};

export type Appetite = 'hungry' | 'normal' | 'picky';

export type Checkin = {
  id: string;
  subjectId: SubjectId;
  date: string;
  appetite: Appetite | null;
  mood: string[];
  note: string | null;
  photo: Photo | null;
};

export type TaskAction = 'mother-checkin' | 'weigh-in' | 'photo' | 'quick-add' | 'none';

export type Task = {
  id: string;
  title: string;
  subtitle: string;
  photo: Photo | null;
  icon: 'camera' | 'box' | 'scale' | 'heart' | 'bottle' | 'sparkle' | 'calendar' | null;
  done: boolean;
  action: TaskAction;
};

export type NewHome = { kittenId: string; names: string; movingDay: string };

export type BirthDraft = { date: string; count: number };

export const COLLARS = [
  { tempId: 'Blue', color: '#7FA7F5' },
  { tempId: 'Green', color: colors.green },
  { tempId: 'Orange', color: colors.orange },
  { tempId: 'Purple', color: '#B08CE8' },
  { tempId: 'Red', color: '#E86A5C' },
  { tempId: 'Yellow', color: colors.sun },
] as const;

type State = {
  phase: Phase;
  /** True while showing the bundled demo story, whose "today" is pinned so the story reads right. */
  demo: boolean;
  /** Local "today" (YYYY-MM-DD). Real families follow the device clock; the demo is pinned. */
  today: string;
  owner: { name: string; child: string | null };
  mother: Mother | null;
  birth: BirthDraft | null;
  kittens: Kitten[];
  weights: Weight[];
  moments: Moment[];
  checkins: Checkin[];
  tasks: Task[];
  homes: NewHome[];
};

type Actions = {
  loadDemo: (phase: Phase) => void;
  setMother: (patch: Partial<Mother>) => void;
  /** Finish onboarding → expecting home. */
  completeSetup: () => void;
  startBirth: (draft: BirthDraft) => void;
  /** Save kitten `index` (0-based) from the birth flow. Assigns the collar ID. Returns the kitten id. */
  saveKitten: (index: number, data: Partial<Omit<Kitten, 'id' | 'tempId' | 'tempColor'>>) => string;
  /** Birth complete → newborn home. */
  finishBirth: () => void;
  nameKitten: (id: string, name: string) => void;
  /** Correct details entered during onboarding. A changed birth weight updates the birth-day weigh-in. */
  updateKitten: (id: string, patch: Partial<Omit<Kitten, 'id' | 'tempId' | 'tempColor'>>) => void;
  /** Move "today" to the device date (no-op for the pinned demo). */
  syncToday: () => void;
  addWeight: (kittenId: string, grams: number, date?: string) => void;
  addMoment: (m: Omit<Moment, 'id' | 'date'> & { date?: string }) => void;
  addCheckin: (c: Omit<Checkin, 'id' | 'date'> & { date?: string }) => void;
  toggleTask: (id: string) => void;
  completeTask: (id: string) => void;
};

let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

// ---------------------------------------------------------------------------
// Demo story
// ---------------------------------------------------------------------------

const JUNIPER: Mother = {
  name: 'Juniper',
  photo: 'juniper',
  age: null,
  matingDate: DEMO.matingDate,
  dueDate: DEMO.dueDate,
  firstLitter: true,
  vet: 'Riverside Vets',
};

function demoKittens(biscuitNamed: boolean): Kitten[] {
  return [
    { id: 'pip', name: 'Pip', tempId: 'Blue', tempColor: COLLARS[0].color, sex: 'boy', coat: 'Grey tabby', photo: 'pip', birthTime: '05:42', birthWeight: 102, tagline: 'firstborn · fearless' },
    { id: 'fig', name: 'Fig', tempId: 'Green', tempColor: COLLARS[1].color, sex: 'girl', coat: 'Calico', photo: 'fig', birthTime: '06:10', birthWeight: 94, tagline: 'loud · always first to the bowl' },
    { id: 'biscuit', name: biscuitNamed ? 'Biscuit' : null, tempId: 'Orange', tempColor: COLLARS[2].color, sex: 'boy', coat: 'Cream', photo: 'biscuit', birthTime: '06:31', birthWeight: 98, tagline: 'named by Maya · sleepy' },
    { id: 'moth', name: 'Moth', tempId: 'Purple', tempColor: COLLARS[3].color, sex: 'girl', coat: 'Black & white', photo: 'moth', birthTime: '07:05', birthWeight: 89, tagline: 'smallest · biggest purr' },
  ];
}

/** Daily grams for days 0–5, then weekly for weeks 1–6. */
const SERIES: Record<string, { daily: number[]; weekly: number[] }> = {
  pip: { daily: [102, 108, 125, 139, 151, 158], weekly: [176, 262, 350, 440, 525, 612] },
  fig: { daily: [94, 99, 112, 124, 134, 141], weekly: [160, 238, 318, 402, 480, 561] },
  biscuit: { daily: [98, 104, 118, 131, 142, 149], weekly: [168, 250, 335, 420, 500, 584] },
  moth: { daily: [89, 92, 104, 115, 126, 133], weekly: [150, 222, 298, 378, 452, 528] },
};

/**
 * Newborn (day 5): days 0–4 for everyone, plus today's weigh-in already done for Fig and Moth
 * so the home card reads "2 / 4" and the weigh-in sheet starts on Pip (151 → 158, +7 g).
 */
function demoWeights(phase: 'newborn' | 'growing'): Weight[] {
  const out: Weight[] = [];
  for (const [kittenId, s] of Object.entries(SERIES)) {
    s.daily.forEach((grams, day) => {
      if (phase === 'newborn' && day === 5 && (kittenId === 'pip' || kittenId === 'biscuit')) return;
      out.push({ id: `w-${kittenId}-d${day}`, kittenId, date: addDays(DEMO.birthDate, day), grams });
    });
    if (phase === 'growing') {
      s.weekly.forEach((grams, i) => out.push({ id: `w-${kittenId}-w${i + 1}`, kittenId, date: addDays(DEMO.birthDate, (i + 1) * 7), grams }));
    }
  }
  return out;
}

const PREGNANCY_CHECKINS: Checkin[] = [
  { id: 'c-wk5', subjectId: 'mother', date: '2026-09-13', appetite: 'hungry', mood: ['Cuddly', 'Sleepy'], note: 'Ate her breakfast and then half of mine.', photo: 'juniperWk5' },
  { id: 'c-wk6', subjectId: 'mother', date: '2026-09-20', appetite: 'normal', mood: ['Restless'], note: 'Checked every cupboard in the house. Nesting already?', photo: 'juniperWk6' },
  { id: 'c-wk7', subjectId: 'mother', date: '2026-09-26', appetite: 'hungry', mood: ['Cuddly'], note: 'Belly is starting to show. Purring on Maya’s lap.', photo: 'juniperWk7' },
];

const PIP_MOMENTS: Moment[] = [
  { id: 'm-pip-eyes', subjectId: 'pip', date: addDays(DEMO.birthDate, 9), text: 'Blue eyes, very surprised by everything.', photo: 'pip', first: 'Eyes open', kind: 'moment' },
  { id: 'm-pip-steps', subjectId: 'pip', date: addDays(DEMO.birthDate, 17), text: 'Three steps, one faceplant, zero regrets.', photo: 'pip', first: 'Wobbly first steps', kind: 'moment' },
  { id: 'm-pip-litter', subjectId: 'pip', date: addDays(DEMO.birthDate, 28), text: 'Used the litter box all by himself.', photo: 'pipOlder', first: 'Litter box solo', kind: 'moment' },
  { id: 'm-pip-sofa', subjectId: 'pip', date: '2026-11-20', text: 'Climbed all the way to the top of the sofa. Could not get down.', photo: 'pipOlder', first: 'Top of the sofa', kind: 'moment' },
  { id: 'm-pip-mouse', subjectId: 'pip', date: DEMO.growingToday, text: 'Stole the blue mouse from Fig. Again. Guarded it for an hour.', photo: 'pipOlder', first: null, kind: 'moment' },
  { id: 'm-litter-nap', subjectId: 'litter', date: '2026-11-18', text: 'Pile of four. Juniper on guard duty.', photo: 'nap', first: null, kind: 'photo' },
  { id: 'm-moth-play', subjectId: 'moth', date: '2026-11-21', text: 'Moth discovered the feather wand.', photo: 'mothPlay', first: 'First pounce', kind: 'moment' },
  { id: 'm-biscuit-name', subjectId: 'biscuit', date: DEMO.namingDay, text: 'Maya named him Biscuit. Nobody argued.', photo: 'biscuit', first: 'Got his name', kind: 'moment' },
  { id: 'm-cuddle', subjectId: 'litter', date: '2026-11-15', text: 'Maya’s first time holding all four at once.', photo: 'cuddle', first: null, kind: 'photo' },
];

const DEMO_TASKS: Record<Exclude<Phase, 'new'>, Task[]> = {
  expecting: [
    { id: 't-checkin', title: 'Check in on Juniper', subtitle: 'Appetite, mood, a photo', photo: 'juniper', icon: null, done: false, action: 'mother-checkin' },
    { id: 't-bump', title: 'Weekly bump photo', subtitle: 'Same spot, same angle', photo: null, icon: 'camera', done: true, action: 'photo' },
    { id: 't-nest', title: 'Set up a nesting box', subtitle: 'Quiet, warm, somewhere she likes', photo: null, icon: 'box', done: false, action: 'none' },
  ],
  newborn: [
    { id: 't-weigh', title: 'Daily weigh-in', subtitle: 'Same time each day', photo: null, icon: 'scale', done: false, action: 'weigh-in' },
    { id: 't-juniper', title: 'How is Juniper eating?', subtitle: 'Nursing mums eat a lot', photo: 'juniperResting', icon: null, done: true, action: 'mother-checkin' },
    { id: 't-photo', title: 'A photo of today', subtitle: 'They change every day', photo: null, icon: 'camera', done: false, action: 'photo' },
  ],
  growing: [
    { id: 't-weigh', title: 'Weekly weigh-in', subtitle: 'Sunday is weigh day', photo: null, icon: 'scale', done: true, action: 'weigh-in' },
    { id: 't-food', title: 'Try wet food in a shallow dish', subtitle: 'Week 6 · weaning', photo: null, icon: 'bottle', done: false, action: 'none' },
    { id: 't-moment', title: 'Log a moment for each kitten', subtitle: 'Their new families will love it', photo: 'pipOlder', icon: null, done: false, action: 'quick-add' },
  ],
};

/** Tasks for a phase, addressed to this family's mother rather than the demo's. */
function tasksFor(phase: Exclude<Phase, 'new'>, mother: Mother | null): Task[] {
  const name = mother?.name || 'her';
  return DEMO_TASKS[phase].map((t) => ({
    ...t,
    done: false,
    title: t.title.replace('Juniper', name),
    photo: t.action === 'mother-checkin' ? (mother?.photo ?? null) : t.photo,
    icon: t.action === 'mother-checkin' && !mother?.photo ? 'heart' : t.icon,
  }));
}

const EMPTY: State = {
  phase: 'new',
  demo: true,
  today: DEMO.expectingToday,
  owner: { name: 'Ana', child: 'Maya' },
  mother: null,
  birth: null,
  kittens: [],
  weights: [],
  moments: [],
  checkins: [],
  tasks: [],
  homes: [],
};

function demoState(phase: Phase): State {
  switch (phase) {
    case 'new':
      return freshState();
    case 'expecting':
      return { ...EMPTY, phase, mother: JUNIPER, checkins: PREGNANCY_CHECKINS, tasks: DEMO_TASKS.expecting };
    case 'newborn':
      return {
        ...EMPTY,
        phase,
        today: DEMO.newbornToday,
        mother: JUNIPER,
        birth: { date: DEMO.birthDate, count: 4 },
        kittens: demoKittens(false),
        weights: demoWeights('newborn'),
        checkins: PREGNANCY_CHECKINS,
        moments: [],
        tasks: DEMO_TASKS.newborn,
      };
    case 'growing':
      return {
        ...EMPTY,
        phase,
        today: DEMO.growingToday,
        mother: JUNIPER,
        birth: { date: DEMO.birthDate, count: 4 },
        kittens: demoKittens(true),
        weights: demoWeights('growing'),
        checkins: PREGNANCY_CHECKINS,
        moments: PIP_MOMENTS,
        tasks: DEMO_TASKS.growing,
        homes: [{ kittenId: 'pip', names: 'Sam & Rosa', movingDay: DEMO.movingDay }],
      };
  }
}

/** A real family starting from nothing, on today's date. */
function freshState(): State {
  return { ...EMPTY, demo: false, today: toISO(new Date()), owner: { name: '', child: null } };
}

// ---------------------------------------------------------------------------

export const useStore = create<State & Actions>()((set, get) => ({
  ...freshState(),

  loadDemo: (phase) => set(demoState(phase)),

  syncToday: () =>
    set((s) => {
      const today = toISO(new Date());
      return s.demo || s.today === today ? s : { today };
    }),

  setMother: (patch) =>
    set((s) => ({
      mother: { ...(s.mother ?? { name: '', photo: null, age: null, matingDate: null, dueDate: null, firstLitter: null, vet: null }), ...patch },
    })),

  completeSetup: () =>
    set((s) => ({ phase: 'expecting', tasks: s.tasks.length ? s.tasks : tasksFor('expecting', s.mother) })),

  startBirth: (draft) => set({ birth: draft, kittens: [], weights: [] }),

  saveKitten: (index, data) => {
    const collar = COLLARS[index % COLLARS.length];
    const existing = get().kittens[index];
    const id = existing?.id ?? uid('k');
    const blank: Kitten = { id, name: null, tempId: '', tempColor: '', sex: 'unknown', coat: '', photo: null, birthTime: null, birthWeight: null, tagline: null };
    const kitten: Kitten = { ...blank, ...existing, ...data, id, tempId: collar.tempId, tempColor: collar.color };
    set((s) => {
      const kittens = [...s.kittens];
      kittens[index] = kitten;
      const date = s.birth?.date ?? s.today;
      const weights = kitten.birthWeight
        ? [...s.weights.filter((w) => !(w.kittenId === id && w.date === date)), { id: uid('w'), kittenId: id, date, grams: kitten.birthWeight }]
        : s.weights;
      return { kittens, weights };
    });
    return id;
  },

  finishBirth: () =>
    set((s) => ({ phase: 'newborn', tasks: tasksFor('newborn', s.mother) })),

  nameKitten: (id, name) => set((s) => ({ kittens: s.kittens.map((k) => (k.id === id ? { ...k, name } : k)) })),

  updateKitten: (id, patch) =>
    set((s) => {
      const kittens = s.kittens.map((k) => (k.id === id ? { ...k, ...patch } : k));
      if (!('birthWeight' in patch) || !s.birth) return { kittens };
      const date = s.birth.date;
      const others = s.weights.filter((w) => !(w.kittenId === id && w.date === date));
      return { kittens, weights: patch.birthWeight ? [...others, { id: uid('w'), kittenId: id, date, grams: patch.birthWeight }] : others };
    }),

  addWeight: (kittenId, grams, date) =>
    set((s) => {
      const d = date ?? s.today;
      return { weights: [...s.weights.filter((w) => !(w.kittenId === kittenId && w.date === d)), { id: uid('w'), kittenId, date: d, grams }] };
    }),

  addMoment: ({ date, ...m }) => set((s) => ({ moments: [{ id: uid('m'), date: date ?? s.today, ...m }, ...s.moments] })),

  addCheckin: ({ date, ...c }) => set((s) => ({ checkins: [...s.checkins, { id: uid('c'), date: date ?? s.today, ...c }] })),

  toggleTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),

  completeTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: true } : t)) })),
}));

// ---------------------------------------------------------------------------
// Selectors / helpers (pure — pass state in, or use inside useStore(selector)).
// ---------------------------------------------------------------------------

/** "Pip", or the collar ID ("Orange") until named. */
export const displayName = (k: Pick<Kitten, 'name' | 'tempId'>) => k.name ?? k.tempId;

export const pronoun = (k: Pick<Kitten, 'sex'>) => (k.sex === 'boy' ? 'his' : k.sex === 'girl' ? 'her' : 'their');

export function weightsFor(weights: Weight[], kittenId: string): Weight[] {
  return weights.filter((w) => w.kittenId === kittenId).sort((a, b) => a.date.localeCompare(b.date));
}

export function latestWeight(weights: Weight[], kittenId: string): Weight | null {
  const ws = weightsFor(weights, kittenId);
  return ws[ws.length - 1] ?? null;
}

/** Weight on or before `date` (excluding `date` itself when `before` is true). */
export function weightBefore(weights: Weight[], kittenId: string, date: string): Weight | null {
  const ws = weightsFor(weights, kittenId).filter((w) => w.date < date);
  return ws[ws.length - 1] ?? null;
}

export function weighedOn(weights: Weight[], kittenId: string, date: string): Weight | null {
  return weights.find((w) => w.kittenId === kittenId && w.date === date) ?? null;
}

export function momentsFor(moments: Moment[], subjectId: SubjectId): Moment[] {
  return moments.filter((m) => m.subjectId === subjectId).sort((a, b) => b.date.localeCompare(a.date));
}

export function firstsFor(moments: Moment[], subjectId: SubjectId): Moment[] {
  return moments.filter((m) => m.subjectId === subjectId && m.first).sort((a, b) => a.date.localeCompare(b.date));
}
