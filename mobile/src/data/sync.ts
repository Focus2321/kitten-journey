import type { FunctionArgs, FunctionReturnType } from 'convex/server';
import { ConvexError } from 'convex/values';
import { AppState } from 'react-native';
import { create } from 'zustand';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

import { convex } from './convex';
import { photos, type Photo } from './photos';
import { useStore, type Checkin, type Kitten, type Moment, type Snapshot, type State, type Task, type Weight } from './store';

/**
 * Write-through sync between the store and Convex (contract: docs/backend.md).
 *
 * One hydrate per signed-in session, then every store change becomes a `push`. Pushes are coalesced into a single
 * pending diff and sent one at a time; a failed push stays queued and is retried with backoff, on reconnect and when
 * the app returns to the foreground. Demo mode and signed-out use never touch Convex.
 */

type PushArgs = FunctionArgs<typeof api.family.push>;
type WireSnapshot = NonNullable<FunctionReturnType<typeof api.family.snapshot>>;
type StorageId = Id<'_storage'>;
export type PhotoArg = null | { key: string } | { storageId: StorageId };

// ---------------------------------------------------------------------------
// Status (what the banner and the gate read)
// ---------------------------------------------------------------------------

export type SyncStatus = 'idle' | 'saving' | 'error';

type SyncState = {
  status: SyncStatus;
  /** Why the last push failed, for the banner. */
  message: string | null;
  /** True once this session's snapshot is in the store. Gates the home screens so onboarding never flashes. */
  hydrated: boolean;
};

export const useSync = create<SyncState>(() => ({ status: 'idle', message: null, hydrated: false }));

// ---------------------------------------------------------------------------
// Diffing (pure)
// ---------------------------------------------------------------------------

type FamilyFields = Pick<State, 'phase' | 'owner' | 'birth' | 'homes' | 'mother'>;
const FAMILY_FIELDS = ['phase', 'owner', 'birth', 'homes', 'mother'] as const;

/** What changed between two store states, still in store terms (photos as `Photo`). Ordered rows carry their index. */
export type StoreDiff = {
  family: Partial<FamilyFields>;
  upsert: { kittens: (Kitten & { order: number })[]; weights: Weight[]; moments: Moment[]; checkins: Checkin[]; tasks: (Task & { order: number })[] };
  remove: { kittens: string[]; weights: string[]; moments: string[]; checkins: string[]; tasks: string[] };
};

const TABLES = ['kittens', 'weights', 'moments', 'checkins', 'tasks'] as const;

const emptyDiff = (): StoreDiff => ({
  family: {},
  upsert: { kittens: [], weights: [], moments: [], checkins: [], tasks: [] },
  remove: { kittens: [], weights: [], moments: [], checkins: [], tasks: [] },
});

/** Rows of `next` that are new or changed (by reference), and ids of `prev` rows that are gone. */
function rowsDiff<T extends { id: string }>(prev: T[], next: T[]): { upsert: T[]; remove: string[] } {
  if (prev === next) return { upsert: [], remove: [] };
  const before = new Map(prev.map((r) => [r.id, r]));
  const after = new Set(next.map((r) => r.id));
  return { upsert: next.filter((r) => before.get(r.id) !== r), remove: prev.filter((r) => !after.has(r.id)).map((r) => r.id) };
}

/** Ordered rows: a changed array sends every row with its index so `order` is always right on the server. */
function orderedDiff<T extends { id: string }>(prev: T[], next: T[]): { upsert: (T & { order: number })[]; remove: string[] } {
  if (prev === next) return { upsert: [], remove: [] };
  const after = new Set(next.map((r) => r.id));
  return { upsert: next.map((r, order) => ({ ...r, order })), remove: prev.filter((r) => !after.has(r.id)).map((r) => r.id) };
}

/** The diff from `prev` to `next`, or null when nothing Convex cares about changed. */
export function diffState(prev: State, next: State): StoreDiff | null {
  const d = emptyDiff();
  let changed = false;
  for (const f of FAMILY_FIELDS) {
    if (prev[f] !== next[f]) {
      (d.family as Record<string, unknown>)[f] = next[f];
      changed = true;
    }
  }
  const sets = {
    kittens: orderedDiff(prev.kittens, next.kittens),
    weights: rowsDiff(prev.weights, next.weights),
    moments: rowsDiff(prev.moments, next.moments),
    checkins: rowsDiff(prev.checkins, next.checkins),
    tasks: orderedDiff(prev.tasks, next.tasks),
  };
  for (const t of TABLES) {
    (d.upsert[t] as unknown[]) = sets[t].upsert;
    d.remove[t] = sets[t].remove;
    if (sets[t].upsert.length || sets[t].remove.length) changed = true;
  }
  return changed ? d : null;
}

