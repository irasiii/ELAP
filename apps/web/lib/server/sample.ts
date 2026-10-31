import 'server-only';
import type { CountryLeagues, League, Match, MatchDetail, MatchStatus } from '@elap/core';
import { emptyBroadcast } from './normalize';

/**
 * Sample data used when API_FOOTBALL_KEY is not set, so the app runs out of the box.
 * Fixtures are generated for any UTC date; statuses and scores follow the real clock,
 * so some matches are live, some finished and some upcoming.
 */

const LEAGUES: (League & { teams: [number, string][] })[] = [
  { id: 307, name: 'دوري روشن السعودي', country: 'Saudi Arabia', countryCode: 'SA', flag: null, logo: null,
    teams: [[1001, 'الهلال'], [1002, 'النصر'], [1003, 'الاتحاد'], [1004, 'الأهلي'], [1005, 'الشباب'], [1006, 'الاتفاق']] },
  { id: 233, name: 'الدوري المصري الممتاز', country: 'Egypt', countryCode: 'EG', flag: null, logo: null,
    teams: [[2001, 'الأهلي'], [2002, 'الزمالك'], [2003, 'بيراميدز'], [2004, 'المصري']] },
  { id: 39, name: 'الدوري الإنجليزي الممتاز', country: 'England', countryCode: 'GB', flag: null, logo: null,
    teams: [[3001, 'ليفربول'], [3002, 'أرسنال'], [3003, 'مانشستر سيتي'], [3004, 'تشيلسي'], [3005, 'توتنهام'], [3006, 'نيوكاسل']] },
  { id: 140, name: 'الدوري الإسباني', country: 'Spain', countryCode: 'ES', flag: null, logo: null,
    teams: [[4001, 'ريال مدريد'], [4002, 'برشلونة'], [4003, 'أتلتيكو مدريد'], [4004, 'إشبيلية'], [4005, 'خيتافي'], [4006, 'فالنسيا']] },
  { id: 135, name: 'الدوري الإيطالي', country: 'Italy', countryCode: 'IT', flag: null, logo: null,
    teams: [[5001, 'يوفنتوس'], [5002, 'نابولي'], [5003, 'إنتر'], [5004, 'ميلان']] },
  { id: 200, name: 'البطولة الوطنية المغربية', country: 'Morocco', countryCode: 'MA', flag: null, logo: null,
    teams: [[6001, 'الرجاء'], [6002, 'الوداد'], [6003, 'الجيش الملكي'], [6004, 'نهضة بركان']] },
];

const KICKOFF_HOURS_UTC = [12, 14, 15, 17, 18, 19, 20];

function seedFor(date: string): number {
  return Number(date.replace(/-/g, '')) % 9973;
}

function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function statusAt(kickoff: Date, now: Date): { status: MatchStatus; minute: number | null; played: number } {
  const mins = Math.floor((now.getTime() - kickoff.getTime()) / 60000);
  if (mins < 0) return { status: 'scheduled', minute: null, played: 0 };
  if (mins < 45) return { status: 'live', minute: mins + 1, played: mins + 1 };
  if (mins < 60) return { status: 'halftime', minute: null, played: 45 };
  if (mins < 105) return { status: 'live', minute: Math.min(90, mins - 14), played: mins - 14 };
  return { status: 'finished', minute: null, played: 90 };
}

function goalsBy(played: number, seed: number): number {
  const total = Math.floor(rand(seed) * 4);
  return Math.floor((total * Math.min(played, 90)) / 90);
}

export function sampleFixtures(utcDate: string, now = new Date()): Match[] {
  const seed = seedFor(utcDate);
  const out: Match[] = [];
  LEAGUES.forEach((league, li) => {
    const pairs = Math.max(1, Math.floor(league.teams.length / 2) - (Math.floor(rand(seed + li) * 2)));
    // One rotation per league per day, so no team plays twice on the same day.
    const rot = (seed + li) % league.teams.length;
    for (let p = 0; p < pairs; p++) {
      const home = league.teams[(rot + p * 2) % league.teams.length];
      const away = league.teams[(rot + p * 2 + 1) % league.teams.length];
      if (home[0] === away[0]) continue;
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
        score:
          s.status === 'scheduled'
            ? { home: null, away: null }
            : { home: goalsBy(s.played, id), away: goalsBy(s.played, id + 7) },
        league: { id: league.id, name: league.name, country: league.country, countryCode: league.countryCode, flag: null, logo: null },
        round: 'الجولة 11',
        venue: null,
        broadcast: emptyBroadcast(),
      });
    }
  });
  return out;
}

/** Sample match IDs encode their UTC date (yyMMdd + league index + pair index). */
export function sampleMatchDetail(id: number, now = new Date()): MatchDetail | null {
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

  const xi = (prefix: string) =>
    Array.from({ length: 11 }, (_, i) => ({ name: `${prefix} ${i + 1}`, number: i + 1, pos: i === 0 ? 'G' : i < 5 ? 'D' : i < 8 ? 'M' : 'F' }));

  return {
    ...match,
    venue: 'ملعب تجريبي',
    events,
    lineups: [
      { teamId: match.home.id, formation: '4-3-3', coach: null, startXI: xi('لاعب'), substitutes: [] },
      { teamId: match.away.id, formation: '4-2-3-1', coach: null, startXI: xi('لاعب'), substitutes: [] },
    ],
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
