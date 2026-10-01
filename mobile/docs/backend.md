# Backend: Convex + Clerk

Kitten Journey keeps its UI state in the zustand store (`src/data/store.ts`). Convex is the durable copy of a
signed-in family's data; Clerk is the identity. The store stays the source the screens read from — Convex is
hydrated into it on sign-in and every store change is written through.

- Dev deployment: `kindly-elk-439` (team `w-hector-us`, project `kitten-journey`).
- Clerk app: "Kitten Journey" (`app_3K4V4YQBrjKdNJDjnqhsCouPW03`), dev Frontend API `better-mammal-3448.clerk.accounts.dev`.
- Env (`mobile/.env.local`, gitignored): `CONVEX_DEPLOYMENT`, `EXPO_PUBLIC_CONVEX_URL`, `EXPO_PUBLIC_CONVEX_SITE_URL`,
  `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. Convex deployment env: `CLERK_JWT_ISSUER_DOMAIN`.
- Demo mode (`state.demo === true`) is local only and is never written to Convex.

## Data model (`convex/schema.ts`)

One `families` doc per user (`ownerId` = Clerk `identity.tokenIdentifier`). Every other row carries `familyId` and
`key` — the client-generated id the store already uses (`k-…`, `w-…`, `m-…`, `c-…`, `t-…`). `(familyId, key)` is
unique, so repeating a save upserts instead of duplicating.

Photos are stored as `photoKey` (a bundled demo/asset key such as `pipOlder`) or `photoId` (`Id<'_storage'>`).
Device-local file URIs are never stored.

| table      | fields (besides `familyId`, `key`) |
| ---------- | ---------------------------------- |
| `families` | `ownerId`, `phase`, `owner {name, child}`, `mother` (null or `{name, photoKey?, photoId?, age, matingDate, dueDate, firstLitter, vet}`), `birth` (null or `{date, count}`), `homes [{kittenId, names, movingDay}]` — no `key`/`familyId` |
| `kittens`  | `name`, `tempId`, `tempColor`, `sex`, `coat`, photo, `birthTime`, `birthWeight`, `tagline`, `order` |
| `weights`  | `kittenKey`, `date`, `grams` — also unique per `(familyId, kittenKey, date)` |
| `moments`  | `subjectId`, `date`, `text`, photo, `first`, `kind` |
| `checkins` | `subjectId`, `date`, `appetite`, `mood[]`, `note`, photo |
| `tasks`    | `title`, `subtitle`, photo, `icon`, `done`, `action`, `order` |

Indexes: `families.by_owner [ownerId]`; every child table `by_family_key [familyId, key]`;
`weights.by_family_kitten_date [familyId, kittenKey, date]`.

## API (`convex/family.ts`)

All functions identify the caller with `ctx.auth.getUserIdentity()` and only ever touch that caller's family.

### `api.family.snapshot` — query, no args

Returns `null` when signed out or the user has no family yet, else:

```ts
{
  phase, owner, birth, homes,
  mother: null | { name, photo: string | null, photoId: Id<'_storage'> | null, age, matingDate, dueDate, firstLitter, vet },
  kittens:  Array<{ id, name, tempId, tempColor, sex, coat, photo, photoId, birthTime, birthWeight, tagline }>, // by order
  weights:  Array<{ id, kittenId, date, grams }>,
  moments:  Array<{ id, subjectId, date, text, photo, photoId, first, kind }>,   // newest first (_creationTime desc)
  checkins: Array<{ id, subjectId, date, appetite, mood, note, photo, photoId }>, // oldest first
  tasks:    Array<{ id, title, subtitle, photo, photoId, icon, done, action }>,   // by order
}
```

`id` is the row's `key`; `kittenId` is `kittenKey`. `photo` is the storage URL (`ctx.storage.getUrl(photoId)`)
when `photoId` is set, else `photoKey`, else `null`. The shapes match the store's `Mother`/`Kitten`/… types plus
`photoId`.

### `api.family.push` — mutation

```ts
type PhotoArg = null | { key: string } | { storageId: Id<'_storage'> };
push({
  family?: { phase?, owner?, birth?, homes?, mother?: null | (Mother minus photo) & { photo: PhotoArg } },
  upsert?: {
    kittens?:  Array<Kitten minus photo & { photo: PhotoArg; order: number }>,
    weights?:  Array<Weight>,                                  // { id, kittenId, date, grams }
    moments?:  Array<Moment minus photo & { photo: PhotoArg }>,
    checkins?: Array<Checkin minus photo & { photo: PhotoArg }>,
    tasks?:    Array<Task minus photo & { photo: PhotoArg; order: number }>,
  },
  remove?: { kittens?: string[]; weights?: string[]; moments?: string[]; checkins?: string[]; tasks?: string[] },
}) => null
```

- Creates the caller's family on first push (`phase 'new'`, `owner {name:'', child:null}`, `mother null`,
  `birth null`, `homes []`).
- Applies `remove` (by key) before `upsert`. Upserts match on `(familyId, key)`. Upserting a weight also deletes
  any other weight with the same `(kittenKey, date)`.
- Idempotent: sending the same push twice leaves the same rows.
- Rejects bad input with `ConvexError({ code: 'invalid', message })` and writes nothing (mutations are
  transactional): dates `YYYY-MM-DD` and real, times `HH:MM`, grams integers 1–20000, birth count 1–20, enums
  for phase/sex/appetite/kind/icon/action, strings ≤ 2000 chars (names ≤ 80), ≤ 500 rows per push.
- Unauthenticated callers get `ConvexError({ code: 'unauthenticated' })`.

### `api.family.generateUploadUrl` — mutation, no args, auth required

Returns an upload URL. The client POSTs the image bytes to it and receives `{ storageId }`.

### `api.family.deleteAll` — mutation, no args, auth required

Deletes the caller's family, every row and every referenced storage file. Called before deleting the Clerk user.

## Client sync (`src/data/sync.ts`)

- On sign-in: one-shot `snapshot` → `store.hydrate(snapshot)` (or a fresh real-family state when `null`).
  Builds a `photo URL → storageId` map from the snapshot so unchanged photos push back as `{ storageId }`.
- After hydration, a `useStore.subscribe` diff turns every store change into a `push`: family fields by
  reference, collections by `id` (changed object → upsert, missing id → remove). Paused while `demo` is true or
  signed out.
- Photos: bundled keys → `{ key }`; known storage URLs → `{ storageId }`; local `file://` URIs are uploaded
  (`generateUploadUrl` + `fetch` POST) once per URI, then `{ storageId }`.
- Pending pushes are queued and retried; a failure is surfaced (never reported as saved).
- Sign-out: clear the store to a fresh state and drop pending queue/photo caches.

## Not in scope yet

- Public story links: Share still sends a note only and the screen says links aren't live.
- Storage files replaced by a newer photo are not garbage-collected (only `deleteAll` removes files).
- No offline cache: a cold launch without network waits for the snapshot.