/** Coalesce `later` onto `earlier`: later family fields win, rows are keyed by id, and a later upsert/remove cancels the other. */
export function mergeDiff(earlier: StoreDiff, later: StoreDiff): StoreDiff {
  const d = emptyDiff();
  d.family = { ...earlier.family, ...later.family };
  for (const t of TABLES) {
    const removed = new Set([...earlier.remove[t], ...later.remove[t]]);
    const rows = new Map<string, { id: string }>();
    for (const r of earlier.upsert[t]) rows.set(r.id, r);
    for (const id of later.remove[t]) rows.delete(id);
    for (const r of later.upsert[t]) {
      rows.set(r.id, r);
      removed.delete(r.id);
    }
    for (const r of earlier.upsert[t]) if (later.remove[t].includes(r.id)) rows.delete(r.id);
    (d.upsert[t] as unknown[]) = [...rows.values()];
    d.remove[t] = [...removed];
  }
  return d;
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

/** Bundled asset key, a URL/URI we have already stored, or a local file that still needs uploading. */
export function photoKind(photo: Photo): 'key' | 'remote' | 'local' {
  if (photo in photos) return 'key';
  return /^https?:\/\//.test(photo) ? 'remote' : 'local';
}

const MIME: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', heic: 'image/heic', heif: 'image/heif', webp: 'image/webp', gif: 'image/gif' };

/** Best-effort content type from the file extension; photos from the picker are JPEGs unless told otherwise. */
export function mimeFor(uri: string): string {
  const ext = uri.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() ?? '';
  return MIME[ext] ?? 'image/jpeg';
}

/** `photo` as the push argument, given the uri → storageId cache and an uploader for anything not yet stored. */
export async function toPhotoArg(photo: Photo | null, stored: Map<string, StorageId>, upload: (uri: string) => Promise<StorageId>): Promise<PhotoArg> {
  if (photo === null) return null;
  if (photoKind(photo) === 'key') return { key: photo };
  const known = stored.get(photo);
  if (known) return { storageId: known };
  const storageId = await upload(photo);
  stored.set(photo, storageId);
  return { storageId };
}

/** Split a wire snapshot into store shape (no `photoId`) and the URL → storageId map it implies. */
export function readSnapshot(wire: WireSnapshot): { snapshot: Snapshot; stored: Map<string, StorageId> } {
  const stored = new Map<string, StorageId>();
  const photo = <T extends { photo: string | null; photoId: StorageId | null }>(row: T): T['photo'] => {
    if (row.photo && row.photoId) stored.set(row.photo, row.photoId);
    return row.photo;
  };
  const snapshot: Snapshot = {
    phase: wire.phase,
    owner: wire.owner,
    birth: wire.birth,
    homes: wire.homes,
    mother: wire.mother && {
      name: wire.mother.name,
      photo: photo(wire.mother),
      age: wire.mother.age,
      matingDate: wire.mother.matingDate,
      dueDate: wire.mother.dueDate,
      firstLitter: wire.mother.firstLitter,
      vet: wire.mother.vet,
    },
    kittens: wire.kittens.map((k) => ({
      id: k.id,
      name: k.name,
      tempId: k.tempId,
      tempColor: k.tempColor,
      sex: k.sex,
      coat: k.coat,
      photo: photo(k),
      birthTime: k.birthTime,
      birthWeight: k.birthWeight,
      tagline: k.tagline,
    })),
    weights: wire.weights.map((w) => ({ id: w.id, kittenId: w.kittenId, date: w.date, grams: w.grams })),
    moments: wire.moments.map((m) => ({ id: m.id, subjectId: m.subjectId, date: m.date, text: m.text, photo: photo(m), first: m.first, kind: m.kind })),
    checkins: wire.checkins.map((c) => ({ id: c.id, subjectId: c.subjectId, date: c.date, appetite: c.appetite, mood: c.mood, note: c.note, photo: photo(c) })),
    tasks: wire.tasks.map((t) => ({ id: t.id, title: t.title, subtitle: t.subtitle, photo: photo(t), icon: t.icon, done: t.done, action: t.action })),
  };
  return { snapshot, stored };
}

/** The push body for a diff. Picks exactly the contract's fields — Convex object validators reject extras. */
export async function toPushArgs(d: StoreDiff, photoArg: (photo: Photo | null) => Promise<PhotoArg>): Promise<PushArgs> {
  const args: PushArgs = {};
  const family: NonNullable<PushArgs['family']> = {};
  if ('phase' in d.family && d.family.phase) family.phase = d.family.phase;
  if ('owner' in d.family && d.family.owner) family.owner = { name: d.family.owner.name, child: d.family.owner.child };
  if ('birth' in d.family) family.birth = d.family.birth ? { date: d.family.birth.date, count: d.family.birth.count } : null;
  if ('homes' in d.family && d.family.homes) family.homes = d.family.homes.map((h) => ({ kittenId: h.kittenId, names: h.names, movingDay: h.movingDay }));
  if ('mother' in d.family) {
    const m = d.family.mother;
    family.mother = m
      ? { name: m.name, age: m.age, matingDate: m.matingDate, dueDate: m.dueDate, firstLitter: m.firstLitter, vet: m.vet, photo: await photoArg(m.photo) }
      : null;
  }
  if (Object.keys(family).length) args.family = family;

  const upsert: NonNullable<PushArgs['upsert']> = {};
  if (d.upsert.kittens.length) {
    upsert.kittens = [];
    for (const k of d.upsert.kittens) {
      upsert.kittens.push({
        id: k.id,
        name: k.name,
        tempId: k.tempId,
        tempColor: k.tempColor,
        sex: k.sex,
        coat: k.coat,
        birthTime: k.birthTime,
        birthWeight: k.birthWeight,
        tagline: k.tagline,
        photo: await photoArg(k.photo),
        order: k.order,
      });
    }
  }
  if (d.upsert.weights.length) upsert.weights = d.upsert.weights.map((w) => ({ id: w.id, kittenId: w.kittenId, date: w.date, grams: w.grams }));
  if (d.upsert.moments.length) {
    upsert.moments = [];
    for (const m of d.upsert.moments) {
      upsert.moments.push({ id: m.id, subjectId: m.subjectId, date: m.date, text: m.text, first: m.first, kind: m.kind, photo: await photoArg(m.photo) });
    }
  }
  if (d.upsert.checkins.length) {
    upsert.checkins = [];
    for (const c of d.upsert.checkins) {
      upsert.checkins.push({ id: c.id, subjectId: c.subjectId, date: c.date, appetite: c.appetite, mood: c.mood, note: c.note, photo: await photoArg(c.photo) });
    }
  }
  if (d.upsert.tasks.length) {
    upsert.tasks = [];
    for (const t of d.upsert.tasks) {
      upsert.tasks.push({ id: t.id, title: t.title, subtitle: t.subtitle, icon: t.icon, done: t.done, action: t.action, photo: await photoArg(t.photo), order: t.order });
    }
  }
  if (Object.keys(upsert).length) args.upsert = upsert;

  const remove: NonNullable<PushArgs['remove']> = {};
  for (const t of TABLES) if (d.remove[t].length) remove[t] = d.remove[t];
  if (Object.keys(remove).length) args.remove = remove;

  return args;
}

// ---------------------------------------------------------------------------
// Session + queue
// ---------------------------------------------------------------------------

/** Bumped on every session start/stop so late responses from an old session are ignored. */
let generation = 0;
/** True between `startSession` and `stopSession` — i.e. Convex accepts our token. */
let active = false;
/** Set around `store.hydrate` so the subscription ignores our own write. */
let hydrating = false;

let pending: StoreDiff | null = null;
let inFlight = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let backoff = 1000;
const MAX_BACKOFF = 30_000;

/** Known photo uri/url → storage id (snapshot URLs plus this session's uploads). */
const stored = new Map<string, StorageId>();

const setStatus = (status: SyncStatus, message: string | null = null) => useSync.setState({ status, message });

const clearRetry = () => {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
};

function scheduleRetry() {
  clearRetry();
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void flush();
  }, backoff);
  backoff = Math.min(backoff * 2, MAX_BACKOFF);
}

