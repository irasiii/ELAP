import { describe, expect, it } from 'vitest';
import { DEFAULT_TIMEZONE } from '@elap/core';
import { readId, readParams } from '@/lib/server/params';

const url = (qs: string) => new URL(`https://elap.app/api/fixtures${qs}`);

describe('readParams', () => {
  it('reads valid timezone, language and country', () => {
    expect(readParams(url('?tz=Asia/Riyadh&lang=en&country=sa'))).toEqual({
      timeZone: 'Asia/Riyadh',
      lang: 'en',
      country: 'SA',
    });
  });

  it('falls back to safe defaults', () => {
    expect(readParams(url(''))).toEqual({ timeZone: DEFAULT_TIMEZONE, lang: 'ar', country: null });
    expect(readParams(url('?tz=Mars/Olympus&lang=de&country=SAU'))).toEqual({
      timeZone: DEFAULT_TIMEZONE,
      lang: 'ar',
      country: null,
    });
  });

  it('uses the caller language fallback when lang is missing or invalid', () => {
    expect(readParams(url('?lang=xx'), 'fr').lang).toBe('fr');
    expect(readParams(url(''), 'en').lang).toBe('en');
  });
});

describe('readId', () => {
  it.each(['1', '42', '2147483647'])('accepts %s', (raw) => {
    expect(readId(raw)).toBe(Number(raw));
  });

  it.each(['0', '-1', '1.5', 'abc', '', '2147483648', '1e3'])('rejects %s', (raw) => {
    expect(readId(raw)).toBeNull();
  });
});
