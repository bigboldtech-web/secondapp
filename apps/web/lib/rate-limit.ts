interface Bucket {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, Bucket>>();

function storeFor(name: string): Map<string, Bucket> {
  let s = stores.get(name);
  if (!s) {
    s = new Map();
    stores.set(name, s);
  }
  return s;
}

function purgeExpired(store: Map<string, Bucket>, now: number): void {
  if (store.size < 512) return;
  for (const [k, v] of store.entries()) {
    if (v.resetAt <= now) store.delete(k);
  }
}

export interface RateLimitCheck {
  ok: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function rateLimit(options: {
  name: string;
  key: string;
  max: number;
  windowMs: number;
}): RateLimitCheck {
  const { name, key, max, windowMs } = options;
  const store = storeFor(name);
  const now = Date.now();
  purgeExpired(store, now);

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  if (existing.count >= max) {
    return {
      ok: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: max - existing.count,
    resetInSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function rateLimitAll(checks: Parameters<typeof rateLimit>[0][]): RateLimitCheck {
  let worst: RateLimitCheck | null = null;
  for (const c of checks) {
    const r = rateLimit(c);
    if (!r.ok) return r;
    if (!worst || r.remaining < worst.remaining) worst = r;
  }
  return worst ?? { ok: true, remaining: Number.POSITIVE_INFINITY, resetInSeconds: 0 };
}
