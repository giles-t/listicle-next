import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/server/supabase';
import { ApiError } from '@/server/api-error';
import { getNotifications } from '@/server/db/queries/notifications';

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Validate parameters
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw ApiError.badRequest('Invalid limit parameter');
    }
    if (isNaN(offset) || offset < 0) {
      throw ApiError.badRequest('Invalid offset parameter');
    }

    // Get notifications
    const notifications = await getNotifications(user.id, {
      limit,
      offset,
      unreadOnly,
    });

    return NextResponse.json({
      notifications,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
