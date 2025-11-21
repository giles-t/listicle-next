import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { toggleBookmark, isListItemBookmarked } from '@/server/db/queries/bookmarks';

/**
 * GET /api/lists/[id]/items/[itemId]/bookmark
 * Check if the current user has bookmarked this list item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listId, itemId } = await params;

    if (!listId || !itemId) {
      return NextResponse.json({ error: 'List ID and Item ID are required' }, { status: 400 });
    }

    const bookmarked = await isListItemBookmarked(user.id, listId, itemId);

    return NextResponse.json({ bookmarked });

  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lists/[id]/items/[itemId]/bookmark
 * Toggle bookmark status for this list item
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listId, itemId } = await params;

    if (!listId || !itemId) {
      return NextResponse.json({ error: 'List ID and Item ID are required' }, { status: 400 });
    }

    const result = await toggleBookmark(user.id, listId, itemId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

