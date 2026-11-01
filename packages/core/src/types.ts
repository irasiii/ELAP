/** Shared data shapes used by the ELAP backend, website and mobile apps. All times are ISO-8601 in UTC. */

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'halftime'
  | 'finished'
  | 'postponed'
  | 'cancelled';

export interface Team {
  id: number;
  name: string;
  logo: string | null;
}

export interface League {
  id: number;
  name: string;
  country: string;
  countryCode: string | null;
  flag: string | null;
  logo: string | null;
}

export interface WatchLink {
  /** Country where this service holds the rights, e.g. "Saudi Arabia". */
  country: string;
  /** Official broadcaster or streaming service name. */
  service: string;
  /** Official page where viewers can watch. */
  url: string;
}

export interface Broadcast {
  channel: string | null;
  commentator: string | null;
  watch: WatchLink[];
  /** HLS URL for a stream ELAP holds the rights to. Leave null unless licensed. */
  licensedStreamUrl: string | null;
}

export interface Match {
  id: number;
  kickoff: string;
  status: MatchStatus;
  /** Elapsed minute while live, otherwise null. */
  minute: number | null;
  home: Team;
  away: Team;
  score: { home: number | null; away: number | null };
  league: League;
  round: string | null;
  venue: string | null;
  broadcast: Broadcast;
}

export type EventType = 'goal' | 'card' | 'subst' | 'var';

export interface MatchEvent {
  minute: number;
  extra: number | null;
  teamId: number;
  type: EventType;
  /** e.g. "Normal Goal", "Yellow Card", "Penalty". */
  detail: string;
  player: string | null;
}

export interface LineupPlayer {
  name: string;
  number: number | null;
  pos: string | null;
}

export interface Lineup {
  teamId: number;
  formation: string | null;
  coach: string | null;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface MatchDetail extends Match {
  events: MatchEvent[];
  lineups: Lineup[];
  updatedAt: string;
}

/** Where a competition sits for this viewer: their own country's first, then international, then the rest. */
export type LeagueTier = 'local' | 'international' | 'other';

export interface LeagueGroup {
  league: League;
  tier: LeagueTier;
  matches: Match[];
}

export interface FixturesResponse {
  date: string;
  timezone: string;
  /** ISO-3166 alpha-2 country used to order competitions, or null if unknown. */
  country: string | null;
  lang: string;
  /** When the underlying data was last fetched from the provider (ISO, UTC). */
  updatedAt: string;
  /** True when no API key is configured and sample data is being served. */
  sample: boolean;
  groups: LeagueGroup[];
}

export type FormResult = 'W' | 'D' | 'L';

/** One entry in a team's update story. Text is built on the device in the viewer's language. */
export interface TeamUpdate {
  kind: 'result' | 'live' | 'next';
  at: string;
  matchId: number;
  opponent: Team;
  home: boolean;
  leagueName: string;
  goalsFor: number | null;
  goalsAgainst: number | null;
  result: FormResult | null;
}

export interface TeamDetail {
  team: Team & { country: string | null; founded: number | null; venue: string | null };
  form: FormResult[];
  upcoming: Match[];
  recent: Match[];
  story: TeamUpdate[];
  updatedAt: string;
  sample: boolean;
}

export interface CountryLeagues {
  country: string;
  code: string | null;
  flag: string | null;
  leagues: League[];
}
