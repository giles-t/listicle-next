/**
 * Rate limiting utility for API endpoints
 * Uses in-memory storage for development, can be extended with Redis for production
 */

import { config } from './config';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for development
// In production, this should be replaced with Redis
const store = new Map<string, RateLimitStore>();

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
  
  // Authentication
  LOGIN_ATTEMPTS: { requests: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  SIGNUP_ATTEMPTS: { requests: 3, window: 60 * 60 * 1000 }, // 3 signups per hour
  
  // Email sending
  SEND_EMAIL: { requests: 10, window: 60 * 60 * 1000 }, // 10 emails per hour
} as const;

/**
 * Rate limit a request
 * @param identifier Unique identifier (IP, user ID, etc.)
 * @param limit Rate limit configuration
 * @returns Rate limit result
 */
export async function rateLimit(
  identifier: string,
  limit: { requests: number; window: number }
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - limit.window;
  
  // Clean up old entries
  if (store.has(key)) {
    const entry = store.get(key)!;
    if (entry.resetTime <= now) {
      store.delete(key);
    }
  }
  
  let entry = store.get(key);
  
  if (!entry) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + limit.window,
    };
    store.set(key, entry);
    
    return {
      success: true,
      limit: limit.requests,
      remaining: limit.requests - 1,
      reset: new Date(entry.resetTime),
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= limit.requests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    return {
      success: false,
      limit: limit.requests,
      remaining: 0,
      reset: new Date(entry.resetTime),
      retryAfter,
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    success: true,
    limit: limit.requests,
    remaining: limit.requests - entry.count,
    reset: new Date(entry.resetTime),
  };
}

/**
 * Rate limit by IP address
 * @param ip IP address
 * @param limitConfig Rate limit configuration
 * @returns Rate limit result
 */
export async function rateLimitByIP(
  ip: string,
  limitConfig: { requests: number; window: number } = RATE_LIMITS.API_UNAUTHENTICATED
): Promise<RateLimitResult> {
  return rateLimit(`ip:${ip}`, limitConfig);
}

/**
 * Rate limit by user ID
 * @param userId User ID
 * @param limitConfig Rate limit configuration
 * @returns Rate limit result
 */
export async function rateLimitByUser(
  userId: string,
  limitConfig: { requests: number; window: number } = RATE_LIMITS.API_AUTHENTICATED
): Promise<RateLimitResult> {
  return rateLimit(`user:${userId}`, limitConfig);
}

/**
 * Rate limit by custom key
 * @param key Custom key (e.g., 'email:user@example.com')
 * @param limitConfig Rate limit configuration
 * @returns Rate limit result
 */
export async function rateLimitByKey(
  key: string,
  limitConfig: { requests: number; window: number }
): Promise<RateLimitResult> {
  return rateLimit(key, limitConfig);
}

/**
 * Get rate limit headers for HTTP responses
 * @param result Rate limit result
 * @returns Headers object
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
 * @param request Request object
 * @returns IP address
 */
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
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
  
  // Fallback to a default IP for development
  return '127.0.0.1';
}

/**
 * Cleanup expired entries (call this periodically)
 * In production, this would be handled by Redis TTL
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  for (const [key, entry] of Array.from(store.entries())) {
    if (entry.resetTime <= now) {
      store.delete(key);
    }
  }
}

// Cleanup expired entries every 5 minutes in development
if (config.app.isDevelopment) {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
} 