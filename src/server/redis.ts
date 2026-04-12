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

export const redis: Redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedis();
    if (client) {
      const value = Reflect.get(client, prop);
      return typeof value === 'function' ? value.bind(client) : value;
    }
    // Graceful degradation: no-op async function for any method call
    if (typeof prop === 'string') {
      return async () => {
        logger.warn({ method: prop }, 'Redis unavailable, skipping operation');
        return null;
      };
    }
    return undefined;
  },
});
