import { v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import {
  ensureFamily,
  familyOf,
  familyRows,
  OWNED_TABLES,
  pushArgs,
  putRow,
  requireIdentity,
  resolvePhoto,
  rowByKey,
  snapshotValidator,
  storedPhoto,
  validatePush,
  type PushArgs,
  type Snapshot,
} from './model';

/** The patch for the family doc, touching only the fields the client sent. */
function familyPatch(family: NonNullable<PushArgs['family']>): Partial<Doc<'families'>> {
  const patch: Partial<Doc<'families'>> = {};
  if (family.phase !== undefined) patch.phase = family.phase;
  if (family.owner !== undefined) patch.owner = family.owner;
  if (family.birth !== undefined) patch.birth = family.birth;
  if (family.homes !== undefined) patch.homes = family.homes;
  if (family.mother === null) patch.mother = null;
  else if (family.mother !== undefined) {
    const { photo, ...mother } = family.mother;
    patch.mother = { ...mother, ...storedPhoto(photo) };
  }
  return patch;
}

/** Everything the signed-in user's family has, shaped for `store.hydrate`. Null when signed out or brand new. */
export const snapshot = query({
  args: {},
  returns: v.union(v.null(), snapshotValidator),
  handler: async (ctx): Promise<Snapshot | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const family = await familyOf(ctx, identity.tokenIdentifier);
    if (!family) return null;

    const [kittens, weights, moments, checkins, tasks] = await Promise.all([
      familyRows(ctx, 'kittens', family._id),
      familyRows(ctx, 'weights', family._id),
      familyRows(ctx, 'moments', family._id),
      familyRows(ctx, 'checkins', family._id),
      familyRows(ctx, 'tasks', family._id),
    ]);
    const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;
    const newestFirst = (a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime;
    const oldestFirst = (a: { _creationTime: number }, b: { _creationTime: number }) => a._creationTime - b._creationTime;

    return {
      phase: family.phase,
      owner: family.owner,
      birth: family.birth,
      homes: family.homes,
      mother: family.mother && {
        name: family.mother.name,
        age: family.mother.age,
        matingDate: family.mother.matingDate,
        dueDate: family.mother.dueDate,
        firstLitter: family.mother.firstLitter,
        vet: family.mother.vet,
        ...(await resolvePhoto(ctx, family.mother)),
      },
      kittens: await Promise.all(
        kittens.sort(byOrder).map(async (k) => ({
          id: k.key,
          name: k.name,
          tempId: k.tempId,
          tempColor: k.tempColor,
          sex: k.sex,
          coat: k.coat,
          birthTime: k.birthTime,
          birthWeight: k.birthWeight,
          tagline: k.tagline,
          ...(await resolvePhoto(ctx, k)),
        })),
      ),
      weights: weights.map((w) => ({ id: w.key, kittenId: w.kittenKey, date: w.date, grams: w.grams })),
      moments: await Promise.all(
        moments.sort(newestFirst).map(async (m) => ({
          id: m.key,
          subjectId: m.subjectId,
          date: m.date,
          text: m.text,
          first: m.first,
          kind: m.kind,
          ...(await resolvePhoto(ctx, m)),
        })),
      ),
      checkins: await Promise.all(
        checkins.sort(oldestFirst).map(async (c) => ({
          id: c.key,
          subjectId: c.subjectId,
          date: c.date,
          appetite: c.appetite,
          mood: c.mood,
          note: c.note,
          ...(await resolvePhoto(ctx, c)),
        })),
      ),
      tasks: await Promise.all(
        tasks.sort(byOrder).map(async (t) => ({
          id: t.key,
          title: t.title,
          subtitle: t.subtitle,
          icon: t.icon,
          done: t.done,
          action: t.action,
          ...(await resolvePhoto(ctx, t)),
        })),
      ),
    };
  },
});

/**
 * Write-through from the store: patch family fields, remove rows by key, then upsert rows by key.
 * Creates the family on first call. Idempotent; rejects bad input with `ConvexError({ code: 'invalid' })`.
 */
export const push = mutation({
  args: pushArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    validatePush(args);
    const family = await ensureFamily(ctx, identity.tokenIdentifier);
    const familyId = family._id;

    if (args.family) await ctx.db.patch(familyId, familyPatch(args.family));

    for (const table of OWNED_TABLES) {
      for (const key of args.remove?.[table] ?? []) {
        const row = await rowByKey(ctx, table, familyId, key);
        if (row) await ctx.db.delete(row._id);
      }
    }

    const { kittens = [], weights = [], moments = [], checkins = [], tasks = [] } = args.upsert ?? {};
    for (const { id, photo, ...k } of kittens) await putRow(ctx, 'kittens', familyId, id, { ...k, ...storedPhoto(photo) });
    for (const w of weights) {
      // One weight per kitten per day: a new row for the same day replaces whatever was there.
      const sameDay = await ctx.db
        .query('weights')
        .withIndex('by_family_kitten_date', (q) => q.eq('familyId', familyId).eq('kittenKey', w.kittenId).eq('date', w.date))
        .collect();
      for (const other of sameDay) if (other.key !== w.id) await ctx.db.delete(other._id);
      await putRow(ctx, 'weights', familyId, w.id, { kittenKey: w.kittenId, date: w.date, grams: w.grams });
    }
    for (const { id, photo, ...m } of moments) await putRow(ctx, 'moments', familyId, id, { ...m, ...storedPhoto(photo) });
    for (const { id, photo, ...c } of checkins) await putRow(ctx, 'checkins', familyId, id, { ...c, ...storedPhoto(photo) });
    for (const { id, photo, ...t } of tasks) await putRow(ctx, 'tasks', familyId, id, { ...t, ...storedPhoto(photo) });
    return null;
  },
});

/** A one-shot URL the client POSTs image bytes to; the response carries the `storageId`. */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireIdentity(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Delete the caller's family, every row and every referenced storage file. Run before deleting the Clerk user. */
export const deleteAll = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const family = await familyOf(ctx, identity.tokenIdentifier);
    if (!family) return null;

    const files = new Set<Id<'_storage'>>();
    if (family.mother?.photoId) files.add(family.mother.photoId);
    for (const table of OWNED_TABLES) {
      for (const row of await familyRows(ctx, table, family._id)) {
        if ('photoId' in row && row.photoId) files.add(row.photoId);
        await ctx.db.delete(row._id);
      }
    }
    for (const id of files) if (await ctx.db.system.get(id)) await ctx.storage.delete(id);
    await ctx.db.delete(family._id);
    return null;
  },
});
