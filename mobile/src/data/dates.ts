/**
 * Dates are stored as local 'YYYY-MM-DD' strings (times as 'HH:MM') so the demo story
 * never shifts with timezones. Build Date objects with `toDate`, never `new Date(iso)`.
 */

export const DEMO = {
  /** Expecting: Juniper is ~week 7. */
  expectingToday: '2026-09-27',
  birthDate: '2026-10-11',
  /** Newborn: day 5. */
  newbornToday: '2026-10-16',
  /** Biscuit is named by Maya on day 12. */
  namingDay: '2026-10-23',
  /** Growing: week 6. */
  growingToday: '2026-11-22',
  movingDay: '2026-12-20',
  /** Estimated mating date → "week 7-ish" on expectingToday. */
  matingDate: '2026-08-10',
  dueDate: '2026-10-12',
} as const;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function toDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function addDays(iso: string, days: number): string {
  const d = toDate(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** Whole days from `a` to `b` (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86_400_000);
}

/** "Sunday 27 September" */
export function formatLong(iso: string): string {
  const d = toDate(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "Sun 27 Sep" */
export function formatShort(iso: string): string {
  const d = toDate(iso);
  return `${DAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

/** "27 Sep" */
export function formatDayMonth(iso: string): string {
  const d = toDate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

/** "SUN 27 SEP" style label used above the big "Today" headline (uppercase handled by Text label variant). */
export function formatHeaderDate(iso: string): string {
  return formatShort(iso);
}

/** "Today" / "Yesterday" / "Fri 20 Nov" relative to `today`. */
export function formatRelative(iso: string, today: string): string {
  const diff = daysBetween(iso, today);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return formatShort(iso);
}

/** Kitten age: "Day 5" for the first two weeks, then "Week 6". */
export function ageLabel(birthISO: string, today: string): string {
  const days = daysBetween(birthISO, today);
  if (days < 14) return `Day ${days}`;
  return `Week ${Math.floor(days / 7)}`;
}

/** "6 weeks old today" / "5 days old" */
export function ageSentence(birthISO: string, today: string): string {
  const days = daysBetween(birthISO, today);
  if (days < 14) return `${days} ${days === 1 ? 'day' : 'days'} old`;
  const weeks = Math.floor(days / 7);
  return days % 7 === 0 ? `${weeks} weeks old today` : `${weeks} weeks old`;
}

/** Pregnancy week from an estimated mating date. Cats carry ~9 weeks (63–65 days). */
export function pregnancyWeek(matingISO: string, today: string): number {
  return Math.max(1, Math.floor(daysBetween(matingISO, today) / 7) + 1);
}

/** "5:42" from "05:42" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h}:${String(m).padStart(2, '0')}`;
}
