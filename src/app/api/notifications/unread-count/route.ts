import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/server/supabase';
import { ApiError } from '@/server/api-error';
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

    console.error('Unread count API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
