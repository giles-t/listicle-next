import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { checkRateLimit, RATE_LIMITS } from '@/src/server/rate-limit';
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

    const limited = await checkRateLimit(request, user.id);
    if (limited) return limited;

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
