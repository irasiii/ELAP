import { describe, expect, it } from 'vitest';
import { dir, isLang, matchLang, parseAcceptLanguage, t } from '@elap/core';

describe('isLang', () => {
  it('accepts the three supported languages only', () => {
    expect(isLang('ar')).toBe(true);
    expect(isLang('en')).toBe(true);
    expect(isLang('fr')).toBe(true);
    expect(isLang('de')).toBe(false);
    expect(isLang('AR')).toBe(false);
    expect(isLang(null)).toBe(false);
  });
});

describe('dir', () => {
  it('is right-to-left for Arabic only', () => {
    expect(dir('ar')).toBe('rtl');
    expect(dir('en')).toBe('ltr');
    expect(dir('fr')).toBe('ltr');
  });
});

describe('matchLang', () => {
  it('uses the first supported language tag', () => {
    expect(matchLang(['de-DE', 'ar-SA'])).toBe('ar');
    expect(matchLang(['fr-CA', 'en'])).toBe('fr');
    expect(matchLang([null, undefined, 'EN-gb'])).toBe('en');
  });

  it('falls back to Arabic', () => {
    expect(matchLang([])).toBe('ar');
    expect(matchLang(['de', 'es'])).toBe('ar');
  });
});

describe('parseAcceptLanguage', () => {
  it('sorts tags by quality', () => {
    expect(parseAcceptLanguage('en;q=0.5, ar;q=0.9, fr;q=0.1')).toEqual(['ar', 'en', 'fr']);
  });

  it('defaults missing quality to 1 and drops invalid entries', () => {
    expect(parseAcceptLanguage('fr, en;q=0.7')).toEqual(['fr', 'en']);
    expect(parseAcceptLanguage('xx;q=nope, en')).toEqual(['en']);
    expect(parseAcceptLanguage('')).toEqual([]);
    expect(parseAcceptLanguage(null)).toEqual([]);
  });
});

describe('t', () => {
  it('returns translations for every language', () => {
    expect(t('todayTitle', 'ar')).toBe('مباريات اليوم');
    expect(t('todayTitle', 'en')).toBe("Today's matches");
    expect(t('todayTitle', 'fr')).toBe("Matchs d'aujourd'hui");
  });

  it('defaults to Arabic', () => {
    expect(t('favourites')).toBe('المفضلة');
  });

  it('has the strings added for favourites and status pages', () => {
    for (const lang of ['ar', 'en', 'fr'] as const) {
      expect(t('addFavourite', lang)).not.toBe('');
      expect(t('noFavourites', lang)).not.toBe('');
      expect(t('notFound', lang)).not.toBe('');
      expect(t('watchLive', lang)).not.toBe('');
    }
  });
});
