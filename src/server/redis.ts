import { Redis } from '@upstash/redis';

// Lazy singleton — env vars are unavailable during the Next.js build step.
let _redis: Redis | null = null;

export function getRedis() {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _redis;
}

// Proxy keeps the `redis` export working at every call site without changes.
export const redis: Redis = new Proxy({} as Redis, {
  get(_target, prop, receiver) {
    return Reflect.get(getRedis(), prop, receiver);
  },
});