async function upload(uri: string): Promise<StorageId> {
  const postUrl = await convex.mutation(api.family.generateUploadUrl, {});
  const blob = await (await fetch(uri)).blob();
  const res = await fetch(postUrl, { method: 'POST', headers: { 'Content-Type': blob.type || mimeFor(uri) }, body: blob });
  if (!res.ok) throw new Error(`Photo upload failed (${res.status})`);
  const { storageId } = (await res.json()) as { storageId: StorageId };
  return storageId;
}

const photoArg = (photo: Photo | null) => toPhotoArg(photo, stored, upload);

const isInvalid = (e: unknown) => e instanceof ConvexError && typeof e.data === 'object' && e.data !== null && (e.data as { code?: string }).code === 'invalid';

const describe = (e: unknown) => (e instanceof ConvexError ? ((e.data as { message?: string })?.message ?? e.message) : e instanceof Error ? e.message : String(e));

/** Send the pending diff. One push at a time; anything that changes meanwhile coalesces into the next one. */
async function flush(): Promise<void> {
  if (!active || inFlight || !pending || !useSync.getState().hydrated) return;
  const gen = generation;
  const diff = pending;
  pending = null;
  inFlight = true;
  setStatus('saving');
  try {
    const args = await toPushArgs(diff, photoArg);
    if (gen !== generation) return;
    await convex.mutation(api.family.push, args);
    if (gen !== generation) return;
    backoff = 1000;
    if (!pending) setStatus('idle');
  } catch (e) {
    if (gen !== generation) return;
    if (isInvalid(e)) {
      // The server refused this write for good: retrying would fail the same way. Drop the op, keep the local data
      // (the person can still see and edit it) and say so — it must not look saved.
      setStatus('error', describe(e));
    } else {
      // Keep the op: whatever changed since merges on top of it, and we try again with backoff / on foreground.
      pending = pending ? mergeDiff(diff, pending) : diff;
      // While offline the push is simply waiting, not failed.
      if (convex.connectionState().isWebSocketConnected) setStatus('error', describe(e));
      else setStatus('saving');
      scheduleRetry();
    }
  } finally {
    if (gen === generation) {
      inFlight = false;
      if (pending && !retryTimer) void flush();
    }
  }
}

