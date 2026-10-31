import 'server-only';
import { addDays, isInPlay, localDate } from '@elap/core';
import type { CountryLeagues, FixturesResponse, LeagueGroup, Match, MatchDetail } from '@elap/core';
import { apiFootball, hasApiKey } from './apiFootball';
import { withBroadcasts } from './broadcasts';
import { isMajorLeague, leagueRank } from './leagues';
import { toEvent, toLineup, toMatch, type AfEvent, type AfFixture, type AfLeague, type AfLineup } from './normalize';
import { sampleFixtures, sampleLeagues, sampleMatchDetail } from './sample';

/** Cache lifetimes, in seconds. See the plan doc's request budget. */
const TTL = {
  fixturesDay: 600,
  fixturesDayWithLive: 60,
  live: 30,
  lineups: 300,
  eventsLive: 30,
  eventsDone: 3600,
  leagues: 86_400,
};

async function fixturesForUtcDate(utcDate: string): Promise<Match[]> {
  if (!hasApiKey()) return sampleFixtures(utcDate);
  const today = new Date().toISOString().slice(0, 10);
  const ttl = utcDate === today ? TTL.fixturesDayWithLive : TTL.fixturesDay;
  const raw = await apiFootball<AfFixture[]>('/fixtures', { date: utcDate }, ttl);
  return raw.map(toMatch);
}

/** Live fixtures refresh faster than the day list; overlay them on top. */
async function liveOverlay(): Promise<Map<number, Match>> {
  if (!hasApiKey()) return new Map();
  const raw = await apiFootball<AfFixture[]>('/fixtures', { live: 'all' }, TTL.live);
  return new Map(raw.map((f) => [f.fixture.id, toMatch(f)]));
}

function groupByLeague(matches: Match[]): LeagueGroup[] {
  const groups = new Map<number, LeagueGroup>();
  for (const m of matches) {
    const g = groups.get(m.league.id) ?? { league: m.league, matches: [] };
    g.matches.push(m);
    groups.set(m.league.id, g);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, matches: g.matches.sort((a, b) => a.kickoff.localeCompare(b.kickoff)) }))
    .sort((a, b) => leagueRank(a.league.id) - leagueRank(b.league.id));
}

/**
 * Matches whose kickoff falls on `date` in the viewer's timezone.
 * A local day spans up to three UTC days, so we read those (each cached once for everyone) and filter.
 */
export async function getFixtures(date: string, timeZone: string): Promise<FixturesResponse> {
  const days = [addDays(date, -1), date, addDays(date, 1)];
  const [lists, live] = await Promise.all([Promise.all(days.map(fixturesForUtcDate)), liveOverlay()]);

  const seen = new Set<number>();
  const matches = lists
    .flat()
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return isMajorLeague(m.league.id) && localDate(m.kickoff, timeZone) === date;
    })
    .map((m) => live.get(m.id) ?? m);

  return {
    date,
    timezone: timeZone,
    sample: !hasApiKey(),
    groups: groupByLeague(await withBroadcasts(matches)),
  };
}

export async function getMatchDetail(id: number): Promise<MatchDetail | null> {
  if (!hasApiKey()) {
    const m = sampleMatchDetail(id);
    return m ? (await withBroadcasts([m]))[0] : null;
  }

  const [fixture] = await apiFootball<AfFixture[]>('/fixtures', { id }, TTL.live);
  if (!fixture) return null;
  const match = toMatch(fixture);
  const live = isInPlay(match.status);

  const [events, lineups] = await Promise.all([
    match.status === 'scheduled'
      ? Promise.resolve([] as AfEvent[])
      : apiFootball<AfEvent[]>('/fixtures/events', { fixture: id }, live ? TTL.eventsLive : TTL.eventsDone),
    apiFootball<AfLineup[]>('/fixtures/lineups', { fixture: id }, TTL.lineups),
  ]);

  const detail: MatchDetail = {
    ...match,
    events: events.map(toEvent).sort((a, b) => b.minute - a.minute),
    lineups: lineups.map(toLineup),
  };
  return (await withBroadcasts([detail]))[0];
}

export async function getLeagues(): Promise<CountryLeagues[]> {
  if (!hasApiKey()) return sampleLeagues();
  const raw = await apiFootball<AfLeague[]>('/leagues', { current: 'true' }, TTL.leagues);
  const byCountry = new Map<string, CountryLeagues>();
  for (const r of raw) {
    if (!isMajorLeague(r.league.id)) continue;
    const c = byCountry.get(r.country.name) ?? {
      country: r.country.name,
      code: r.country.code,
      flag: r.country.flag,
      leagues: [],
    };
    c.leagues.push({
      id: r.league.id,
      name: r.league.name,
      country: r.country.name,
      countryCode: r.country.code,
      flag: r.country.flag,
      logo: r.league.logo ?? null,
    });
    byCountry.set(r.country.name, c);
  }
  return [...byCountry.values()].sort(
    (a, b) => Math.min(...a.leagues.map((l) => leagueRank(l.id))) - Math.min(...b.leagues.map((l) => leagueRank(l.id))),
  );
}
