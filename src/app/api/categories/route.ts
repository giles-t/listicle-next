import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories } from '@/server/db/queries/categories';
import { ApiError } from '@/server/api-error';
import { createClient } from '@/server/supabase';

/**
 * GET /api/categories
 * Get all categories with stats
 * 
 * Since we have < 100 categories, we fetch all at once.
 * Filtering and sorting is done client-side for better UX.
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user if authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const categories = await getAllCategories({
      sortBy: 'sort_order',
      userId: user?.id,
    });

    // Cache for 1 minute, stale-while-revalidate for 10 minutes
    return NextResponse.json(
      { categories },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
