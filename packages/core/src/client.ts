import type { CountryLeagues, FixturesResponse, MatchDetail, TeamDetail } from './types';
import type { Lang } from './i18n';

/** Thin client for ELAP's own backend (the Next.js /api routes). Used by the mobile app and by web pages in the browser. */
export function createElapClient(baseUrl: string) {
  const root = baseUrl.replace(/\/+$/, '');

  async function get<T>(path: string, params?: Record<string, string | null | undefined>): Promise<T> {
    const clean = Object.entries(params ?? {}).filter((e): e is [string, string] => !!e[1]);
    const qs = clean.length ? `?${new URLSearchParams(clean).toString()}` : '';
    const res = await fetch(`${root}${path}${qs}`, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`ELAP API ${res.status} on ${path}`);
    return (await res.json()) as T;
  }

  return {
    fixtures: (date: string, timezone: string, opts: { country?: string | null; lang?: Lang } = {}) =>
      get<FixturesResponse>('/api/fixtures', { date, tz: timezone, country: opts.country, lang: opts.lang }),
    match: (id: number | string, lang?: Lang) => get<MatchDetail>(`/api/matches/${id}`, { lang }),
    team: (id: number | string, lang?: Lang) => get<TeamDetail>(`/api/teams/${id}`, { lang }),
    leagues: (opts: { country?: string | null; lang?: Lang } = {}) =>
      get<CountryLeagues[]>('/api/leagues', { country: opts.country, lang: opts.lang }),
  };
}

export type ElapClient = ReturnType<typeof createElapClient>;
