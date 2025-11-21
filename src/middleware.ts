import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './server/supabase'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Apply the middleware only to routes that need auth/onboarding checks
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard/:path*',
    '/create/:path*',
    '/settings/:path*',
    '/me/:path*',
    '/lists/drafts/:path*',
    // Onboarding route (to handle redirects)
    '/onboarding/:path*',
  ],
};
