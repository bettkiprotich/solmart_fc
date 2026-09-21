type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
const WINDOW_MS = 60_000;
const MAX_ENTRIES = 5_000;

export function checkRateLimit(key: string, limit = 20, windowMs = WINDOW_MS) {
  const bucketKey = windowMs === WINDOW_MS ? key : `window:${windowMs}:${key}`;
  const now = Date.now();
  const existing = buckets.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    prune(now);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function prune(now: number) {
  if (buckets.size <= MAX_ENTRIES) return;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
    if (buckets.size <= MAX_ENTRIES) break;
  }
}

// Backward-compatible boolean helper for existing callers.
export function rateLimit(key: string, limit = 20, windowMs = WINDOW_MS): boolean {
  return checkRateLimit(key, limit, windowMs).allowed;
}
