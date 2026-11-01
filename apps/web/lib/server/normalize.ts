import 'server-only';
import { mapApiStatus } from '@elap/core';
import type { Broadcast, Lineup, Match, MatchEvent } from '@elap/core';

/* Minimal shapes of the API-Football v3 responses we read. */
export interface AfFixture {
  fixture: {
    id: number;
    date: string;
    venue?: { name?: string | null; city?: string | null } | null;
    status: { short: string; elapsed: number | null };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo?: string | null;
    flag?: string | null;
    round?: string | null;
  };
  teams: {
    home: { id: number; name: string; logo?: string | null };
    away: { id: number; name: string; logo?: string | null };
  };
  goals: { home: number | null; away: number | null };
}

export interface AfEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number };
  player: { name: string | null };
  type: string;
  detail: string;
}

export interface AfLineup {
  team: { id: number };
  formation: string | null;
  coach?: { name?: string | null } | null;
  startXI: { player: { name: string; number: number | null; pos: string | null } }[];
  substitutes: { player: { name: string; number: number | null; pos: string | null } }[];
}

export interface AfLeague {
  league: { id: number; name: string; logo?: string | null; type?: string };
  country: { name: string; code: string | null; flag: string | null };
}

export interface AfTeam {
  team: { id: number; name: string; country: string | null; founded: number | null; logo: string | null };
  venue: { name: string | null; city: string | null } | null;
}

export const emptyBroadcast = (): Broadcast => ({
  channel: null,
  commentator: null,
  watch: [],
  licensedStreamUrl: null,
});

export function toMatch(f: AfFixture): Match {
  const status = mapApiStatus(f.fixture.status.short);
  return {
    id: f.fixture.id,
    kickoff: new Date(f.fixture.date).toISOString(),
    status,
    minute: status === 'live' ? f.fixture.status.elapsed : null,
    home: { id: f.teams.home.id, name: f.teams.home.name, logo: f.teams.home.logo ?? null },
    away: { id: f.teams.away.id, name: f.teams.away.name, logo: f.teams.away.logo ?? null },
    score: { home: f.goals.home, away: f.goals.away },
    league: {
      id: f.league.id,
      name: f.league.name,
      country: f.league.country,
      countryCode: null,
      flag: f.league.flag ?? null,
      logo: f.league.logo ?? null,
    },
    round: f.league.round ?? null,
    venue: f.fixture.venue?.name ?? null,
    broadcast: emptyBroadcast(),
  };
}

export function toEvent(e: AfEvent): MatchEvent {
  const type: MatchEvent['type'] =
    e.type === 'Goal' ? 'goal' : e.type === 'Card' ? 'card' : e.type === 'subst' ? 'subst' : 'var';
  return {
    minute: e.time.elapsed,
    extra: e.time.extra,
    teamId: e.team.id,
    type,
    detail: e.detail,
    player: e.player.name,
  };
}

export function toLineup(l: AfLineup): Lineup {
  return {
    teamId: l.team.id,
    formation: l.formation,
    coach: l.coach?.name ?? null,
    startXI: l.startXI.map((p) => ({ name: p.player.name, number: p.player.number, pos: p.player.pos })),
    substitutes: l.substitutes.map((p) => ({ name: p.player.name, number: p.player.number, pos: p.player.pos })),
  };
}
