import { countryByApiName } from './countries';
import type { Lang } from './i18n';

/** Country name in the viewer's language, for the English names API-Football returns. */
export function countryName(country: string, lang: Lang): string {
  if (/^world$/i.test(country)) return lang === 'ar' ? 'دولي' : lang === 'fr' ? 'International' : 'International';
  const c = countryByApiName(country);
  return c ? c.names[lang] : country.replace(/-/g, ' ');
}

/** One or two letters for a placeholder crest. Skips the Arabic article "ال" so clubs don't all show the same letters. */
export function crestInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const strip = (w: string) => (w.startsWith('ال') && w.length > 2 ? w.slice(2) : w);
  const first = strip(words[0] ?? '?');
  if (/^[A-Za-z]/.test(first)) {
    return ((words.length > 1 ? first[0] + strip(words[1])[0] : first.slice(0, 2)) || '?').toUpperCase();
  }
  return first.slice(0, 1) || '?';
}
