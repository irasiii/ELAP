import 'server-only';
import { addDays, buildStory, isInPlay, leagueTier, localDate, orderGroups, resultFor } from '@elap/core';
import type { CountryLeagues, FixturesResponse, Lang, Match, MatchDetail, TeamDetail } from '@elap/core';
import { apiFootball, hasApiKey } from './apiFootball';
import { withBroadcasts } from './broadcasts';
import { isShownLeague } from './leagues';
import { localizer } from './names';
import {
  toEvent,
  toLineup,
  toMatch,
  type AfEvent,
  type AfFixture,
  type AfLeague,
  type AfLineup,
  type AfTeam,
} from './normalize';
import { sampleFixtures, sampleLeagues, sampleMatchDetail, sampleTeam } from './sample';

/** Cache lifetimes, in seconds. See the plan doc's request budget. */
const TTL = {
  fixturesDay: 600,
  fixturesToday: 60,
  live: 30,
  lineups: 300,
  eventsLive: 30,
  eventsDone: 3600,
  leagues: 86_400,
  team: 86_400,
  teamFixtures: 600,
};

const iso = (ms: number) => new Date(ms).toISOString();

async function fixturesForUtcDate(utcDate: string): Promise<{ matches: Match[]; fetchedAt: number }> {
  if (!hasApiKey()) return { matches: sampleFixtures(utcDate), fetchedAt: Date.now() };
  const today = new Date().toISOString().slice(0, 10);
  const r = await apiFootball<AfFixture[]>('/fixtures', { date: utcDate }, utcDate === today ? TTL.fixturesToday : TTL.fixturesDay);
  return { matches: r.data.map(toMatch), fetchedAt: r.fetchedAt };
}

/** Live fixtures refresh faster than the day list; overlay them on top. */
async function liveOverlay(): Promise<{ live: Map<number, Match>; fetchedAt: number | null }> {
  if (!hasApiKey()) return { live: new Map(), fetchedAt: null };
  const r = await apiFootball<AfFixture[]>('/fixtures', { live: 'all' }, TTL.live);
  return { live: new Map(r.data.map((f) => [f.fixture.id, toMatch(f)])), fetchedAt: r.fetchedAt };
}

/**
 * Matches whose kickoff falls on `date` in the viewer's timezone, ordered for the viewer's country:
 * their own competitions first, then international, then the rest.
 * A local day spans up to three UTC days, so we read those (each cached once for everyone) and filter.
 */
export async function getFixtures(date: string, timeZone: string, country: string | null, lang: Lang): Promise<FixturesResponse> {
  const days = [addDays(date, -1), date, addDays(date, 1)];
  const [lists, overlay, l10n] = await Promise.all([Promise.all(days.map(fixturesForUtcDate)), liveOverlay(), localizer(lang)]);

  const seen = new Set<number>();
  const matches = lists
    .flatMap((l) => l.matches)
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return (isShownLeague(m.league.id) || leagueTier(m.league, country) === 'local') && localDate(m.kickoff, timeZone) === date;
    })
    .map((m) => l10n.match(overlay.live.get(m.id) ?? m));

  const byLeague = new Map<number, { league: Match['league']; matches: Match[] }>();
  for (const m of await withBroadcasts(matches)) {
    const g = byLeague.get(m.league.id) ?? { league: m.league, matches: [] };
    g.matches.push(m);
    byLeague.set(m.league.id, g);
  }
  const groups = [...byLeague.values()].map((g) => ({ ...g, matches: g.matches.sort((a, b) => a.kickoff.localeCompare(b.kickoff)) }));

  // "Last updated" = the oldest data on screen, so it never overstates freshness.
  const stamps = [...lists.map((l) => l.fetchedAt), ...(overlay.fetchedAt ? [overlay.fetchedAt] : [])];
  return {
    date,
    timezone: timeZone,
    country,
    lang,
    updatedAt: iso(Math.min(...stamps)),
    sample: !hasApiKey(),
    groups: orderGroups(groups, country),
  };
}

