import { Redis } from '@upstash/redis';

// Lazy Redis singleton (avoids build-time errors when env vars are absent)
let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _redis;
}

// Backward-compatible proxy so existing `redis.get(...)` calls continue to work
export const redis: Redis = new Proxy({} as Redis, {
  get(_, prop) {
    return (getRedis() as any)[prop];
  },
});

