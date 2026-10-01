import { convexTest } from 'convex-test';
import type { FunctionArgs } from 'convex/server';
import { ConvexError } from 'convex/values';
import { describe, expect, test } from 'vitest';

import { api } from './_generated/api';
import type { Id, TableNames } from './_generated/dataModel';
import schema from './schema';

type PushArgs = FunctionArgs<typeof api.family.push>;

const ISSUER = 'https://better-mammal-3448.clerk.accounts.dev';
const ANA = { tokenIdentifier: `${ISSUER}|user_ana`, subject: 'user_ana', issuer: ISSUER };
const BEN = { tokenIdentifier: `${ISSUER}|user_ben`, subject: 'user_ben', issuer: ISSUER };

function setup() {
  const t = convexTest(schema);
  return { t, ana: t.withIdentity(ANA), ben: t.withIdentity(BEN) };
}

type T = ReturnType<typeof setup>['t'];

const count = (t: T, table: TableNames) => t.run(async (ctx) => (await ctx.db.query(table).collect()).length);
const counts = async (t: T) => {
  const out: Record<string, number> = {};
  for (const table of ['families', 'kittens', 'weights', 'moments', 'checkins', 'tasks'] as const) out[table] = await count(t, table);
  return out;
};
const storeBlob = (t: T, text: string) => t.run((ctx) => ctx.storage.store(new Blob([text])));

const kitten = (id: string, order = 0, patch: Partial<Record<string, unknown>> = {}) => ({
  id,
  name: 'Pip',
  tempId: 'Blue',
  tempColor: '#7FA7F5',
  sex: 'boy' as const,
  coat: 'Grey tabby',
  photo: { key: 'pip' } as { key: string } | { storageId: Id<'_storage'> } | null,
  birthTime: '05:42',
  birthWeight: 102,
  tagline: null,
  order,
  ...patch,
});
const weight = (id: string, kittenId: string, date: string, grams: number) => ({ id, kittenId, date, grams });
const moment = (id: string, text = 'Eyes open') => ({
  id,
  subjectId: 'k-1',
  date: '2026-10-10',
  text,
  photo: null,
  first: 'Eyes open',
  kind: 'moment' as const,
});
const checkin = (id: string) => ({
  id,
  subjectId: 'mother',
  date: '2026-09-13',
  appetite: 'hungry' as const,
  mood: ['Cuddly', 'Sleepy'],
  note: 'Ate her breakfast and then half of mine.',
  photo: { key: 'juniperWk5' },
});
const task = (id: string, order = 0) => ({
  id,
  title: 'Daily weigh-in',
  subtitle: 'Same time each day',
  photo: null,
  icon: 'scale' as const,
  done: false,
  action: 'weigh-in' as const,
  order,
});
const mother = {
  name: 'Juniper',
  photo: { key: 'juniper' } as { key: string } | { storageId: Id<'_storage'> } | null,
  age: '2 years',
  matingDate: '2026-08-01',
  dueDate: '2026-10-05',
  firstLitter: true,
  vet: 'Riverside Vets',
};

const EMPTY_FAMILY = {
  phase: 'new',
  owner: { name: '', child: null },
  mother: null,
  birth: null,
  homes: [],
  kittens: [],
  weights: [],
  moments: [],
  checkins: [],
  tasks: [],
};

/** `expect(...).rejects` matcher for a `ConvexError` carrying `{ code }`. */
const convexError = (code: string) =>
  expect.objectContaining({ data: expect.objectContaining({ code }) }) as unknown as ConvexError<{ code: string }>;