export async function getMatchDetail(id: number, lang: Lang): Promise<MatchDetail | null> {
  const l10n = await localizer(lang);
  if (!hasApiKey()) {
    const m = sampleMatchDetail(id);
    return m ? (await withBroadcasts([l10n.match({ ...m, updatedAt: iso(Date.now()) })]))[0] : null;
  }

  const fx = await apiFootball<AfFixture[]>('/fixtures', { id }, TTL.live);
  const fixture = fx.data[0];
  if (!fixture) return null;
  const match = toMatch(fixture);
  const live = isInPlay(match.status);

  const [events, lineups] = await Promise.all([
    match.status === 'scheduled'
      ? Promise.resolve({ data: [] as AfEvent[], fetchedAt: fx.fetchedAt })
      : apiFootball<AfEvent[]>('/fixtures/events', { fixture: id }, live ? TTL.eventsLive : TTL.eventsDone),
    apiFootball<AfLineup[]>('/fixtures/lineups', { fixture: id }, TTL.lineups),
  ]);

  const detail: MatchDetail = l10n.match({
    ...match,
    events: events.data.map(toEvent).sort((a, b) => b.minute - a.minute),
    lineups: lineups.data.map(toLineup),
    updatedAt: iso(Math.min(fx.fetchedAt, events.fetchedAt, lineups.fetchedAt)),
  });
  return (await withBroadcasts([detail]))[0];
}

/** Team page: profile, form, upcoming schedule, recent results and an update story. */
export async function getTeam(id: number, lang: Lang): Promise<TeamDetail | null> {
  const l10n = await localizer(lang);
  if (!hasApiKey()) {
    const s = sampleTeam(id);
    if (!s) return null;
    return localizeTeam({ ...s, updatedAt: iso(Date.now()), sample: true }, l10n);
  }

  const [info, next, last] = await Promise.all([
    apiFootball<AfTeam[]>('/teams', { id }, TTL.team),
    apiFootball<AfFixture[]>('/fixtures', { team: id, next: 10 }, TTL.teamFixtures),
    apiFootball<AfFixture[]>('/fixtures', { team: id, last: 10 }, TTL.teamFixtures),
  ]);
  const t = info.data[0];
  if (!t) return null;

  const upcoming = next.data.map(toMatch).sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const recent = last.data.map(toMatch).sort((a, b) => b.kickoff.localeCompare(a.kickoff));
  return localizeTeam(
    {
      team: { id: t.team.id, name: t.team.name, logo: t.team.logo, country: t.team.country, founded: t.team.founded, venue: t.venue?.name ?? null },
      form: recent.slice(0, 5).map((m) => resultFor(m, id)).filter((r): r is NonNullable<typeof r> => r !== null),
      upcoming,
      recent,
      story: buildStory(id, recent, upcoming),
      updatedAt: iso(Math.min(info.fetchedAt, next.fetchedAt, last.fetchedAt)),
      sample: false,
    },
    l10n,
  );
}

function localizeTeam(d: TeamDetail, l10n: Awaited<ReturnType<typeof localizer>>): TeamDetail {
  return {
    ...d,
    team: l10n.team(d.team),
    upcoming: d.upcoming.map(l10n.match),
    recent: d.recent.map(l10n.match),
    story: buildStory(d.team.id, d.recent.map(l10n.match), d.upcoming.map(l10n.match)),
  };
}

export async function getLeagues(country: string | null, lang: Lang): Promise<CountryLeagues[]> {
  const l10n = await localizer(lang);
  let list: CountryLeagues[];
  if (!hasApiKey()) {
    list = sampleLeagues();
  } else {
    const raw = await apiFootball<AfLeague[]>('/leagues', { current: 'true' }, TTL.leagues);
    const byCountry = new Map<string, CountryLeagues>();
    for (const r of raw.data as AfLeague[]) {
      if (!isShownLeague(r.league.id)) continue;
      const c = byCountry.get(r.country.name) ?? { country: r.country.name, code: r.country.code, flag: r.country.flag, leagues: [] };
      c.leagues.push({ id: r.league.id, name: r.league.name, country: r.country.name, countryCode: r.country.code, flag: r.country.flag, logo: r.league.logo ?? null });
      byCountry.set(r.country.name, c);
    }
    list = [...byCountry.values()];
  }
  // Same ordering rule as the schedule: viewer's country, then international, then others.
  const ordered = orderGroups(
    list.map((c) => ({ league: c.leagues[0], matches: [], _c: c })),
    country,
  ) as unknown as { _c: CountryLeagues }[];
  return ordered.map((o) => ({ ...o._c, leagues: o._c.leagues.map(l10n.league) }));
}
