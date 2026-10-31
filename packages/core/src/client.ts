import type { CountryLeagues, FixturesResponse, MatchDetail } from './types';

/** Thin client for ELAP's own backend (the Next.js /api routes). Used by the mobile app and by web pages in the browser. */
export function createElapClient(baseUrl: string) {
  const root = baseUrl.replace(/\/+$/, '');

  async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await fetch(`${root}${path}${qs}`, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`ELAP API ${res.status} on ${path}`);
    return (await res.json()) as T;
  }

  return {
    fixtures: (date: string, timezone: string) =>
      get<FixturesResponse>('/api/fixtures', { date, tz: timezone }),
    match: (id: number | string) => get<MatchDetail>(`/api/matches/${id}`),
    leagues: () => get<CountryLeagues[]>('/api/leagues'),
  };
}

export type ElapClient = ReturnType<typeof createElapClient>;
