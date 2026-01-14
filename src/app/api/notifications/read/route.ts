import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/server/supabase';
import { ApiError } from '@/server/api-error';
import { markAsRead } from '@/server/db/queries/notifications';

/**
 * POST /api/notifications/read
 * Mark notifications as read
 * Body: { notificationIds?: string[] }
 * If notificationIds is not provided, marks all notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Parse request body
    let notificationIds: string[] | undefined;
    try {
      const body = await request.json();
      notificationIds = body.notificationIds;

      // Validate notificationIds if provided
      if (notificationIds !== undefined) {
        if (!Array.isArray(notificationIds)) {
          throw ApiError.badRequest('notificationIds must be an array');
        }
        if (!notificationIds.every(id => typeof id === 'string')) {
          throw ApiError.badRequest('notificationIds must contain only strings');
        }
      }
    } catch (e) {
      // If body is empty or invalid JSON, mark all as read
      notificationIds = undefined;
    }

    // Mark notifications as read
    await markAsRead(user.id, notificationIds);

    return NextResponse.json({
      success: true,
      message: notificationIds
        ? `Marked ${notificationIds.length} notification(s) as read`
        : 'Marked all notifications as read',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Mark notifications read API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
