import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

import { appetite, momentKind, phase, sex, taskAction, taskIcon } from './validators';

/** A photo is a bundled asset key or an uploaded file. Device-local URIs are never stored. */
const photoFields = { photoKey: v.optional(v.string()), photoId: v.optional(v.id('_storage')) };

/** Every table except `families` belongs to a family and carries the client-generated `key`. */
const owned = { familyId: v.id('families'), key: v.string() };

export default defineSchema({
  families: defineTable({
    ownerId: v.string(),
    phase,
    owner: v.object({ name: v.string(), child: v.union(v.string(), v.null()) }),
    mother: v.union(
      v.null(),
      v.object({
        name: v.string(),
        ...photoFields,
        age: v.union(v.string(), v.null()),
        matingDate: v.union(v.string(), v.null()),
        dueDate: v.union(v.string(), v.null()),
        firstLitter: v.union(v.boolean(), v.null()),
        vet: v.union(v.string(), v.null()),
      }),
    ),
    birth: v.union(v.null(), v.object({ date: v.string(), count: v.number() })),
    homes: v.array(v.object({ kittenId: v.string(), names: v.string(), movingDay: v.string() })),
  }).index('by_owner', ['ownerId']),

  kittens: defineTable({
    ...owned,
    name: v.union(v.string(), v.null()),
    tempId: v.string(),
    tempColor: v.string(),
    sex,
    coat: v.string(),
    ...photoFields,
    birthTime: v.union(v.string(), v.null()),
    birthWeight: v.union(v.number(), v.null()),
    tagline: v.union(v.string(), v.null()),
    order: v.number(),
  }).index('by_family_key', ['familyId', 'key']),

  weights: defineTable({
    ...owned,
    kittenKey: v.string(),
    date: v.string(),
    grams: v.number(),
  })
    .index('by_family_key', ['familyId', 'key'])
    .index('by_family_kitten_date', ['familyId', 'kittenKey', 'date']),

  moments: defineTable({
    ...owned,
    subjectId: v.string(),
    date: v.string(),
    text: v.string(),
    ...photoFields,
    first: v.union(v.string(), v.null()),
    kind: momentKind,
  }).index('by_family_key', ['familyId', 'key']),

  checkins: defineTable({
    ...owned,
    subjectId: v.string(),
    date: v.string(),
    appetite: v.union(appetite, v.null()),
    mood: v.array(v.string()),
    note: v.union(v.string(), v.null()),
    ...photoFields,
  }).index('by_family_key', ['familyId', 'key']),

  tasks: defineTable({
    ...owned,
    title: v.string(),
    subtitle: v.string(),
    ...photoFields,
    icon: taskIcon,
    done: v.boolean(),
    action: taskAction,
    order: v.number(),
  }).index('by_family_key', ['familyId', 'key']),
});
