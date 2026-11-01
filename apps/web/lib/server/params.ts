import 'server-only';
import { DEFAULT_TIMEZONE, isLang, isValidTimeZone } from '@elap/core';
import type { Lang } from '@elap/core';

/** Validated query params shared by the API routes. Anything invalid falls back to a safe default. */
export function readParams(url: URL, fallbackLang: Lang = 'ar') {
  const tz = url.searchParams.get('tz');
  const lang = url.searchParams.get('lang');
  const country = url.searchParams.get('country')?.toUpperCase() ?? null;
  return {
    timeZone: isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE,
    lang: isLang(lang) ? lang : fallbackLang,
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
  };
}

export function readId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 && n < 2 ** 31 ? n : null;
}