/** Queue a store diff for the next push. */
function enqueue(diff: StoreDiff) {
  pending = pending ? mergeDiff(pending, diff) : diff;
  if (!retryTimer) void flush();
}

/** Push whatever is queued right now (banner "Retry", app foregrounded, reconnect). */
export function retryNow() {
  if (!active || inFlight) return;
  clearRetry();
  backoff = 1000;
  if (!useSync.getState().hydrated) void hydrate();
  else if (pending) void flush();
  else if (useSync.getState().status === 'error') setStatus('idle');
}

/** One-shot snapshot → store. Retries with backoff on failure; the gate shows the loading state until it lands. */
async function hydrate(): Promise<void> {
  const gen = generation;
  try {
    const wire = await convex.query(api.family.snapshot, {});
    if (gen !== generation) return;
    stored.clear();
    const data = wire ? readSnapshot(wire) : null;
    for (const [url, id] of data?.stored ?? []) stored.set(url, id);
    hydrating = true;
    try {
      useStore.getState().hydrate(data?.snapshot ?? null);
    } finally {
      hydrating = false;
    }
    backoff = 1000;
    useSync.setState({ hydrated: true, status: 'idle', message: null });
    if (pending) void flush();
  } catch (e) {
    if (gen !== generation) return;
    setStatus('error', `Couldn't load your family: ${describe(e)}`);
    clearRetry();
    retryTimer = setTimeout(() => {
      retryTimer = null;
      void hydrate();
    }, backoff);
    backoff = Math.min(backoff * 2, MAX_BACKOFF);
  }
}

/** Convex accepted our token: hydrate once, then write through. */
export function startSession() {
  if (active) return;
  generation++;
  active = true;
  pending = null;
  inFlight = false;
  backoff = 1000;
  clearRetry();
  useSync.setState({ hydrated: false, status: 'idle', message: null });
  void hydrate();
}

/** Signed out (or token rejected): stop writing, drop the queue and caches, and clear private data from the device. */
export function stopSession() {
  if (!active) return;
  generation++;
  active = false;
  pending = null;
  inFlight = false;
  clearRetry();
  stored.clear();
  useSync.setState({ hydrated: false, status: 'idle', message: null });
  useStore.getState().reset();
}

/** Leave the demo: back to the signed-in family from Convex, or a fresh state when signed out. */
export async function exitDemo(): Promise<void> {
  if (!active) {
    useStore.getState().reset();
    return;
  }
  useSync.setState({ hydrated: false });
  await hydrate();
}

// Every store change while a session is active and not in demo becomes a push.
useStore.subscribe((next, prev) => {
  if (!active || hydrating || next.demo || prev.demo) return;
  const diff = diffState(prev, next);
  if (diff) enqueue(diff);
});

// Retry when the app comes back and when the socket reconnects.
AppState.addEventListener('change', (state) => {
  if (state === 'active') retryNow();
});
let wasConnected = false;
convex.subscribeToConnectionState((state) => {
  if (state.isWebSocketConnected && !wasConnected) retryNow();
  wasConnected = state.isWebSocketConnected;
});
