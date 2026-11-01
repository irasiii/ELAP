import { formatKickoff, formatShortDate } from './time';
import type { Lang } from './i18n';
import type { FormResult, Match, TeamUpdate } from './types';

export function resultFor(match: Match, teamId: number): FormResult | null {
  if (match.status !== 'finished' || match.score.home == null || match.score.away == null) return null;
  const mine = match.home.id === teamId ? match.score.home : match.score.away;
  const theirs = match.home.id === teamId ? match.score.away : match.score.home;
  return mine > theirs ? 'W' : mine < theirs ? 'L' : 'D';
}

/** Builds a team's update story from its recent, live and next matches (newest first). */
export function buildStory(teamId: number, recent: Match[], upcoming: Match[]): TeamUpdate[] {
  const toUpdate = (m: Match, kind: TeamUpdate['kind']): TeamUpdate => {
    const home = m.home.id === teamId;
    return {
      kind,
      at: m.kickoff,
      matchId: m.id,
      opponent: home ? m.away : m.home,
      home,
      leagueName: m.league.name,
      goalsFor: home ? m.score.home : m.score.away,
      goalsAgainst: home ? m.score.away : m.score.home,
      result: resultFor(m, teamId),
    };
  };
  const live = upcoming.filter((m) => m.status === 'live' || m.status === 'halftime').map((m) => toUpdate(m, 'live'));
  const next = upcoming.filter((m) => m.status === 'scheduled').slice(0, 1).map((m) => toUpdate(m, 'next'));
  const results = recent.filter((m) => m.status === 'finished').slice(0, 5).map((m) => toUpdate(m, 'result'));
  return [...live, ...next, ...results];
}

const verbs: Record<Lang, Record<FormResult, string>> = {
  ar: { W: 'فاز على', D: 'تعادل مع', L: 'خسر أمام' },
  en: { W: 'Beat', D: 'Drew with', L: 'Lost to' },
  fr: { W: 'Victoire contre', D: 'Match nul contre', L: 'Défaite contre' },
};

/** One-line story text in the viewer's language. */
export function storyText(u: TeamUpdate, lang: Lang, timeZone: string): string {
  const where = u.home
    ? { ar: 'على أرضه', en: 'at home', fr: 'à domicile' }[lang]
    : { ar: 'خارج أرضه', en: 'away', fr: "à l'extérieur" }[lang];
  const score = `${u.goalsFor ?? 0}-${u.goalsAgainst ?? 0}`;
  if (u.kind === 'live') {
    return {
      ar: `مباشر الآن: ${score} ضد ${u.opponent.name} (${u.leagueName})`,
      en: `Live now: ${score} vs ${u.opponent.name} (${u.leagueName})`,
      fr: `En direct : ${score} contre ${u.opponent.name} (${u.leagueName})`,
    }[lang];
  }
  if (u.kind === 'next') {
    const when = `${formatShortDate(u.at, timeZone, lang)} ${formatKickoff(u.at, timeZone, lang)}`;
    return {
      ar: `المباراة القادمة: ضد ${u.opponent.name} ${where} · ${when} (${u.leagueName})`,
      en: `Next: ${u.opponent.name} ${where} · ${when} (${u.leagueName})`,
      fr: `Prochain match : ${u.opponent.name} ${where} · ${when} (${u.leagueName})`,
    }[lang];
  }
  return `${verbs[lang][u.result ?? 'D']} ${u.opponent.name} ${score} ${where} (${u.leagueName})`;
}
