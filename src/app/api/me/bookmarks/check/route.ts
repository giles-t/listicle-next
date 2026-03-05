import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { getBookmarkStatusBatch } from '@/server/db/queries/bookmarks';

const MAX_LIST_IDS = 50;

/**
 * POST /api/me/bookmarks/check
 * Batch check bookmark status for multiple lists.
 * Body: { listIds: string[] }
 * Returns: { [listId]: { bookmarked: true, collectionId: string | null } }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({});
    }

    const body = await request.json();
    const listIds: unknown = body.listIds;

    if (!Array.isArray(listIds) || listIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'listIds must be an array of strings' }, { status: 400 });
    }

    if (listIds.length > MAX_LIST_IDS) {
      return NextResponse.json({ error: `Maximum ${MAX_LIST_IDS} list IDs allowed` }, { status: 400 });
    }

    const statusMap = await getBookmarkStatusBatch(user.id, listIds);

    const result: Record<string, { bookmarked: true; collectionId: string | null }> = {};
    for (const [listId, status] of statusMap) {
      result[listId] = status;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error batch checking bookmark status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
