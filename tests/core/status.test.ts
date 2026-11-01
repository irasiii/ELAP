import { describe, expect, it } from 'vitest';
import { eventLabel, hasScore, isInPlay, mapApiStatus, statusLabel } from '@elap/core';
import type { MatchStatus } from '@elap/core';

describe('mapApiStatus', () => {
  it.each<[string | null | undefined, MatchStatus]>([
    ['1H', 'live'],
    ['2H', 'live'],
    ['ET', 'live'],
    ['BT', 'live'],
    ['P', 'live'],
    ['LIVE', 'live'],
    ['INT', 'live'],
    ['HT', 'halftime'],
    ['FT', 'finished'],
    ['AET', 'finished'],
    ['PEN', 'finished'],
    ['PST', 'postponed'],
    ['SUSP', 'postponed'],
    ['CANC', 'cancelled'],
    ['ABD', 'cancelled'],
    ['AWD', 'cancelled'],
    ['WO', 'cancelled'],
    ['NS', 'scheduled'],
    [null, 'scheduled'],
    [undefined, 'scheduled'],
  ])('maps %s to %s', (short, expected) => {
    expect(mapApiStatus(short)).toBe(expected);
  });
});

describe('isInPlay', () => {
  it('is true only for live and half-time', () => {
    expect(isInPlay('live')).toBe(true);
    expect(isInPlay('halftime')).toBe(true);
    expect(isInPlay('finished')).toBe(false);
    expect(isInPlay('scheduled')).toBe(false);
  });
});

describe('statusLabel', () => {
  it('adds the minute to live matches', () => {
    expect(statusLabel({ status: 'live', minute: 67 }, 'en')).toBe("Live 67'");
    expect(statusLabel({ status: 'live', minute: null }, 'en')).toBe('Live');
    expect(statusLabel({ status: 'halftime', minute: 45 }, 'fr')).toBe('Mi-temps');
  });
});

describe('hasScore', () => {
  it('needs a started match with both goals known', () => {
    expect(hasScore({ status: 'finished', score: { home: 2, away: 1 } })).toBe(true);
    expect(hasScore({ status: 'scheduled', score: { home: 0, away: 0 } })).toBe(false);
    expect(hasScore({ status: 'finished', score: { home: 2, away: null } })).toBe(false);
  });
});

describe('eventLabel', () => {
  it('distinguishes goal and card types', () => {
    expect(eventLabel({ type: 'goal', detail: 'Normal Goal' }, 'en')).toBe('Goal');
    expect(eventLabel({ type: 'goal', detail: 'Penalty' }, 'en')).toBe('Goal (penalty)');
    expect(eventLabel({ type: 'goal', detail: 'Own Goal' }, 'en')).toBe('Own goal');
    expect(eventLabel({ type: 'card', detail: 'Yellow Card' }, 'en')).toBe('Yellow card');
    expect(eventLabel({ type: 'card', detail: 'Red Card' }, 'en')).toBe('Red card');
    expect(eventLabel({ type: 'subst', detail: 'Substitution' }, 'en')).toBe('Substitution');
    expect(eventLabel({ type: 'var', detail: 'Goal cancelled' }, 'en')).toBe('VAR');
  });
});
