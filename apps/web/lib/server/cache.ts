import 'server-only';

/**
 * In-memory TTL cache with in-flight de-duplication.
 * Caps API-Football usage: however many people open the app, each key is fetched at most once per TTL.
 * Each value carries the time it was fetched, which the apps show as "Last updated".
 * Swap for Redis (e.g. Upstash) when running more than one server instance.
 */
export interface Timed<T> {
  data: T;
  fetchedAt: number;
}

type Entry = { value: Timed<unknown>; expires: number };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<Timed<unknown>>>();
const MAX_ENTRIES = 2000;

export async function cachedTimed<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<Timed<T>> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as Timed<T>;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<Timed<T>>;

  const p = load()
    .then((data) => {
      const value: Timed<T> = { data, fetchedAt: Date.now() };
      if (store.size >= MAX_ENTRIES) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
      return value;
    })
    .catch((err) => {
      // Serve stale data (with its real fetch time) rather than failing the page.
      if (hit) return hit.value as Timed<T>;
      throw err;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, p as Promise<Timed<unknown>>);
  return p;
}

export async function cached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  return (await cachedTimed(key, ttlSeconds, load)).data;
}
