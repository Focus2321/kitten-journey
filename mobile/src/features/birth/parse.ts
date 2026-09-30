/** Newborn kittens usually weigh 80–140 g; anything outside this range is almost certainly a typo. */
export const MIN_GRAMS = 30;
export const MAX_GRAMS = 400;

export const TIME_ERROR = 'Use a 24-hour time, like 5:42 or 17:05.';
export const GRAMS_ERROR = `Weight is in whole grams, between ${MIN_GRAMS} and ${MAX_GRAMS}.`;

/** "5:42", "05.42" or "17:05" → "05:42"; null for anything that is not a real 24-hour time. */
export function parseTime(t: string) {
  const m = t.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

/** Whole grams in a plausible newborn range; "102 g" is fine, "-10", "0" or "1.5" are not. */
export function parseGrams(g: string) {
  const m = g.trim().match(/^(\d+)\s*g?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= MIN_GRAMS && n <= MAX_GRAMS ? n : null;
}
