import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/server/db/queries/profiles';
import { getFollowingWithStatus, getFollowCounts } from '@/server/db/queries/follows';
import { ApiError } from '@/server/api-error';
import { createClient } from '@/server/supabase';

/**
 * GET /api/profile/[username]/following
 * Get list of users that a user is following
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = await params;

    if (!username) {
      throw ApiError.badRequest('Username is required');
    }

    // Get target user profile
    const targetUser = await getUserByUsername(username);
    
    if (!targetUser) {
      throw ApiError.notFound('User not found');
    }

    // Get current user (optional - for follow status)
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Get query params for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get following with follow status
    const following = await getFollowingWithStatus(
      targetUser.id,
      currentUser?.id || null,
      limit,
      offset
    );

    // Get total count
    const counts = await getFollowCounts(targetUser.id);

    return NextResponse.json({
      following,
      total: counts.followingCount,
      hasMore: offset + following.length < counts.followingCount,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Get following API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
