import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { 
  getExistingBookmark,
  addBookmark,
  removeBookmark,
  updateBookmarkCollection,
} from '@/server/db/queries/bookmarks';

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

    const bookmark = await getExistingBookmark(user.id, listId, itemId);
    const bookmarked = !!bookmark;

    return NextResponse.json({ 
      bookmarked,
      bookmarkId: bookmark?.id || null,
      collectionId: bookmark?.collection_id || null,
    });

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
 * Add or toggle bookmark status for this list item
 * Body: { collectionId?: string | null }
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

    // Check for collectionId in request body
    let collectionId: string | null | undefined;
    try {
      const body = await request.json();
      collectionId = body.collectionId;
    } catch {
      // No body or invalid JSON, proceed without collectionId
    }

    // Check if already bookmarked
    const existingBookmark = await getExistingBookmark(user.id, listId, itemId);

    if (existingBookmark) {
      // If already bookmarked and no collection specified, toggle (remove)
      if (collectionId === undefined) {
        await removeBookmark(user.id, listId, itemId);
        return NextResponse.json({ bookmarked: false });
      }
      // Update the collection for the existing bookmark
      await updateBookmarkCollection(user.id, listId, collectionId, itemId);
      return NextResponse.json({ 
        bookmarked: true, 
        bookmarkId: existingBookmark.id,
        collectionId: collectionId,
      });
    }

    // Add new bookmark
    const bookmark = await addBookmark(user.id, listId, itemId, collectionId);

    return NextResponse.json({ 
      bookmarked: true,
      bookmarkId: bookmark.id,
      collectionId: collectionId || null,
    });

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lists/[id]/items/[itemId]/bookmark
 * Remove bookmark for this list item
 */
export async function DELETE(
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

    await removeBookmark(user.id, listId, itemId);

    return NextResponse.json({ bookmarked: false });

  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

