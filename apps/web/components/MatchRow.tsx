import Link from 'next/link';
import { formatShortDate, isInPlay, statusLabel, t } from '@elap/core';
import type { Lang, Match } from '@elap/core';
import { Crest } from './Crest';
import { Score } from './Score';

export function MatchRow({
  match,
  timeZone,
  lang,
  showDate = false,
}: {
  match: Match;
  timeZone: string;
  lang: Lang;
  /** Show the match date instead of channel (team schedules span many days). */
  showDate?: boolean;
}) {
  const live = isInPlay(match.status);
  const side = showDate
    ? `${formatShortDate(match.kickoff, timeZone, lang)} · ${match.league.name}`
    : [match.broadcast.channel, match.broadcast.commentator].filter(Boolean).join(' · ') || t('unknown', lang);

  return (
    <Link href={`/match/${match.id}`} className="match-row">
      <span className="team">
        <Crest team={match.home} />
        <span className="team-name">{match.home.name}</span>
      </span>
      <span className="center">
        <Score
          match={match}
          timeZone={timeZone}
          lang={lang}
          className={`score${live ? ' is-live' : ''}${match.status === 'finished' ? ' is-done' : ''}`}
        />
        <span className={`chip${live ? ' chip-live' : ''}`}>{statusLabel(match, lang)}</span>
      </span>
      <span className="team team-away">
        <span className="team-name">{match.away.name}</span>
        <Crest team={match.away} />
      </span>
      <span className="channel">{side}</span>
    </Link>
  );
}
