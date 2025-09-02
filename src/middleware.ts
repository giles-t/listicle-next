import { type NextRequest } from 'next/server';
import { updateSession } from './server/supabase'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Apply the middleware to applicable routes
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/create/:path*',
    '/settings/:path*',
    '/me/:path*',
    '/lists/drafts/:path*',
  ],
};
