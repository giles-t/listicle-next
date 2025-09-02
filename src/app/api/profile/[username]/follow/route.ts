import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/server/db/queries/profiles';
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

    // TODO: Implement follow system
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: 'Follow functionality coming soon',
      isFollowing: false,
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

    // TODO: Implement unfollow system
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: 'Unfollow functionality coming soon',
      isFollowing: false,
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