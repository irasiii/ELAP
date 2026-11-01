import { curatedLeagueIds } from '@elap/core';

/**
 * Competitions ELAP shows: every domestic league listed per country in packages/core/src/countries.ts,
 * plus the international ones. Set ELAP_SHOW_ALL_LEAGUES=1 to show everything API-Football returns.
 */
const curated = curatedLeagueIds();

export function isShownLeague(id: number): boolean {
  return process.env.ELAP_SHOW_ALL_LEAGUES === '1' || curated.has(id);
}
