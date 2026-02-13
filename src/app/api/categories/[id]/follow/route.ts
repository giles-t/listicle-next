import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, followCategory, unfollowCategory, isFollowingCategory } from '@/server/db/queries/categories';
import { getUserById } from '@/server/db/queries/profiles';
import { ApiError } from '@/server/api-error';
import { createClient } from '@/server/supabase';

/**
 * POST /api/categories/[id]/follow
 * Follow a category
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw ApiError.badRequest('Category ID is required');
    }

    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Verify user has a profile (required for foreign key constraint)
    const profile = await getUserById(user.id);
    if (!profile) {
      throw ApiError.badRequest('Please complete your profile setup first');
    }

    // Verify category exists
    const category = await getCategoryById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Follow the category
    const isNew = await followCategory(user.id, id);

    return NextResponse.json({
      success: true,
      isFollowing: true,
      alreadyFollowing: !isNew,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Follow category API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]/follow
 * Unfollow a category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw ApiError.badRequest('Category ID is required');
    }

    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Verify user has a profile
    const profile = await getUserById(user.id);
    if (!profile) {
      throw ApiError.badRequest('Please complete your profile setup first');
    }

    // Verify category exists
    const category = await getCategoryById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Unfollow the category
    const wasFollowing = await unfollowCategory(user.id, id);

    return NextResponse.json({
      success: true,
      isFollowing: false,
      wasFollowing,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Unfollow category API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/categories/[id]/follow
 * Check if current user is following the category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw ApiError.badRequest('Category ID is required');
    }

    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ isFollowing: false });
    }

    // Verify user has a profile
    const profile = await getUserById(user.id);
    if (!profile) {
      return NextResponse.json({ isFollowing: false });
    }

    // Verify category exists
    const category = await getCategoryById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    const isFollowing = await isFollowingCategory(user.id, id);

    return NextResponse.json({ isFollowing });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Check category follow status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
