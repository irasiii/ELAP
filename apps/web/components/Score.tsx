import { formatKickoff, hasScore } from '@elap/core';
import type { Lang, Match } from '@elap/core';

/**
 * Score laid out in the page's reading direction, so each team's goals sit next to that team
 * (home on the right in Arabic, on the left in English/French). Before kickoff it shows the local kickoff time.
 */
export function Score({ match, timeZone, lang, className }: { match: Match; timeZone: string; lang: Lang; className?: string }) {
  if (!hasScore(match)) {
    return <span className={className} dir="ltr">{formatKickoff(match.kickoff, timeZone, lang)}</span>;
  }
  return (
    <span className={className} aria-label={`${match.home.name} ${match.score.home}, ${match.away.name} ${match.score.away}`}>
      <span className="score-parts">
        <span>{match.score.home}</span>
        <span aria-hidden="true">-</span>
        <span>{match.score.away}</span>
      </span>
    </span>
  );
}
