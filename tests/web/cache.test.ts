import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cached, cachedTimed } from '@/lib/server/cache';

const START = new Date('2026-01-01T00:00:00Z').getTime();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(START);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('cached / cachedTimed', () => {
  it('loads once and serves the cached value within the TTL', async () => {
    const load = vi.fn(async () => 'value');
    expect(await cached('hit', 60, load)).toBe('value');
    expect(await cached('hit', 60, load)).toBe('value');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('reloads after the TTL expires', async () => {
    const load = vi.fn(async () => 'fresh');
    await cached('expiry', 10, load);
    vi.setSystemTime(START + 10_001);
    await cached('expiry', 10, load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('keeps keys separate', async () => {
    expect(await cached('a', 60, async () => 1)).toBe(1);
    expect(await cached('b', 60, async () => 2)).toBe(2);
  });

  it('de-duplicates concurrent loads of the same key', async () => {
    let resolve!: (value: string) => void;
    const load = vi.fn(
      () =>
        new Promise<string>((r) => {
          resolve = r;
        }),
    );
    const first = cached('inflight', 60, load);
    const second = cached('inflight', 60, load);
    resolve('one result');
    expect(await Promise.all([first, second])).toEqual(['one result', 'one result']);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('records when the value was fetched', async () => {
    const timed = await cachedTimed('timed', 60, async () => ({ n: 1 }));
    expect(timed.data).toEqual({ n: 1 });
    expect(timed.fetchedAt).toBe(START);
  });

  it('serves stale data when a refresh fails', async () => {
    await cached('stale', 10, async () => 'old');
    vi.setSystemTime(START + 60_000);
    const timed = await cachedTimed('stale', 10, async () => {
      throw new Error('upstream down');
    });
    expect(timed.data).toBe('old');
    expect(timed.fetchedAt).toBe(START);
  });

  it('propagates the error when there is no stale value', async () => {
    await expect(
      cached('missing', 10, async () => {
        throw new Error('upstream down');
      }),
    ).rejects.toThrow('upstream down');
  });
});
