import type { WithoutSystemFields } from 'convex/server';
import { ConvexError, v, type Infer, type Validator } from 'convex/values';

import type { Doc, Id, TableNames } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { appetite, momentKind, phase, sex, taskAction, taskIcon } from './validators';

// ---------------------------------------------------------------------------
// Validators — the wire shapes shared with `src/data/sync.ts` (see docs/backend.md).
// ---------------------------------------------------------------------------

const nullable = <T extends Validator<any, 'required', any>>(inner: T) => v.union(inner, v.null());

/** How the client sends a photo: a bundled asset key, an uploaded file, or none. */
export const photoArg = v.union(v.null(), v.object({ key: v.string() }), v.object({ storageId: v.id('_storage') }));
export type PhotoArg = Infer<typeof photoArg>;

export const ownerArg = v.object({ name: v.string(), child: nullable(v.string()) });
export const birthArg = v.object({ date: v.string(), count: v.number() });
export const homeArg = v.object({ kittenId: v.string(), names: v.string(), movingDay: v.string() });

const motherFields = {
  name: v.string(),
  age: nullable(v.string()),
  matingDate: nullable(v.string()),
  dueDate: nullable(v.string()),
  firstLitter: nullable(v.boolean()),
  vet: nullable(v.string()),
};
export const motherArg = v.object({ ...motherFields, photo: photoArg });

const kittenFields = {
  id: v.string(),
  name: nullable(v.string()),
  tempId: v.string(),
  tempColor: v.string(),
  sex,
  coat: v.string(),
  birthTime: nullable(v.string()),
  birthWeight: nullable(v.number()),
  tagline: nullable(v.string()),
};
export const kittenArg = v.object({ ...kittenFields, photo: photoArg, order: v.number() });

export const weightArg = v.object({ id: v.string(), kittenId: v.string(), date: v.string(), grams: v.number() });

const momentFields = { id: v.string(), subjectId: v.string(), date: v.string(), text: v.string(), first: nullable(v.string()), kind: momentKind };
export const momentArg = v.object({ ...momentFields, photo: photoArg });

const checkinFields = {
  id: v.string(),
  subjectId: v.string(),
  date: v.string(),
  appetite: nullable(appetite),
  mood: v.array(v.string()),
  note: nullable(v.string()),
};
export const checkinArg = v.object({ ...checkinFields, photo: photoArg });

const taskFields = { id: v.string(), title: v.string(), subtitle: v.string(), icon: taskIcon, done: v.boolean(), action: taskAction };
export const taskArg = v.object({ ...taskFields, photo: photoArg, order: v.number() });

export const familyArg = v.object({
  phase: v.optional(phase),
  owner: v.optional(ownerArg),
  birth: v.optional(nullable(birthArg)),
  homes: v.optional(v.array(homeArg)),
  mother: v.optional(nullable(motherArg)),
});

export const upsertArg = v.object({
  kittens: v.optional(v.array(kittenArg)),
  weights: v.optional(v.array(weightArg)),
  moments: v.optional(v.array(momentArg)),
  checkins: v.optional(v.array(checkinArg)),
  tasks: v.optional(v.array(taskArg)),
});

const keys = v.optional(v.array(v.string()));
export const removeArg = v.object({ kittens: keys, weights: keys, moments: keys, checkins: keys, tasks: keys });

export const pushArgs = { family: v.optional(familyArg), upsert: v.optional(upsertArg), remove: v.optional(removeArg) };
export type PushArgs = { family?: Infer<typeof familyArg>; upsert?: Infer<typeof upsertArg>; remove?: Infer<typeof removeArg> };

/** Snapshot rows carry the resolved `photo` (URL or asset key) plus the raw `photoId`. */
const photoOut = { photo: nullable(v.string()), photoId: nullable(v.id('_storage')) };

export const snapshotValidator = v.object({
  phase,
  owner: ownerArg,
  birth: nullable(birthArg),
  homes: v.array(homeArg),
  mother: nullable(v.object({ ...motherFields, ...photoOut })),
  kittens: v.array(v.object({ ...kittenFields, ...photoOut })),
  weights: v.array(weightArg),
  moments: v.array(v.object({ ...momentFields, ...photoOut })),
  checkins: v.array(v.object({ ...checkinFields, ...photoOut })),
  tasks: v.array(v.object({ ...taskFields, ...photoOut })),
});
export type Snapshot = Infer<typeof snapshotValidator>;

