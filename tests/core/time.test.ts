import { describe, expect, it } from 'vitest';
import { addDays, dateForDay, formatKickoff, formatUpdated, isIsoDate, localDate } from '@elap/core';

describe('localDate', () => {
  it('returns the calendar date in the requested timezone', () => {
    expect(localDate('2026-01-01T00:30:00Z', 'America/New_York')).toBe('2025-12-31');
    expect(localDate('2026-01-01T00:30:00Z', 'Asia/Riyadh')).toBe('2026-01-01');
  });

  it('accepts a Date object', () => {
    expect(localDate(new Date('2026-06-15T23:00:00Z'), 'UTC')).toBe('2026-06-15');
  });
});

describe('dateForDay', () => {
  const now = new Date('2026-03-01T12:00:00Z');

  it('shifts by whole days in the viewer timezone', () => {
    expect(dateForDay('yesterday', 'UTC', now)).toBe('2026-02-28');
    expect(dateForDay('today', 'UTC', now)).toBe('2026-03-01');
    expect(dateForDay('tomorrow', 'UTC', now)).toBe('2026-03-02');
  });

  it('uses the local date near midnight', () => {
    const lateUtc = new Date('2026-03-01T23:30:00Z');
    expect(dateForDay('today', 'Asia/Riyadh', lateUtc)).toBe('2026-03-02');
  });
});

describe('addDays', () => {
  it('handles month, year and leap-day boundaries', () => {
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
  });
});

describe('isIsoDate', () => {
  it('accepts real YYYY-MM-DD dates only', () => {
    expect(isIsoDate('2026-11-01')).toBe(true);
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-2-3')).toBe(false);
    expect(isIsoDate('today')).toBe(false);
    expect(isIsoDate(null)).toBe(false);
  });
});

describe('formatting', () => {
  it('shows kickoff in the viewer timezone with western digits', () => {
    expect(formatKickoff('2026-01-01T18:30:00Z', 'UTC', 'en')).toBe('18:30');
    expect(formatKickoff('2026-01-01T18:30:00Z', 'Asia/Riyadh', 'ar')).toBe('21:30');
  });

  it('omits the date for an update from the same day', () => {
    const now = new Date('2026-01-01T12:00:00Z');
    expect(formatUpdated('2026-01-01T10:42:00Z', 'UTC', 'en', now)).toBe('10:42');
  });

  it('adds a date for an update from another day', () => {
    const now = new Date('2026-01-02T12:00:00Z');
    expect(formatUpdated('2026-01-01T22:05:00Z', 'UTC', 'en', now)).toContain('1 Jan');
  });
});
