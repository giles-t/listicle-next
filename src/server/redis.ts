import { Redis } from '@upstash/redis';
import logger from './logger';

function createRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    logger.warn('Redis credentials not configured, caching disabled');
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch (error) {
    logger.error({ err: error }, 'Failed to create Redis client, caching disabled');
    return null;
  }
}

const redisClient = createRedisClient();

/**
 * Redis client with graceful degradation.
 * Returns a proxy that no-ops when Redis is unavailable rather than crashing.
 */
export const redis: Redis = redisClient ?? new Proxy({} as Redis, {
  get(_target, prop) {
    // Return a no-op async function for any method call
    if (typeof prop === 'string') {
      return async () => {
        logger.warn({ method: prop }, 'Redis unavailable, skipping operation');
        return null;
      };
    }
    return undefined;
  },
});
