import 'server-only';
import { addDays } from '@elap/core';
import type { CountryLeagues, League, Match, MatchDetail, MatchStatus, TeamDetail } from '@elap/core';
import { buildStory, resultFor } from '@elap/core';
import { emptyBroadcast } from './normalize';

/**
 * Sample data used when API_FOOTBALL_KEY is not set, so the app runs out of the box.
 * Names are in English like the real API; data/names.json translates them, exactly as in production.
 * Statuses and scores follow the real clock, so some matches are live, some finished and some upcoming.
 */

type SampleLeague = League & { teams: [number, string][]; days?: number[] };

const LEAGUES: SampleLeague[] = [
  { id: 307, name: 'Pro League', country: 'Saudi-Arabia', countryCode: 'SA', flag: null, logo: null,
    teams: [[1001, 'Al-Hilal'], [1002, 'Al-Nassr'], [1003, 'Al-Ittihad'], [1004, 'Al-Ahli'], [1005, 'Al-Shabab'], [1006, 'Al-Ettifaq']] },
  { id: 233, name: 'Premier League', country: 'Egypt', countryCode: 'EG', flag: null, logo: null,
    teams: [[2001, 'Al Ahly'], [2002, 'Zamalek'], [2003, 'Pyramids FC'], [2004, 'Al Masry']] },
  { id: 200, name: 'Botola Pro', country: 'Morocco', countryCode: 'MA', flag: null, logo: null,
    teams: [[6001, 'Raja Casablanca'], [6002, 'Wydad AC'], [6003, 'FAR Rabat'], [6004, 'RS Berkane']] },
  { id: 39, name: 'Premier League', country: 'England', countryCode: 'GB', flag: null, logo: null,
    teams: [[3001, 'Liverpool'], [3002, 'Arsenal'], [3003, 'Manchester City'], [3004, 'Chelsea'], [3005, 'Tottenham'], [3006, 'Newcastle']] },
  { id: 140, name: 'La Liga', country: 'Spain', countryCode: 'ES', flag: null, logo: null,
    teams: [[4001, 'Real Madrid'], [4002, 'Barcelona'], [4003, 'Atletico Madrid'], [4004, 'Sevilla'], [4005, 'Getafe'], [4006, 'Valencia']] },
  { id: 135, name: 'Serie A', country: 'Italy', countryCode: 'IT', flag: null, logo: null,
    teams: [[5001, 'Juventus'], [5002, 'Napoli'], [5003, 'Inter'], [5004, 'AC Milan']] },
  { id: 188, name: 'A-League', country: 'Australia', countryCode: 'AU', flag: null, logo: null,
    teams: [[8001, 'Sydney FC'], [8002, 'Melbourne Victory'], [8003, 'Brisbane Roar'], [8004, 'Perth Glory']] },
  // International: Tuesdays and Wednesdays (UTC) only, with clubs from the domestic leagues above.
  { id: 2, name: 'UEFA Champions League', country: 'World', countryCode: null, flag: null, logo: null, days: [2, 3],
    teams: [[3001, 'Liverpool'], [4001, 'Real Madrid'], [5003, 'Inter'], [3002, 'Arsenal']] },
];

const KICKOFF_HOURS_UTC = [9, 12, 14, 15, 17, 18, 19, 20];
const VENUES: Record<number, string> = { 1001: 'Kingdom Arena', 3001: 'Anfield', 4001: 'Santiago Bernabéu', 8003: 'Suncorp Stadium' };

const seedFor = (date: string) => Number(date.replace(/-/g, '')) % 9973;
const rand = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

function statusAt(kickoff: Date, now: Date): { status: MatchStatus; minute: number | null; played: number } {
  const mins = Math.floor((now.getTime() - kickoff.getTime()) / 60000);
  if (mins < 0) return { status: 'scheduled', minute: null, played: 0 };
  if (mins < 45) return { status: 'live', minute: mins + 1, played: mins + 1 };
  if (mins < 60) return { status: 'halftime', minute: null, played: 45 };
  if (mins < 105) return { status: 'live', minute: Math.min(90, mins - 14), played: mins - 14 };
  return { status: 'finished', minute: null, played: 90 };
}

const goalsBy = (played: number, seed: number) => Math.floor((Math.floor(rand(seed) * 4) * Math.min(played, 90)) / 90);

