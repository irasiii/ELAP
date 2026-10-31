/** Timezone helpers. Data is stored in UTC; every screen converts to the viewer's own timezone. */

export const DEFAULT_TIMEZONE = 'Africa/Cairo';

export type DayKey = 'yesterday' | 'today' | 'tomorrow';

export const DAY_OFFSETS: Record<DayKey, number> = { yesterday: -1, today: 0, tomorrow: 1 };

export function isValidTimeZone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The viewer's timezone from the runtime (browser or phone), falling back to Cairo. */
export function deviceTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/** Calendar date (YYYY-MM-DD) of an instant, as seen in a timezone. */
export function localDate(instant: Date | string, timeZone: string): string {
  const d = typeof instant === 'string' ? new Date(instant) : instant;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** YYYY-MM-DD for yesterday/today/tomorrow in the given timezone. */
export function dateForDay(day: DayKey, timeZone: string, now: Date = new Date()): string {
  const shifted = new Date(now.getTime() + DAY_OFFSETS[day] * 86_400_000);
  return localDate(shifted, timeZone);
}

/** Adds whole days to a YYYY-MM-DD string. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isIsoDate(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** Kickoff time like "18:30" in the viewer's timezone. */
export function formatKickoff(iso: string, timeZone: string, locale = 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

/** Long date like "الأحد 1 نوفمبر" in the viewer's timezone. */
export function formatMatchDate(iso: string, timeZone: string, locale = 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));
}