// ---------------------------------------------------------------------------
// Auth and family lookup
// ---------------------------------------------------------------------------

/** The caller's identity, or `ConvexError({ code: 'unauthenticated' })`. */
export async function requireIdentity(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ code: 'unauthenticated' });
  return identity;
}

/** The family owned by `ownerId` (a Clerk `tokenIdentifier`), if any. */
export function familyOf(ctx: QueryCtx, ownerId: string) {
  return ctx.db
    .query('families')
    .withIndex('by_owner', (q) => q.eq('ownerId', ownerId))
    .unique();
}

/** The caller's family, created empty on first use. */
export async function ensureFamily(ctx: MutationCtx, ownerId: string): Promise<Doc<'families'>> {
  const existing = await familyOf(ctx, ownerId);
  if (existing) return existing;
  const id = await ctx.db.insert('families', {
    ownerId,
    phase: 'new',
    owner: { name: '', child: null },
    mother: null,
    birth: null,
    homes: [],
  });
  return (await ctx.db.get(id))!;
}

// ---------------------------------------------------------------------------
// Rows owned by a family
// ---------------------------------------------------------------------------

export type OwnedTable = Exclude<TableNames, 'families'>;
export const OWNED_TABLES = ['kittens', 'weights', 'moments', 'checkins', 'tasks'] as const satisfies readonly OwnedTable[];

/**
 * Convex cannot type a query over a table-name type parameter, so owned-table helpers type the query as
 * `kittens` — every owned table shares `familyId`, `key` and the `by_family_key` index — and cast the result.
 */
const ownedQuery = (ctx: QueryCtx, table: OwnedTable) => ctx.db.query(table as 'kittens');

/** Every row of `table` in the family. Bounded by the per-push row limit, so a collect is fine. */
export function familyRows<T extends OwnedTable>(ctx: QueryCtx, table: T, familyId: Id<'families'>): Promise<Doc<T>[]> {
  return ownedQuery(ctx, table)
    .withIndex('by_family_key', (q) => q.eq('familyId', familyId))
    .collect() as Promise<unknown> as Promise<Doc<T>[]>;
}

/** The family's row with client key `key`, if any. */
export function rowByKey<T extends OwnedTable>(ctx: QueryCtx, table: T, familyId: Id<'families'>, key: string): Promise<Doc<T> | null> {
  return ownedQuery(ctx, table)
    .withIndex('by_family_key', (q) => q.eq('familyId', familyId).eq('key', key))
    .unique() as Promise<unknown> as Promise<Doc<T> | null>;
}

/** Fields of an owned row that the client controls: everything but the system fields, `familyId` and `key`. */
export type OwnedFields<T extends OwnedTable> = Omit<WithoutSystemFields<Doc<T>>, 'familyId' | 'key'>;