export function sampleFixtures(utcDate: string, now = new Date()): Match[] {
  const seed = seedFor(utcDate);
  const weekday = new Date(`${utcDate}T12:00:00Z`).getUTCDay();
  const out: Match[] = [];
  LEAGUES.forEach((league, li) => {
    if (league.days && !league.days.includes(weekday)) return;
    const n = league.teams.length;
    const pairs = Math.max(1, Math.floor(n / 2) - Math.floor(rand(seed + li) * 2));
    // Round-robin ("circle method"): each day is a new round, so opponents rotate and nobody plays twice a day.
    const dayNo = Math.floor(Date.parse(`${utcDate}T00:00:00Z`) / 86_400_000);
    const round = (dayNo + li) % (n - 1);
    const circle = [0, ...Array.from({ length: n - 1 }, (_, i) => 1 + ((i + round) % (n - 1)))];
    for (let p = 0; p < pairs; p++) {
      const a = league.teams[circle[p]];
      const b = league.teams[circle[n - 1 - p]];
      const [home, away] = (dayNo + p) % 2 ? [a, b] : [b, a];
      const hour = KICKOFF_HOURS_UTC[(li * 2 + p + seed) % KICKOFF_HOURS_UTC.length];
      const kickoff = new Date(`${utcDate}T${String(hour).padStart(2, '0')}:${p % 2 ? '30' : '00'}:00Z`);
      const id = Number(`${utcDate.replace(/-/g, '').slice(2)}${li}${p}`);
      const s = statusAt(kickoff, now);
      out.push({
        id,
        kickoff: kickoff.toISOString(),
        status: s.status,
        minute: s.minute,
        home: { id: home[0], name: home[1], logo: null },
        away: { id: away[0], name: away[1], logo: null },
        score: s.status === 'scheduled' ? { home: null, away: null } : { home: goalsBy(s.played, id), away: goalsBy(s.played, id + 7) },
        league: { id: league.id, name: league.name, country: league.country, countryCode: league.countryCode, flag: null, logo: null },
        round: null,
        venue: VENUES[home[0]] ?? null,
        broadcast: emptyBroadcast(),
      });
    }
  });
  return out;
}

/** Sample match IDs encode their UTC date (yyMMdd + league index + pair index). */
export function sampleMatchDetail(id: number, now = new Date()): Omit<MatchDetail, 'updatedAt'> | null {
  const s = String(id);
  if (s.length < 8) return null;
  const date = `20${s.slice(0, 2)}-${s.slice(2, 4)}-${s.slice(4, 6)}`;
  const match = sampleFixtures(date, now).find((m) => m.id === id);
  if (!match) return null;

  const events: MatchDetail['events'] = [];
  for (let g = 0; g < (match.score.home ?? 0); g++) {
    events.push({ minute: 12 + g * 23, extra: null, teamId: match.home.id, type: 'goal', detail: 'Normal Goal', player: null });
  }
  for (let g = 0; g < (match.score.away ?? 0); g++) {
    events.push({ minute: 30 + g * 19, extra: null, teamId: match.away.id, type: 'goal', detail: 'Normal Goal', player: null });
  }
  if (match.status !== 'scheduled') {
    events.push({ minute: 38, extra: null, teamId: match.away.id, type: 'card', detail: 'Yellow Card', player: null });
  }
  events.sort((a, b) => b.minute - a.minute);

  const xi = () =>
    Array.from({ length: 11 }, (_, i) => ({ name: `Player ${i + 1}`, number: i + 1, pos: i === 0 ? 'G' : i < 5 ? 'D' : i < 8 ? 'M' : 'F' }));

  return {
    ...match,
    events,
    lineups: [
      { teamId: match.home.id, formation: '4-3-3', coach: null, startXI: xi(), substitutes: [] },
      { teamId: match.away.id, formation: '4-2-3-1', coach: null, startXI: xi(), substitutes: [] },
    ],
  };
}

export function sampleTeam(teamId: number, now = new Date()): Omit<TeamDetail, 'updatedAt' | 'sample'> | null {
  const entry = LEAGUES.flatMap((l) => l.teams.map((t) => ({ t, l }))).find((x) => x.t[0] === teamId);
  if (!entry) return null;
  const today = now.toISOString().slice(0, 10);
  const all: Match[] = [];
  for (let d = -21; d <= 21; d++) {
    all.push(...sampleFixtures(addDays(today, d), now).filter((m) => m.home.id === teamId || m.away.id === teamId));
  }
  const recent = all.filter((m) => m.status === 'finished').sort((a, b) => b.kickoff.localeCompare(a.kickoff)).slice(0, 10);
  const upcoming = all.filter((m) => m.status !== 'finished').sort((a, b) => a.kickoff.localeCompare(b.kickoff)).slice(0, 10);
  return {
    team: { id: teamId, name: entry.t[1], logo: null, country: entry.l.country, founded: null, venue: VENUES[teamId] ?? null },
    form: recent.slice(0, 5).map((m) => resultFor(m, teamId)).filter((r): r is NonNullable<typeof r> => r !== null),
    upcoming,
    recent,
    story: buildStory(teamId, recent, upcoming),
  };
}

export function sampleLeagues(): CountryLeagues[] {
  return LEAGUES.map((l) => ({
    country: l.country,
    code: l.countryCode,
    flag: null,
    leagues: [{ id: l.id, name: l.name, country: l.country, countryCode: l.countryCode, flag: null, logo: null }],
  }));
}