describe('auth', () => {
  test('unauthenticated snapshot returns null', async () => {
    const { t } = setup();
    expect(await t.query(api.family.snapshot, {})).toBeNull();
  });

  test('unauthenticated mutations are rejected and write nothing', async () => {
    const { t } = setup();
    await expect(t.mutation(api.family.push, { upsert: { kittens: [kitten('k-1')] } })).rejects.toThrow(convexError('unauthenticated'));
    await expect(t.mutation(api.family.generateUploadUrl, {})).rejects.toThrow(convexError('unauthenticated'));
    await expect(t.mutation(api.family.deleteAll, {})).rejects.toThrow(convexError('unauthenticated'));
    expect(await counts(t)).toEqual({ families: 0, kittens: 0, weights: 0, moments: 0, checkins: 0, tasks: 0 });
  });

  test('signed-in user without a family gets null', async () => {
    const { ana } = setup();
    expect(await ana.query(api.family.snapshot, {})).toBeNull();
  });

  test('generateUploadUrl returns a URL', async () => {
    const { ana } = setup();
    expect(await ana.mutation(api.family.generateUploadUrl, {})).toMatch(/^https:\/\//);
  });
});

describe('push', () => {
  test('first push creates an empty family', async () => {
    const { t, ana } = setup();
    expect(await ana.mutation(api.family.push, {})).toBeNull();
    expect(await ana.query(api.family.snapshot, {})).toEqual(EMPTY_FAMILY);
    expect(await count(t, 'families')).toBe(1);
  });

  test('family fields patch independently and mother photo round-trips', async () => {
    const { ana } = setup();
    await ana.mutation(api.family.push, { family: { phase: 'expecting', owner: { name: 'Ana', child: 'Maya' }, mother } });
    await ana.mutation(api.family.push, { family: { birth: { date: '2026-10-05', count: 4 }, homes: [{ kittenId: 'k-1', names: 'Sam & Rosa', movingDay: '2026-12-20' }] } });
    const snap = await ana.query(api.family.snapshot, {});
    expect(snap).toMatchObject({
      phase: 'expecting',
      owner: { name: 'Ana', child: 'Maya' },
      birth: { date: '2026-10-05', count: 4 },
      homes: [{ kittenId: 'k-1', names: 'Sam & Rosa', movingDay: '2026-12-20' }],
      mother: { name: 'Juniper', photo: 'juniper', photoId: null, age: '2 years', matingDate: '2026-08-01', dueDate: '2026-10-05', firstLitter: true, vet: 'Riverside Vets' },
    });

    await ana.mutation(api.family.push, { family: { mother: null, birth: null } });
    expect(await ana.query(api.family.snapshot, {})).toMatchObject({ phase: 'expecting', mother: null, birth: null });
  });

  test('upsert is idempotent', async () => {
    const { t, ana } = setup();
    const upsert = {
      kittens: [kitten('k-1', 0), kitten('k-2', 1)],
      weights: [weight('w-1', 'k-1', '2026-10-05', 102)],
      moments: [moment('m-1')],
      checkins: [checkin('c-1')],
      tasks: [task('t-1')],
    };
    await ana.mutation(api.family.push, { upsert });
    const first = await ana.query(api.family.snapshot, {});
    await ana.mutation(api.family.push, { upsert });
    expect(await ana.query(api.family.snapshot, {})).toEqual(first);
    expect(await counts(t)).toEqual({ families: 1, kittens: 2, weights: 1, moments: 1, checkins: 1, tasks: 1 });
  });

  test('upserting an existing key updates it in place', async () => {
    const { t, ana } = setup();
    await ana.mutation(api.family.push, { upsert: { kittens: [kitten('k-1')] } });
    await ana.mutation(api.family.push, { upsert: { kittens: [kitten('k-1', 0, { name: 'Biscuit', photo: null })] } });
    const snap = await ana.query(api.family.snapshot, {});
    expect(snap?.kittens).toEqual([expect.objectContaining({ id: 'k-1', name: 'Biscuit', photo: null, photoId: null })]);
    expect(await count(t, 'kittens')).toBe(1);
  });

  test('a weight for the same kitten and date replaces the previous one', async () => {
    const { t, ana } = setup();
    await ana.mutation(api.family.push, { upsert: { weights: [weight('w-1', 'k-1', '2026-10-05', 100), weight('w-other', 'k-2', '2026-10-05', 90)] } });
    await ana.mutation(api.family.push, { upsert: { weights: [weight('w-2', 'k-1', '2026-10-05', 105)] } });
    const snap = await ana.query(api.family.snapshot, {});
    expect(snap?.weights).toEqual(expect.arrayContaining([weight('w-2', 'k-1', '2026-10-05', 105), weight('w-other', 'k-2', '2026-10-05', 90)]));
    expect(snap?.weights).toHaveLength(2);
    expect(await count(t, 'weights')).toBe(2);

    // Same key, new grams: still one row for the day.
    await ana.mutation(api.family.push, { upsert: { weights: [weight('w-2', 'k-1', '2026-10-05', 110)] } });
    expect((await ana.query(api.family.snapshot, {}))?.weights.find((w) => w.kittenId === 'k-1')).toEqual(weight('w-2', 'k-1', '2026-10-05', 110));
    expect(await count(t, 'weights')).toBe(2);
  });

  test('remove deletes rows and ignores unknown keys', async () => {
    const { t, ana } = setup();
    await ana.mutation(api.family.push, {
      upsert: { kittens: [kitten('k-1'), kitten('k-2', 1)], weights: [weight('w-1', 'k-1', '2026-10-05', 102)], moments: [moment('m-1')], checkins: [checkin('c-1')], tasks: [task('t-1')] },
    });
    await ana.mutation(api.family.push, { remove: { kittens: ['k-1', 'k-nope'], weights: ['w-1'], moments: ['m-1'], checkins: ['c-1'], tasks: ['t-1'] } });
    const snap = await ana.query(api.family.snapshot, {});
    expect(snap?.kittens.map((k) => k.id)).toEqual(['k-2']);
    expect(snap?.weights).toEqual([]);
    expect(snap?.moments).toEqual([]);
    expect(snap?.checkins).toEqual([]);
    expect(snap?.tasks).toEqual([]);
    expect(await counts(t)).toEqual({ families: 1, kittens: 1, weights: 0, moments: 0, checkins: 0, tasks: 0 });
  });

  test('remove runs before upsert, so a row in both ends up present', async () => {
    const { ana } = setup();
    await ana.mutation(api.family.push, { upsert: { tasks: [task('t-1')] } });
    await ana.mutation(api.family.push, { remove: { tasks: ['t-1'] }, upsert: { tasks: [{ ...task('t-1'), done: true }] } });
    expect((await ana.query(api.family.snapshot, {}))?.tasks).toEqual([expect.objectContaining({ id: 't-1', done: true })]);
  });

  describe('invalid input throws and writes nothing', () => {
    const cases: Array<[string, PushArgs]> = [
      ['bad date', { upsert: { weights: [weight('w-1', 'k-1', '2026-13-45', 100)] } }],
      ['date with wrong format', { upsert: { moments: [{ ...moment('m-1'), date: '10/10/2026' }] } }],
      ['unreal date', { upsert: { checkins: [{ ...checkin('c-1'), date: '2026-02-30' }] } }],
      ['grams 0', { upsert: { weights: [weight('w-1', 'k-1', '2026-10-05', 0)] } }],
      ['grams fractional', { upsert: { weights: [weight('w-1', 'k-1', '2026-10-05', 100.5)] } }],
      ['grams too large', { upsert: { weights: [weight('w-1', 'k-1', '2026-10-05', 20001)] } }],
      ['bad birth time', { upsert: { kittens: [kitten('k-1', 0, { birthTime: '25:99' })] } }],
      ['birth count 0', { family: { birth: { date: '2026-10-05', count: 0 } } }],
      ['birth count 21', { family: { birth: { date: '2026-10-05', count: 21 } } }],
      ['bad mother date', { family: { mother: { ...mother, dueDate: 'soon' } } }],
      ['name too long', { family: { owner: { name: 'a'.repeat(81), child: null } } }],
      ['text too long', { upsert: { moments: [moment('m-1', 'x'.repeat(2001))] } }],
      ['too many rows', { upsert: { weights: Array.from({ length: 501 }, (_, i) => weight(`w-${i}`, 'k-1', '2026-10-05', 100)) } }],
    ];

    for (const [label, args] of cases) {
      test(label, async () => {
        const { t, ana } = setup();
        await expect(ana.mutation(api.family.push, args)).rejects.toThrow(convexError('invalid'));
        expect(await counts(t)).toEqual({ families: 0, kittens: 0, weights: 0, moments: 0, checkins: 0, tasks: 0 });
      });
    }

    test('bad enum', async () => {
      const { t, ana } = setup();
      const badSex = { upsert: { kittens: [kitten('k-1', 0, { sex: 'cat' })] } } as unknown as PushArgs;
      const badPhase = { family: { phase: 'done' } } as unknown as PushArgs;
      await expect(ana.mutation(api.family.push, badSex)).rejects.toThrow();
      await expect(ana.mutation(api.family.push, badPhase)).rejects.toThrow();
      expect(await counts(t)).toEqual({ families: 0, kittens: 0, weights: 0, moments: 0, checkins: 0, tasks: 0 });
    });

    test('an invalid row in a mixed push leaves earlier valid data untouched', async () => {
      const { t, ana } = setup();
      await ana.mutation(api.family.push, { upsert: { kittens: [kitten('k-1')] } });
      await expect(
        ana.mutation(api.family.push, { upsert: { kittens: [kitten('k-1', 0, { name: 'Changed' })], weights: [weight('w-1', 'k-1', '2026-10-05', 0)] } }),
      ).rejects.toThrow(convexError('invalid'));
      expect((await ana.query(api.family.snapshot, {}))?.kittens[0]?.name).toBe('Pip');
      expect(await counts(t)).toEqual({ families: 1, kittens: 1, weights: 0, moments: 0, checkins: 0, tasks: 0 });
    });
  });
});

describe('isolation', () => {
  test("user A's data is invisible to user B and B cannot change it with the same keys", async () => {
    const { t, ana, ben } = setup();
    await ana.mutation(api.family.push, { family: { phase: 'newborn' }, upsert: { kittens: [kitten('k-1')], weights: [weight('w-1', 'k-1', '2026-10-05', 102)] } });

    expect(await ben.query(api.family.snapshot, {})).toBeNull();
    await ben.mutation(api.family.push, {});
    expect(await ben.query(api.family.snapshot, {})).toEqual(EMPTY_FAMILY);

    await ben.mutation(api.family.push, { upsert: { kittens: [kitten('k-1', 0, { name: 'Intruder' })], weights: [weight('w-1', 'k-1', '2026-10-05', 1)] } });
    await ben.mutation(api.family.push, { remove: { kittens: ['k-1'], weights: ['w-1'] } });
    await ben.mutation(api.family.deleteAll, {});

    const anas = await ana.query(api.family.snapshot, {});
    expect(anas?.phase).toBe('newborn');
    expect(anas?.kittens).toEqual([expect.objectContaining({ id: 'k-1', name: 'Pip' })]);
    expect(anas?.weights).toEqual([weight('w-1', 'k-1', '2026-10-05', 102)]);
    expect(await counts(t)).toEqual({ families: 1, kittens: 1, weights: 1, moments: 0, checkins: 0, tasks: 0 });
  });
});

describe('photos', () => {
  test('{ key } round-trips as the key', async () => {
    const { ana } = setup();
    await ana.mutation(api.family.push, { upsert: { kittens: [kitten('k-1')], checkins: [checkin('c-1')] } });
    const snap = await ana.query(api.family.snapshot, {});
    expect(snap?.kittens[0]).toMatchObject({ photo: 'pip', photoId: null });
    expect(snap?.checkins[0]).toMatchObject({ photo: 'juniperWk5', photoId: null });
  });

  test('{ storageId } resolves to a URL and keeps the id', async () => {
    const { t, ana } = setup();
    const storageId = await storeBlob(t, 'kitten bytes');
    await ana.mutation(api.family.push, {
      family: { mother: { ...mother, photo: { storageId } } },
      upsert: { kittens: [kitten('k-1', 0, { photo: { storageId } })], moments: [{ ...moment('m-1'), photo: { storageId } }], tasks: [{ ...task('t-1'), photo: { storageId } }] },
    });
    const snap = await ana.query(api.family.snapshot, {});
    for (const row of [snap?.mother, snap?.kittens[0], snap?.moments[0], snap?.tasks[0]]) {
      expect(row?.photoId).toBe(storageId);
      expect(row?.photo).toMatch(/^https:\/\/.+\/api\/storage\//);
    }
  });

  test('null clears a previous photo', async () => {
    const { t, ana } = setup();
    const storageId = await storeBlob(t, 'kitten bytes');
    await ana.mutation(api.family.push, { upsert: { kittens: [kitten('k-1', 0, { photo: { storageId } })] } });
    await ana.mutation(api.family.push, { upsert: { kittens: [kitten('k-1', 0, { photo: null })] } });
    expect((await ana.query(api.family.snapshot, {}))?.kittens[0]).toMatchObject({ photo: null, photoId: null });
    const doc = await t.run((ctx) => ctx.db.query('kittens').first());
    expect(doc).not.toHaveProperty('photoId');
    expect(doc).not.toHaveProperty('photoKey');
  });
});

describe('snapshot ordering', () => {
  test('kittens and tasks by order, moments newest first, checkins oldest first', async () => {
    const { ana } = setup();
    await ana.mutation(api.family.push, { upsert: { kittens: [kitten('k-c', 2), kitten('k-a', 0), kitten('k-b', 1)], tasks: [task('t-b', 1), task('t-a', 0)] } });
    await ana.mutation(api.family.push, { upsert: { moments: [moment('m-1')], checkins: [checkin('c-1')] } });
    await ana.mutation(api.family.push, { upsert: { moments: [moment('m-2')], checkins: [checkin('c-2')] } });
    await ana.mutation(api.family.push, { upsert: { moments: [moment('m-3')], checkins: [checkin('c-3')] } });
    // Re-saving m-1 keeps its original creation time, so it stays the oldest.
    await ana.mutation(api.family.push, { upsert: { moments: [moment('m-1', 'Edited')] } });

    const snap = await ana.query(api.family.snapshot, {});
    expect(snap?.kittens.map((k) => k.id)).toEqual(['k-a', 'k-b', 'k-c']);
    expect(snap?.tasks.map((t) => t.id)).toEqual(['t-a', 't-b']);
    expect(snap?.moments.map((m) => m.id)).toEqual(['m-3', 'm-2', 'm-1']);
    expect(snap?.checkins.map((c) => c.id)).toEqual(['c-1', 'c-2', 'c-3']);
  });

  test('snapshot rows carry no order or internal fields', async () => {
    const { ana } = setup();
    await ana.mutation(api.family.push, { upsert: { kittens: [kitten('k-1')], tasks: [task('t-1')] } });
    const snap = await ana.query(api.family.snapshot, {});
    expect(snap?.kittens[0]).toEqual({
      id: 'k-1',
      name: 'Pip',
      tempId: 'Blue',
      tempColor: '#7FA7F5',
      sex: 'boy',
      coat: 'Grey tabby',
      photo: 'pip',
      photoId: null,
      birthTime: '05:42',
      birthWeight: 102,
      tagline: null,
    });
    expect(snap?.tasks[0]).toEqual({ id: 't-1', title: 'Daily weigh-in', subtitle: 'Same time each day', photo: null, photoId: null, icon: 'scale', done: false, action: 'weigh-in' });
  });
});

describe('deleteAll', () => {
  test('removes the family, every row and every storage file', async () => {
    const { t, ana, ben } = setup();
    const motherPhoto = await storeBlob(t, 'mother');
    const kittenPhoto = await storeBlob(t, 'kitten');
    const bensPhoto = await storeBlob(t, 'ben');
    await ana.mutation(api.family.push, {
      family: { phase: 'growing', mother: { ...mother, photo: { storageId: motherPhoto } } },
      upsert: {
        kittens: [kitten('k-1', 0, { photo: { storageId: kittenPhoto } })],
        weights: [weight('w-1', 'k-1', '2026-10-05', 102)],
        moments: [moment('m-1')],
        checkins: [checkin('c-1')],
        tasks: [task('t-1')],
      },
    });
    await ben.mutation(api.family.push, { upsert: { kittens: [kitten('k-1', 0, { photo: { storageId: bensPhoto } })] } });

    expect(await ana.mutation(api.family.deleteAll, {})).toBeNull();

    expect(await ana.query(api.family.snapshot, {})).toBeNull();
    expect(await counts(t)).toEqual({ families: 1, kittens: 1, weights: 0, moments: 0, checkins: 0, tasks: 0 });
    expect(await t.run((ctx) => ctx.db.system.get(motherPhoto))).toBeNull();
    expect(await t.run((ctx) => ctx.db.system.get(kittenPhoto))).toBeNull();
    expect(await t.run((ctx) => ctx.db.system.get(bensPhoto))).not.toBeNull();
    expect((await ben.query(api.family.snapshot, {}))?.kittens).toHaveLength(1);
  });

  test('is a no-op for a user without a family', async () => {
    const { ana } = setup();
    expect(await ana.mutation(api.family.deleteAll, {})).toBeNull();
  });
});
