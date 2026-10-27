import "server-only";
/** Blocks password guessing: 5 failures per handle per 15 minutes. In memory, so it resets on restart. */
const hits = new Map<string, { n: number; until: number }>();
const WINDOW = 15 * 60 * 1000, MAX = 5;
export function blocked(key: string) {
  const h = hits.get(key);
  if (h && h.until < Date.now()) { hits.delete(key); return false; }
  return !!h && h.n >= MAX;
}
export function fail(key: string) {
  const h = hits.get(key);
  hits.set(key, { n: (h && h.until >= Date.now() ? h.n : 0) + 1, until: Date.now() + WINDOW });
  if (hits.size > 5000) hits.clear();
}
export const clear = (key: string) => hits.delete(key);
