/**
 * "Major" competitions shown on the home screen, in display order.
 * IDs are API-Football league IDs. Check them against GET /leagues?id=<id> once your key is active,
 * and add more per country as ELAP grows. Set ELAP_SHOW_ALL_LEAGUES=1 to show every competition.
 */
export const MAJOR_LEAGUES: { id: number; note: string }[] = [
  { id: 1, note: 'FIFA World Cup' },
  { id: 2, note: 'UEFA Champions League' },
  { id: 3, note: 'UEFA Europa League' },
  { id: 17, note: 'AFC Champions League' },
  { id: 12, note: 'CAF Champions League' },
  { id: 307, note: 'Saudi Pro League' },
  { id: 233, note: 'Egyptian Premier League' },
  { id: 200, note: 'Morocco Botola Pro' },
  { id: 301, note: 'UAE Pro League' },
  { id: 39, note: 'England Premier League' },
  { id: 140, note: 'Spain La Liga' },
  { id: 135, note: 'Italy Serie A' },
  { id: 78, note: 'Germany Bundesliga' },
  { id: 61, note: 'France Ligue 1' },
  { id: 188, note: 'Australia A-League' },
];

const order = new Map(MAJOR_LEAGUES.map((l, i) => [l.id, i]));

export function isMajorLeague(id: number): boolean {
  return process.env.ELAP_SHOW_ALL_LEAGUES === '1' || order.has(id);
}

export function leagueRank(id: number): number {
  return order.get(id) ?? 10_000 + id;
}
