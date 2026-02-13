import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { getUserBookmarks, getUserBookmarksCount, type SortOption } from '@/server/db/queries/bookmarks';

/**
 * GET /api/me/bookmarks
 * Get all bookmarks for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const sortBy = (searchParams.get('sort') as SortOption) || 'newest';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Collection filter: undefined = all, 'none' = uncategorized, otherwise collection ID
    const collectionParam = searchParams.get('collection');
    const collectionId = collectionParam === 'none' ? null : collectionParam || undefined;

    const [bookmarks, totalCount] = await Promise.all([
      getUserBookmarks(user.id, {
        search,
        categorySlug,
        collectionId,
        sortBy,
        limit,
        offset,
      }),
      getUserBookmarksCount(user.id),
    ]);

    return NextResponse.json({
      bookmarks,
      totalCount,
      hasMore: offset + bookmarks.length < totalCount,
    });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
