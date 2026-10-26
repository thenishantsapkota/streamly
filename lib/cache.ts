/**
 * Tiny in-process TTL cache for upstream API responses (TMDB, AniList,
 * Jikan). Stands in for Next's fetch revalidation: the same request within
 * `ttlMs` is served from memory, and concurrent identical requests share one
 * in-flight promise.
 */
const store = new Map<string, { at: number; value: Promise<unknown> }>();
const MAX_ENTRIES = 2000;

export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as Promise<T>;
  const value = load().catch((err) => {
    store.delete(key);
    throw err;
  });
  if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value!);
  store.set(key, { at: Date.now(), value });
  return value;
}

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
