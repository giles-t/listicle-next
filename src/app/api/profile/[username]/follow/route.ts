import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/server/db/queries/profiles';
import { followUser, unfollowUser, isFollowing } from '@/server/db/queries/follows';
import { ApiError } from '@/server/api-error';
import { createClient } from '@/server/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    if (!username) {
      throw ApiError.badRequest('Username is required');
    }

    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Get target user profile
    const targetUser = await getUserByUsername(username);
    
    if (!targetUser) {
      throw ApiError.notFound('User not found');
    }

    // Can't follow yourself
    if (currentUser.id === targetUser.id) {
      throw ApiError.badRequest('Cannot follow yourself');
    }

    // Follow the user
    const result = await followUser(currentUser.id, targetUser.id);

    return NextResponse.json({
      success: true,
      isFollowing: true,
      alreadyFollowing: result.alreadyFollowing,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Follow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    if (!username) {
      throw ApiError.badRequest('Username is required');
    }

    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Get target user profile
    const targetUser = await getUserByUsername(username);
    
    if (!targetUser) {
      throw ApiError.notFound('User not found');
    }

    // Unfollow the user
    const result = await unfollowUser(currentUser.id, targetUser.id);

    return NextResponse.json({
      success: true,
      isFollowing: false,
      wasFollowing: result.wasFollowing,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Unfollow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profile/[username]/follow
 * Check if the current user is following the target user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    if (!username) {
      throw ApiError.badRequest('Username is required');
    }

    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      // Not authenticated - return not following
      return NextResponse.json({ isFollowing: false });
    }

    // Get target user profile
    const targetUser = await getUserByUsername(username);
    
    if (!targetUser) {
      throw ApiError.notFound('User not found');
    }

    // Check if following
    const following = await isFollowing(currentUser.id, targetUser.id);

    return NextResponse.json({ isFollowing: following });

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Check follow status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
