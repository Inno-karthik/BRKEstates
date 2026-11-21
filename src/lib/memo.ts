/** Tiny per-isolate TTL cache for public, rarely-changing reads (site settings, property types,
 *  locations). Supabase's API gateway adds 0.4–1.2s per call and one Worker isolate serves many
 *  requests, so repeat views skip the round-trip.
 *
 *  IMPORTANT (Cloudflare Workers): only RESOLVED VALUES are cached here. Never store or share a
 *  Promise (or fire a background refresh) across requests — a promise created by one request
 *  cannot settle for another once the first request ends ("This promise was created by a request
 *  that has since ended"), which surfaced as random 500s. Failed loads are not cached. */
const TTL_MS = 30_000;
const store = new Map<string, { at: number; value: unknown }>();

export function memo<A extends unknown[], T>(key: string, fn: (...args: A) => Promise<T>) {
  return async (...args: A): Promise<T> => {
    const k = key + JSON.stringify(args);
    const hit = store.get(k);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
    const value = await fn(...args);
    store.set(k, { at: Date.now(), value });
    return value;
  };
}
