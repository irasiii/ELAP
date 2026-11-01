import 'server-only';
import { cookies, headers } from 'next/headers';
import { DEFAULT_TIMEZONE, countryByCode, isLang, isValidTimeZone, matchLang, parseAcceptLanguage } from '@elap/core';
import type { Lang } from '@elap/core';

export const TZ_COOKIE = 'elap_tz';
export const LANG_COOKIE = 'elap_lang';
export const COUNTRY_COOKIE = 'elap_country';

export interface Viewer {
  timeZone: string;
  lang: Lang;
  /** ISO alpha-2 country, or null when unknown. */
  country: string | null;
  /** True when the country came from the viewer's own choice rather than detection. */
  countryChosen: boolean;
}

/** Country from the hosting platform's geo header (Vercel or Cloudflare), if present. */
function geoCountry(h: Headers): string | null {
  const v = h.get('x-vercel-ip-country') ?? h.get('cf-ipcountry');
  return v && /^[A-Z]{2}$/i.test(v) && v.toUpperCase() !== 'XX' ? v.toUpperCase() : null;
}

/** Region from Accept-Language, e.g. "ar-SA" → "SA". */
function languageRegion(tags: string[]): string | null {
  for (const tag of tags) {
    const region = tag.split(/[-_]/)[1];
    if (region && /^[A-Z]{2}$/i.test(region)) return region.toUpperCase();
  }
  return null;
}

/**
 * Works out the viewer's timezone, language and country.
 * Order: their saved choice (cookie) → hosting geo header → browser language region → defaults.
 */
export async function getViewer(): Promise<Viewer> {
  const [c, h] = await Promise.all([cookies(), headers()]);
  const tags = parseAcceptLanguage(h.get('accept-language'));

  const tzCookie = c.get(TZ_COOKIE)?.value;
  const langCookie = c.get(LANG_COOKIE)?.value;
  const countryCookie = c.get(COUNTRY_COOKIE)?.value?.toUpperCase();

  const chosen = countryCookie && /^[A-Z]{2}$/.test(countryCookie) ? countryCookie : null;
  const detected = geoCountry(h) ?? languageRegion(tags);

  return {
    timeZone: isValidTimeZone(tzCookie) ? tzCookie : DEFAULT_TIMEZONE,
    lang: isLang(langCookie) ? langCookie : matchLang(tags),
    country: chosen ?? (detected && countryByCode(detected) ? detected : detected ?? null),
    countryChosen: !!chosen,
  };
}
