import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { deleteBookmarkById } from '@/server/db/queries/bookmarks';

/**
 * DELETE /api/me/bookmarks/[id]
 * Delete a bookmark by ID
 */
export async function DELETE(
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

    const deleted = await deleteBookmarkById(user.id, bookmarkId);

    if (!deleted) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
