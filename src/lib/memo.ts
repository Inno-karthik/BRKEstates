/** Tiny per-isolate stale-while-revalidate memo for public, rarely-changing reads (site settings,
 *  property types, locations). Supabase's API gateway adds 0.4–1.2s per call, and the same Worker
 *  isolate serves many requests — so after the first load these resolve instantly.
 *
 *  - younger than FRESH_MS: served as-is
 *  - younger than STALE_MS: served immediately, refreshed in the background (next view sees new data)
 *  - older / missing: loaded and awaited
 *  Failed loads are never cached. */
const FRESH_MS = 15_000;
const STALE_MS = 5 * 60_000;

type Entry = { at: number; value: unknown; refreshing?: boolean };
const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export function memo<A extends unknown[], T>(key: string, fn: (...args: A) => Promise<T>) {
  return async (...args: A): Promise<T> => {
    const k = key + JSON.stringify(args);
    const hit = store.get(k);
    const age = hit ? Date.now() - hit.at : Infinity;

    const load = () => {
      let p = inflight.get(k) as Promise<T> | undefined;
      if (!p) {
        p = fn(...args)
          .then((value) => {
            store.set(k, { at: Date.now(), value });
            return value;
          })
          .finally(() => inflight.delete(k));
        inflight.set(k, p);
      }
      return p;
    };

    if (hit && age < FRESH_MS) return hit.value as T;
    if (hit && age < STALE_MS) {
      if (!hit.refreshing) {
        hit.refreshing = true;
        load()
          .catch(() => {})
          .finally(() => {
            hit.refreshing = false;
          });
      }
      return hit.value as T;
    }
    return load();
  };
}
