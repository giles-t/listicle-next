import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUserStats, getUserRecentLists } from '@/server/db/queries/profiles';
import { ApiError } from '@/server/api-error';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = await params;

    if (!username) {
      throw ApiError.badRequest('Username is required');
    }

    // Get user profile
    const user = await getUserByUsername(username);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Get user stats
    const stats = await getUserStats(user.id);

    // Get user's recent lists
    const recentLists = await getUserRecentLists(user.id, 6);

    return NextResponse.json({
      profile: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        twitter: user.twitter,
        linkedin: user.linkedin,
        instagram: user.instagram,
        youtube: user.youtube,
        github: user.github,
        created_at: user.created_at,
      },
      stats,
      recentLists,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 