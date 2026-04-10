/**
 * Rate limiting utility for API endpoints
 * Uses Redis (Upstash) for production-safe distributed rate limiting
 */

import { redis } from './redis';
import logger from './logger';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

/**
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMITS = {
  // API endpoints
  API_AUTHENTICATED: { requests: 60, window: 60 * 1000 }, // 60 requests per minute
  API_UNAUTHENTICATED: { requests: 20, window: 60 * 1000 }, // 20 requests per minute

  // Specific actions
  CREATE_LIST: { requests: 10, window: 60 * 1000 }, // 10 lists per minute
  CREATE_COMMENT: { requests: 30, window: 60 * 1000 }, // 30 comments per minute
  UPLOAD_IMAGE: { requests: 20, window: 60 * 1000 }, // 20 image uploads per minute
  AI_REQUEST: { requests: 10, window: 60 * 1000 }, // 10 AI requests per minute

  // Authentication
  LOGIN_ATTEMPTS: { requests: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  SIGNUP_ATTEMPTS: { requests: 3, window: 60 * 60 * 1000 }, // 3 signups per hour

  // Email sending
  SEND_EMAIL: { requests: 10, window: 60 * 60 * 1000 }, // 10 emails per hour
} as const;

/**
 * Rate limit a request using Redis
 */
export async function rateLimit(
  identifier: string,
  limit: { requests: number; window: number }
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();

  try {
    // Use Redis MULTI for atomic increment + TTL
    const current = await redis.incr(key);

    // Set TTL on first request in window
    if (current === 1) {
      await redis.pexpire(key, limit.window);
    }

    // Get TTL for reset time
    const ttl = await redis.pttl(key);
    const resetTime = now + Math.max(ttl, 0);

    if (current > limit.requests) {
      const retryAfter = Math.ceil(Math.max(ttl, 0) / 1000);
      return {
        success: false,
        limit: limit.requests,
        remaining: 0,
        reset: new Date(resetTime),
        retryAfter,
      };
    }

    return {
      success: true,
      limit: limit.requests,
      remaining: limit.requests - current,
      reset: new Date(resetTime),
    };
  } catch (error) {
    // If Redis is unavailable, allow the request (fail open for availability)
    // but log the failure
    logger.error({ err: error, identifier }, 'Rate limit check failed, allowing request');
    return {
      success: true,
      limit: limit.requests,
      remaining: limit.requests,
      reset: new Date(now + limit.window),
    };
  }
}

/**
 * Rate limit by IP address
 */
export async function rateLimitByIP(
  ip: string,
  limitConfig: { requests: number; window: number } = RATE_LIMITS.API_UNAUTHENTICATED
): Promise<RateLimitResult> {
  return rateLimit(`ip:${ip}`, limitConfig);
}

/**
 * Rate limit by user ID
 */
export async function rateLimitByUser(
  userId: string,
  limitConfig: { requests: number; window: number } = RATE_LIMITS.API_AUTHENTICATED
): Promise<RateLimitResult> {
  return rateLimit(`user:${userId}`, limitConfig);
}

/**
 * Rate limit by custom key
 */
export async function rateLimitByKey(
  key: string,
  limitConfig: { requests: number; window: number }
): Promise<RateLimitResult> {
  return rateLimit(key, limitConfig);
}

/**
 * Get rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset.getTime() / 1000).toString(),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Extract IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return '127.0.0.1';
}

/**
 * Convenience: check rate limit and return a 429 Response if exceeded, or null if OK.
 * Use at the top of route handlers:
 *   const limited = await checkRateLimit(request, userId, RATE_LIMITS.AI_REQUEST);
 *   if (limited) return limited;
 */
export async function checkRateLimit(
  request: Request,
  userId: string | null,
  limitConfig?: { requests: number; window: number }
): Promise<Response | null> {
  const config = limitConfig ?? (userId ? RATE_LIMITS.API_AUTHENTICATED : RATE_LIMITS.API_UNAUTHENTICATED);
  const result = userId
    ? await rateLimitByUser(userId, config)
    : await rateLimitByIP(getClientIP(request), config);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests, please try again later' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(result),
        },
      }
    );
  }

  return null;
}
