import { Redis } from '@upstash/redis';
import logger from './logger';

/**
 * Lazy Redis singleton with graceful degradation.
 * Deferred to first use so the module can be imported at build time when
 * environment variables are not yet available. When credentials are missing
 * at runtime, method calls silently no-op instead of crashing.
 */
let _redis: Redis | null | undefined; // undefined = not yet initialised

function getRedis(): Redis | null {
  if (_redis === undefined) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      logger.warn('Redis credentials not configured, caching disabled');
      _redis = null;
    } else {
      try {
        _redis = new Redis({ url, token });
      } catch (error) {
        logger.error({ err: error }, 'Failed to create Redis client, caching disabled');
        _redis = null;
      }
    }
  }
  return _redis;
}

/**
 * A no-op pipeline stand-in returned when Redis is unavailable.
 * All chainable method calls return the same proxy so consumers can do
 * `pipeline.pfadd(...).pfcount(...)` without crashing, and `exec()` resolves
 * to an empty array. Without this, the generic no-op below returns a Promise
 * for `redis.pipeline()`, and the follow-up `.pfadd(...)` call throws
 * `TypeError: pipeline.pfadd is not a function` at runtime (e.g. during the
 * `/api/views/sync` Vercel cron when KV env vars are missing).
 */
function createNoopPipeline() {
  const noopPipeline: unknown = new Proxy(() => undefined, {
    get(_target, prop) {
      if (prop === 'exec') {
        return async () => [];
      }
      // Any other method is chainable and returns the pipeline itself.
      return () => noopPipeline;
    },
    apply() {
      return noopPipeline;
    },
  });
  return noopPipeline;
}

/**
 * Numeric/counter Redis methods. When Redis is unavailable we must return `0`
 * (not `null`) because callers feed the result straight into arithmetic — e.g.
 * `rate-limit.ts` does `remaining: limit.requests - current` and sends the
 * value as an `X-RateLimit-Remaining` response header. Returning `null` coerces
 * to `NaN` in the header, which breaks clients parsing it.
 */
const NUMERIC_METHODS = new Set([
  'incr', 'incrby', 'decr', 'decrby',
  'pttl', 'ttl',
  'pfadd', 'pfcount',
  'exists', 'expire', 'pexpire',
  'sadd', 'srem', 'scard',
  'zadd', 'zrem', 'zcard',
  'hset', 'hdel', 'hlen',
  'lpush', 'rpush', 'llen',
  'del',
]);

export const redis: Redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedis();
    if (client) {
      const value = Reflect.get(client, prop);
      return typeof value === 'function' ? value.bind(client) : value;
    }
    // Graceful degradation when Redis is not configured.
    // `pipeline`/`multi` must return a chainable pipeline-like object so
    // callers like `redis.pipeline().pfadd(...).exec()` don't blow up.
    if (prop === 'pipeline' || prop === 'multi') {
      return () => createNoopPipeline();
    }
    // `scan` must return `[cursor, keys[]]` because callers destructure the
    // result (e.g. `const [newCursor, keys] = await redis.scan(...)` in
    // `syncViewCountsToDatabase`). Returning the generic `null` no-op below
    // would throw `TypeError: null is not iterable` and break the
    // `/api/views/sync` Vercel cron when KV env vars are missing. Return a
    // terminal cursor (0) and empty keys so the scan loop exits cleanly.
    if (prop === 'scan') {
      return async () => [0, []];
    }
    // Counter/numeric methods must resolve to `0` (not `null`) so downstream
    // arithmetic — e.g. `limit - current` in the rate limiter — doesn't
    // produce `NaN` values that leak into response headers.
    if (typeof prop === 'string' && NUMERIC_METHODS.has(prop)) {
      return async () => 0;
    }
    // Any other method call returns a no-op async function that resolves to
    // `null` (matches the contract of `redis.get` on a cache miss, so callers
    // like reactions.ts fall through to their database path cleanly).
    //
    // We intentionally do NOT log a warning per call: `getRedis()` already
    // logs once when credentials are missing, and logging on every call
    // floods Vercel logs on staging (Redis is touched 5-10× per request via
    // rate limiting, view tracking, and reactions caching), making the logs
    // unusable and burning through log ingestion quotas.
    if (typeof prop === 'string') {
      return async () => null;
    }
    return undefined;
  },
});
