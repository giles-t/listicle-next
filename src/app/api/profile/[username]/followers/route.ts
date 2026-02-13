import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/server/db/queries/profiles';
import { getFollowersWithStatus, getFollowCounts } from '@/server/db/queries/follows';
import { ApiError } from '@/server/api-error';
import { createClient } from '@/server/supabase';

/**
 * GET /api/profile/[username]/followers
 * Get list of followers for a user
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

    // Get followers with follow status
    const followers = await getFollowersWithStatus(
      targetUser.id,
      currentUser?.id || null,
      limit,
      offset
    );

    // Get total count
    const counts = await getFollowCounts(targetUser.id);

    return NextResponse.json({
      followers,
      total: counts.followersCount,
      hasMore: offset + followers.length < counts.followersCount,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Get followers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
