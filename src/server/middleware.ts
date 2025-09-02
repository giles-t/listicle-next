/**
 * API middleware helpers for authentication, rate limiting, and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP, rateLimitByUser, getRateLimitHeaders, getClientIP } from './rate-limit';
import { moderateContent } from './moderation';

export type ApiHandler = (
  request: NextRequest,
  context: { params?: any }
) => Promise<NextResponse>;

export interface ApiContext {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  params?: any;
}

/**
 * Wrapper for API routes with middleware support
 * @param handler API route handler
 * @param options Middleware options
 * @returns Enhanced API handler
 */
export function withMiddleware(
  handler: (request: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimit?: { requests: number; window: number };
    moderateContent?: boolean;
  } = {}
): ApiHandler {
  return async (request: NextRequest, context: { params?: any }) => {
    try {
      const apiContext: ApiContext = { params: context.params };

      // Rate limiting
      if (options.rateLimit) {
        const ip = getClientIP(request);
        const rateLimitResult = await rateLimitByIP(ip, options.rateLimit);
        
        if (!rateLimitResult.success) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429,
              headers: getRateLimitHeaders(rateLimitResult),
            }
          );
        }
      }

      // Authentication check
      if (options.requireAuth) {
        const user = await getAuthenticatedUser(request);
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        apiContext.user = user;
      }

      // Content moderation (for POST/PUT requests)
      if (options.moderateContent && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const body = await request.text();
        if (body) {
          const moderationResult = await moderateContent(body);
          if (!moderationResult.isAllowed) {
            return NextResponse.json(
              { 
                error: 'Content not allowed',
                reasons: moderationResult.flaggedReasons,
              },
              { status: 400 }
            );
          }
        }
      }

      // Call the actual handler
      return await handler(request, apiContext);
    } catch (error) {
      console.error('API Error:', error);
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Get authenticated user from request
 * @param request Next.js request object
 * @returns User object or null
 */
async function getAuthenticatedUser(request: NextRequest): Promise<ApiContext['user'] | null> {
  try {
    // TODO: Implement actual authentication logic
    // This could be JWT verification, session validation, etc.
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    // TODO: Verify JWT token and extract user info
    // const user = await verifyJWT(token);
    // return user;

    // Placeholder for development
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * CORS middleware
 * @param request Request object
 * @returns Response with CORS headers or null
 */
export function handleCORS(request: NextRequest): NextResponse | null {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return null;
}

/**
 * Add CORS headers to response
 * @param response Response object
 * @returns Response with CORS headers
 */
export function addCORSHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

/**
 * Validate request method
 * @param request Request object
 * @param allowedMethods Allowed HTTP methods
 * @returns Response if method not allowed, null otherwise
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      { error: `Method ${request.method} not allowed` },
      { status: 405 }
    );
  }
  return null;
}

/**
 * Parse and validate JSON body
 * @param request Request object
 * @returns Parsed JSON or throws error
 */
export async function parseJSON(request: NextRequest): Promise<any> {
  try {
    const text = await request.text();
    if (!text) {
      throw new Error('Request body is empty');
    }
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Create standardized API response
 * @param data Response data
 * @param options Response options
 * @returns NextResponse
 */
export function createResponse(
  data: any,
  options: {
    status?: number;
    headers?: Record<string, string>;
  } = {}
): NextResponse {
  const response = NextResponse.json(data, {
    status: options.status || 200,
    headers: options.headers,
  });

  return addCORSHeaders(response);
}

/**
 * Create error response
 * @param error Error message or object
 * @param status HTTP status code
 * @returns NextResponse
 */
export function createErrorResponse(
  error: string | { message: string; code?: string },
  status: number = 400
): NextResponse {
  const errorData = typeof error === 'string' ? { error } : error;
  return createResponse(errorData, { status });
} 