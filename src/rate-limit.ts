// Fixed-window, in-memory rate limiter. Good enough for a single instance;
// counts reset when the process restarts.
export const createRateLimiter = (limit: number, windowMs: number) => {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (key: string, now = Date.now()) => {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      // Drop expired entries so the map doesn't grow without bound
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    entry.count++;
    return entry.count <= limit;
  };
};
