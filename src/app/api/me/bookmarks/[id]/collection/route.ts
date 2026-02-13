import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { moveBookmarkToCollection, getBookmarkCollection } from '@/server/db/queries/collections';

/**
 * GET /api/me/bookmarks/[id]/collection
 * Get the current collection for a bookmark
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bookmarkId } = await params;

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
    }

    const collection = await getBookmarkCollection(user.id, bookmarkId);

    return NextResponse.json({ collection });

  } catch (error) {
    console.error('Error fetching bookmark collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/me/bookmarks/[id]/collection
 * Move a bookmark to a collection (or remove from collection if collectionId is null)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bookmarkId } = await params;

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { collectionId } = body;

    // collectionId can be null (to remove from collection) or a valid UUID
    if (collectionId !== null && typeof collectionId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid collection ID' },
        { status: 400 }
      );
    }

    const success = await moveBookmarkToCollection(user.id, bookmarkId, collectionId);

    if (!success) {
      return NextResponse.json(
        { error: 'Bookmark or collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error moving bookmark to collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
