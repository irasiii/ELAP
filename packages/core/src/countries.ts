import type { Lang } from './i18n';
import type { LeagueGroup, LeagueTier } from './types';

/**
 * Countries ELAP knows, with their domestic competitions (API-Football league IDs, most important first).
 * Verify IDs with GET /leagues?country=<name> once your key is active, and add more countries here.
 */
export interface CountryInfo {
  code: string;
  /** Country name as API-Football writes it. */
  apiName: string;
  names: Record<Lang, string>;
  leagues: number[];
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'SA', apiName: 'Saudi-Arabia', names: { ar: 'السعودية', en: 'Saudi Arabia', fr: 'Arabie saoudite' }, leagues: [307, 308, 504] },
  { code: 'EG', apiName: 'Egypt', names: { ar: 'مصر', en: 'Egypt', fr: 'Égypte' }, leagues: [233, 714] },
  { code: 'MA', apiName: 'Morocco', names: { ar: 'المغرب', en: 'Morocco', fr: 'Maroc' }, leagues: [200, 201] },
  { code: 'DZ', apiName: 'Algeria', names: { ar: 'الجزائر', en: 'Algeria', fr: 'Algérie' }, leagues: [186] },
  { code: 'TN', apiName: 'Tunisia', names: { ar: 'تونس', en: 'Tunisia', fr: 'Tunisie' }, leagues: [202] },
  { code: 'AE', apiName: 'United-Arab-Emirates', names: { ar: 'الإمارات', en: 'United Arab Emirates', fr: 'Émirats arabes unis' }, leagues: [301] },
  { code: 'QA', apiName: 'Qatar', names: { ar: 'قطر', en: 'Qatar', fr: 'Qatar' }, leagues: [305] },
  { code: 'JO', apiName: 'Jordan', names: { ar: 'الأردن', en: 'Jordan', fr: 'Jordanie' }, leagues: [387] },
  { code: 'IQ', apiName: 'Iraq', names: { ar: 'العراق', en: 'Iraq', fr: 'Irak' }, leagues: [542] },
  { code: 'KW', apiName: 'Kuwait', names: { ar: 'الكويت', en: 'Kuwait', fr: 'Koweït' }, leagues: [330] },
  { code: 'GB', apiName: 'England', names: { ar: 'إنجلترا', en: 'England', fr: 'Angleterre' }, leagues: [39, 40, 45, 48] },
  { code: 'ES', apiName: 'Spain', names: { ar: 'إسبانيا', en: 'Spain', fr: 'Espagne' }, leagues: [140, 143] },
  { code: 'IT', apiName: 'Italy', names: { ar: 'إيطاليا', en: 'Italy', fr: 'Italie' }, leagues: [135, 137] },
  { code: 'DE', apiName: 'Germany', names: { ar: 'ألمانيا', en: 'Germany', fr: 'Allemagne' }, leagues: [78, 81] },
  { code: 'FR', apiName: 'France', names: { ar: 'فرنسا', en: 'France', fr: 'France' }, leagues: [61, 66] },
  { code: 'TR', apiName: 'Turkey', names: { ar: 'تركيا', en: 'Turkey', fr: 'Turquie' }, leagues: [203] },
  { code: 'AU', apiName: 'Australia', names: { ar: 'أستراليا', en: 'Australia', fr: 'Australie' }, leagues: [188] },
  { code: 'US', apiName: 'USA', names: { ar: 'الولايات المتحدة', en: 'United States', fr: 'États-Unis' }, leagues: [253] },
];

/** International competitions shown right after the viewer's own country. */
export const INTERNATIONAL_LEAGUES: number[] = [1, 4, 6, 7, 9, 2, 3, 848, 17, 12, 20, 15, 531];

const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));
const norm = (s: string) => s.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
const byApiName = new Map(COUNTRIES.map((c) => [norm(c.apiName), c]));
const intlRank = new Map(INTERNATIONAL_LEAGUES.map((id, i) => [id, i]));

export function countryByCode(code: string | null | undefined): CountryInfo | undefined {
  return code ? byCode.get(code.toUpperCase()) : undefined;
}

export function countryByApiName(name: string | null | undefined): CountryInfo | undefined {
  return name ? byApiName.get(norm(name)) : undefined;
}

/** Every competition in ELAP's curated list (domestic + international). */
export function curatedLeagueIds(): Set<number> {
  return new Set([...INTERNATIONAL_LEAGUES, ...COUNTRIES.flatMap((c) => c.leagues)]);
}

export function leagueTier(league: { id: number; country: string }, viewerCountry: string | null): LeagueTier {
  const mine = countryByCode(viewerCountry);
  if (mine && (mine.leagues.includes(league.id) || countryByApiName(league.country)?.code === mine.code)) return 'local';
  if (intlRank.has(league.id) || norm(league.country) === 'world') return 'international';
  return 'other';
}

const TIER_ORDER: Record<LeagueTier, number> = { local: 0, international: 1, other: 2 };

/** Rank within a tier: the order leagues are listed above, then by ID. */
function rankWithin(id: number, tier: LeagueTier, viewerCountry: string | null): number {
  if (tier === 'local') {
    const i = countryByCode(viewerCountry)?.leagues.indexOf(id) ?? -1;
    return i >= 0 ? i : 100 + id;
  }
  if (tier === 'international') return intlRank.get(id) ?? 100 + id;
  for (let ci = 0; ci < COUNTRIES.length; ci++) {
    const li = COUNTRIES[ci].leagues.indexOf(id);
    if (li >= 0) return ci * 10 + li;
  }
  return 10_000 + id;
}

/** Orders league groups: viewer's country first, then international, then everything else. */
export function orderGroups(groups: Omit<LeagueGroup, 'tier'>[], viewerCountry: string | null): LeagueGroup[] {
  return groups
    .map((g) => ({ ...g, tier: leagueTier(g.league, viewerCountry) }))
    .sort(
      (a, b) =>
        TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
        rankWithin(a.league.id, a.tier, viewerCountry) - rankWithin(b.league.id, b.tier, viewerCountry),
    );
}
