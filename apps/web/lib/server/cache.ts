import 'server-only';

/**
 * In-memory TTL cache with in-flight de-duplication.
 * Caps API-Football usage: however many people open the app, each key is fetched at most once per TTL.
 * Swap for Redis (e.g. Upstash) when running more than one server instance.
 */
type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
const MAX_ENTRIES = 2000;

export async function cached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as T;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const p = load()
    .then((value) => {
      if (store.size >= MAX_ENTRIES) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
      return value;
    })
    .catch((err) => {
      // Serve stale data if we have it rather than failing the page.
      if (hit) return hit.value as T;
      throw err;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, p);
  return p;
}
