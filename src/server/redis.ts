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
    // Any other method call returns a no-op async function.
    if (typeof prop === 'string') {
      return async () => {
        logger.warn({ method: prop }, 'Redis unavailable, skipping operation');
        return null;
      };
    }
    return undefined;
  },
});
