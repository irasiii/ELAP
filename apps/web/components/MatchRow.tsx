import Link from 'next/link';
import { isInPlay, statusLabel, t } from '@elap/core';
import type { Match } from '@elap/core';
import { Crest } from './Crest';
import { Score } from './Score';

export function MatchRow({ match, timeZone }: { match: Match; timeZone: string }) {
  const live = isInPlay(match.status);
  const channel = [match.broadcast.channel, match.broadcast.commentator].filter(Boolean).join(' · ');

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
          className={`score${live ? ' is-live' : ''}${match.status === 'finished' ? ' is-done' : ''}`}
        />
        <span className={`chip${live ? ' chip-live' : ''}`}>{statusLabel(match)}</span>
      </span>
      <span className="team team-away">
        <span className="team-name">{match.away.name}</span>
        <Crest team={match.away} />
      </span>
      <span className="channel">{channel || t('unknown')}</span>
    </Link>
  );
}
