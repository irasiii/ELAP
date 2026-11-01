import { describe, expect, it } from 'vitest';
import { COUNTRIES, countryByApiName, countryByCode, curatedLeagueIds, leagueTier, orderGroups } from '@elap/core';
import type { League } from '@elap/core';

const league = (id: number, country: string): League => ({
  id,
  name: `League ${id}`,
  country,
  countryCode: null,
  flag: null,
  logo: null,
});

describe('country lookup', () => {
  it('finds countries by ISO code, case-insensitively', () => {
    expect(countryByCode('SA')?.apiName).toBe('Saudi-Arabia');
    expect(countryByCode('sa')?.code).toBe('SA');
    expect(countryByCode('ZZ')).toBeUndefined();
    expect(countryByCode(null)).toBeUndefined();
  });

  it('finds countries by the name API-Football returns, ignoring case and separators', () => {
    expect(countryByApiName('Saudi-Arabia')?.code).toBe('SA');
    expect(countryByApiName('saudi arabia')?.code).toBe('SA');
    expect(countryByApiName('Saudi_Arabia')?.code).toBe('SA');
    expect(countryByApiName('Atlantis')).toBeUndefined();
  });

  it('has unique country codes', () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe('curatedLeagueIds', () => {
  it('contains domestic and international competitions', () => {
    const ids = curatedLeagueIds();
    expect(ids.has(307)).toBe(true); // Saudi Pro League
    expect(ids.has(233)).toBe(true); // Egyptian Premier League
    expect(ids.has(2)).toBe(true); // Champions League
    expect(ids.has(999_999)).toBe(false);
  });
});

describe('leagueTier', () => {
  it('puts the viewer country first', () => {
    expect(leagueTier(league(307, 'Saudi-Arabia'), 'SA')).toBe('local');
    expect(leagueTier(league(999, 'Saudi-Arabia'), 'SA')).toBe('local');
    expect(leagueTier(league(307, 'Saudi-Arabia'), null)).toBe('other');
  });

  it('marks international competitions', () => {
    expect(leagueTier(league(2, 'World'), 'SA')).toBe('international');
    expect(leagueTier(league(1, 'World'), null)).toBe('international');
  });

  it('marks everything else as other', () => {
    expect(leagueTier(league(39, 'England'), 'SA')).toBe('other');
  });
});

describe('orderGroups', () => {
  it('orders local, then international, then other', () => {
    const groups = [
      { league: league(39, 'England'), matches: [] }, // other
      { league: league(2, 'World'), matches: [] }, // international
      { league: league(504, 'Saudi-Arabia'), matches: [] }, // local, second in SA list
      { league: league(307, 'Saudi-Arabia'), matches: [] }, // local, first in SA list
    ];
    expect(orderGroups(groups, 'SA').map((g) => [g.tier, g.league.id])).toEqual([
      ['local', 307],
      ['local', 504],
      ['international', 2],
      ['other', 39],
    ]);
  });

  it('does not mutate the input', () => {
    const groups = [{ league: league(39, 'England'), matches: [] }];
    orderGroups(groups, 'SA');
    expect(groups).toEqual([{ league: league(39, 'England'), matches: [] }]);
  });
});
