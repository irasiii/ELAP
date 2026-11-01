import { describe, expect, it } from 'vitest';
import { buildStory, resultFor } from '@elap/core';
import type { Match, MatchStatus } from '@elap/core';

const TEAM_ID = 100;

function match(id: number, status: MatchStatus, homeGoals: number | null, awayGoals: number | null, kickoff = '2026-03-01T18:00:00Z'): Match {
  return {
    id,
    kickoff,
    status,
    minute: status === 'live' ? 30 : null,
    home: { id: TEAM_ID, name: 'Home FC', logo: null },
    away: { id: 200, name: 'Away FC', logo: null },
    score: { home: homeGoals, away: awayGoals },
    league: { id: 307, name: 'Pro League', country: 'Saudi-Arabia', countryCode: 'SA', flag: null, logo: null },
    round: null,
    venue: null,
    broadcast: { channel: null, commentator: null, watch: [], licensedStreamUrl: null },
  };
}

describe('resultFor', () => {
  it('returns W, D or L from the team point of view', () => {
    expect(resultFor(match(1, 'finished', 2, 1), TEAM_ID)).toBe('W');
    expect(resultFor(match(2, 'finished', 1, 1), TEAM_ID)).toBe('D');
    expect(resultFor(match(3, 'finished', 0, 3), TEAM_ID)).toBe('L');
  });

  it('works for the away team', () => {
    expect(resultFor(match(4, 'finished', 0, 3), 200)).toBe('W');
    expect(resultFor(match(5, 'finished', 2, 1), 200)).toBe('L');
  });

  it('returns null when the match has not finished or has no score', () => {
    expect(resultFor(match(6, 'live', 1, 0), TEAM_ID)).toBeNull();
    expect(resultFor(match(7, 'finished', null, null), TEAM_ID)).toBeNull();
  });
});

describe('buildStory', () => {
  const recent = [
    match(1, 'finished', 2, 1, '2026-02-20T18:00:00Z'),
    match(2, 'finished', 1, 1, '2026-02-13T18:00:00Z'),
    match(3, 'scheduled', null, null, '2026-02-27T18:00:00Z'),
  ];
  const upcoming = [
    match(4, 'live', 1, 0, '2026-03-01T18:00:00Z'),
    match(5, 'scheduled', null, null, '2026-03-08T18:00:00Z'),
    match(6, 'scheduled', null, null, '2026-03-15T18:00:00Z'),
  ];

  it('puts live first, then the next match, then recent results', () => {
    const story = buildStory(TEAM_ID, recent, upcoming);
    expect(story.map((u) => [u.kind, u.matchId])).toEqual([
      ['live', 4],
      ['next', 5],
      ['result', 1],
      ['result', 2],
    ]);
  });

  it('flips goals for an away match', () => {
    const away = match(8, 'finished', 3, 1);
    const [result] = buildStory(200, [away], []);
    expect(result.goalsFor).toBe(1);
    expect(result.goalsAgainst).toBe(3);
    expect(result.home).toBe(false);
    expect(result.opponent.id).toBe(TEAM_ID);
    expect(result.result).toBe('L');
  });

  it('keeps at most five results', () => {
    const many = Array.from({ length: 8 }, (_, i) => match(100 + i, 'finished', 1, 0));
    expect(buildStory(TEAM_ID, many, []).filter((u) => u.kind === 'result')).toHaveLength(5);
  });

  it('handles an empty history', () => {
    expect(buildStory(TEAM_ID, [], [])).toEqual([]);
  });
});