/** Insert or replace the family's row with client key `key`. Same typing caveat as `ownedQuery`. */
export async function putRow<T extends OwnedTable>(ctx: MutationCtx, table: T, familyId: Id<'families'>, key: string, fields: OwnedFields<T>) {
  const doc = { ...fields, familyId, key } as unknown as WithoutSystemFields<Doc<'kittens'>>;
  const existing = await rowByKey(ctx, table, familyId, key);
  if (existing) await ctx.db.replace(existing._id as Id<'kittens'>, doc);
  else await ctx.db.insert(table as 'kittens', doc);
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export type StoredPhoto = { photoKey?: string; photoId?: Id<'_storage'> };

/** Stored form of a photo argument. `null` yields no fields, which clears both on replace. */
export function storedPhoto(photo: PhotoArg): StoredPhoto {
  if (photo === null) return {};
  return 'key' in photo ? { photoKey: photo.key } : { photoId: photo.storageId };
}

/** Snapshot form: the storage URL when uploaded, else the asset key, else null. */
export async function resolvePhoto(ctx: QueryCtx, doc: StoredPhoto): Promise<{ photo: string | null; photoId: Id<'_storage'> | null }> {
  const photoId = doc.photoId ?? null;
  const photo = photoId ? await ctx.storage.getUrl(photoId) : (doc.photoKey ?? null);
  return { photo, photoId };
}

// ---------------------------------------------------------------------------
// Input validation beyond what the validators enforce
// ---------------------------------------------------------------------------

export const MAX_ROWS = 500;
const MAX_TEXT = 2000;
const MAX_NAME = 80;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const invalid = (message: string) => new ConvexError({ code: 'invalid', message });

function text(value: string | null | undefined, field: string, max = MAX_TEXT) {
  if (value != null && value.length > max) throw invalid(`${field} is longer than ${max} characters`);
}

function name(value: string | null | undefined, field: string) {
  text(value, field, MAX_NAME);
}

function date(value: string | null | undefined, field: string) {
  if (value == null) return;
  if (!DATE.test(value)) throw invalid(`${field} must be YYYY-MM-DD`);
  const [y, m, d] = value.split('-').map(Number);
  const real = new Date(Date.UTC(y, m - 1, d));
  if (real.getUTCFullYear() !== y || real.getUTCMonth() !== m - 1 || real.getUTCDate() !== d) throw invalid(`${field} is not a real date`);
}

function time(value: string | null | undefined, field: string) {
  if (value != null && !TIME.test(value)) throw invalid(`${field} must be HH:MM`);
}

function int(value: number | null | undefined, field: string, min: number, max: number) {
  if (value == null) return;
  if (!Number.isInteger(value) || value < min || value > max) throw invalid(`${field} must be an integer from ${min} to ${max}`);
}

function photo(value: PhotoArg, field: string) {
  if (value && 'key' in value) text(value.key, `${field}.key`);
}

/** Throws `ConvexError({ code: 'invalid' })` for anything the validators let through but the contract forbids. */
export function validatePush({ family, upsert, remove }: PushArgs) {
  const rows =
    Object.values(upsert ?? {}).reduce((n, list) => n + (list?.length ?? 0), 0) +
    Object.values(remove ?? {}).reduce((n, list) => n + (list?.length ?? 0), 0);
  if (rows > MAX_ROWS) throw invalid(`At most ${MAX_ROWS} rows per push`);

  if (family) {
    name(family.owner?.name, 'owner.name');
    name(family.owner?.child, 'owner.child');
    if (family.mother) {
      const m = family.mother;
      name(m.name, 'mother.name');
      text(m.age, 'mother.age');
      date(m.matingDate, 'mother.matingDate');
      date(m.dueDate, 'mother.dueDate');
      text(m.vet, 'mother.vet');
      photo(m.photo, 'mother.photo');
    }
    if (family.birth) {
      date(family.birth.date, 'birth.date');
      int(family.birth.count, 'birth.count', 1, 20);
    }
    for (const h of family.homes ?? []) {
      text(h.kittenId, 'homes.kittenId');
      name(h.names, 'homes.names');
      date(h.movingDay, 'homes.movingDay');
    }
  }

  for (const k of upsert?.kittens ?? []) {
    text(k.id, 'kittens.id');
    name(k.name, 'kittens.name');
    text(k.tempId, 'kittens.tempId');
    text(k.tempColor, 'kittens.tempColor');
    text(k.coat, 'kittens.coat');
    time(k.birthTime, 'kittens.birthTime');
    int(k.birthWeight, 'kittens.birthWeight', 1, 20000);
    text(k.tagline, 'kittens.tagline');
    photo(k.photo, 'kittens.photo');
    if (!Number.isFinite(k.order)) throw invalid('kittens.order must be a number');
  }
  for (const w of upsert?.weights ?? []) {
    text(w.id, 'weights.id');
    text(w.kittenId, 'weights.kittenId');
    date(w.date, 'weights.date');
    int(w.grams, 'weights.grams', 1, 20000);
  }
  for (const m of upsert?.moments ?? []) {
    text(m.id, 'moments.id');
    text(m.subjectId, 'moments.subjectId');
    date(m.date, 'moments.date');
    text(m.text, 'moments.text');
    text(m.first, 'moments.first');
    photo(m.photo, 'moments.photo');
  }
  for (const c of upsert?.checkins ?? []) {
    text(c.id, 'checkins.id');
    text(c.subjectId, 'checkins.subjectId');
    date(c.date, 'checkins.date');
    c.mood.forEach((mood) => text(mood, 'checkins.mood'));
    text(c.note, 'checkins.note');
    photo(c.photo, 'checkins.photo');
  }
  for (const t of upsert?.tasks ?? []) {
    text(t.id, 'tasks.id');
    text(t.title, 'tasks.title');
    text(t.subtitle, 'tasks.subtitle');
    photo(t.photo, 'tasks.photo');
    if (!Number.isFinite(t.order)) throw invalid('tasks.order must be a number');
  }
  for (const list of Object.values(remove ?? {})) list?.forEach((key) => text(key, 'remove'));
}
