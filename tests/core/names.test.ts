import { describe, expect, it } from 'vitest';
import { countryName, crestInitials } from '@elap/core';

describe('countryName', () => {
  it('translates known API country names', () => {
    expect(countryName('Saudi-Arabia', 'ar')).toBe('السعودية');
    expect(countryName('Saudi-Arabia', 'fr')).toBe('Arabie saoudite');
    expect(countryName('egypt', 'en')).toBe('Egypt');
  });

  it('treats the API "World" pseudo-country as international', () => {
    expect(countryName('World', 'ar')).toBe('دولي');
    expect(countryName('World', 'en')).toBe('International');
    expect(countryName('World', 'fr')).toBe('International');
  });

  it('cleans up unknown names', () => {
    expect(countryName('Unknown-Land', 'en')).toBe('Unknown Land');
  });
});

describe('crestInitials', () => {
  it('uses the first letters of Latin club names', () => {
    expect(crestInitials('Al Hilal')).toBe('AH');
    expect(crestInitials('Real Madrid')).toBe('RM');
    expect(crestInitials('Liverpool')).toBe('LI');
  });

  it('skips the Arabic article', () => {
    expect(crestInitials('الأهلي')).toBe('أ');
    expect(crestInitials('الزمالك')).toBe('ز');
  });

  it('never returns an empty label', () => {
    expect(crestInitials('')).toBe('?');
    expect(crestInitials('   ')).toBe('?');
  });
});
