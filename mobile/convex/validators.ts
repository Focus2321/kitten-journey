import { v } from 'convex/values';

/** Enum validators mirroring the unions in `src/data/store.ts`. Shared by the schema and the API. */

export const phase = v.union(v.literal('new'), v.literal('expecting'), v.literal('newborn'), v.literal('growing'));

export const sex = v.union(v.literal('boy'), v.literal('girl'), v.literal('unknown'));

export const appetite = v.union(v.literal('hungry'), v.literal('normal'), v.literal('picky'));

export const momentKind = v.union(v.literal('moment'), v.literal('photo'), v.literal('feeding'), v.literal('checkin'));

export const taskIcon = v.union(
  v.literal('camera'),
  v.literal('box'),
  v.literal('scale'),
  v.literal('heart'),
  v.literal('bottle'),
  v.literal('sparkle'),
  v.literal('calendar'),
  v.null(),
);

export const taskAction = v.union(v.literal('mother-checkin'), v.literal('weigh-in'), v.literal('photo'), v.literal('quick-add'), v.literal('none'));
