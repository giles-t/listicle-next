import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/server/supabase';
import { ApiError } from '@/server/api-error';
import { checkRateLimit, RATE_LIMITS } from '@/src/server/rate-limit';
import { getUnreadCount } from '@/server/db/queries/notifications';

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const limited = await checkRateLimit(request, user.id);
    if (limited) return limited;

    // Get unread count
    const count = await getUnreadCount(user.id);

    return NextResponse.json({ count });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
