import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { db } from '@/src/server/db';
import { listItems, lists } from '@/src/server/db/schema';
import { and, desc, eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listId = params.id;
    if (!listId) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const title: string | undefined = body?.title;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Verify ownership of list
    const [existingList] = await db
      .select({ id: lists.id, user_id: lists.user_id })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (!existingList) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    if (existingList.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only modify your own lists' }, { status: 403 });
    }

    // Determine next sort order (max + 1)
    const [lastItem] = await db
      .select({ sort_order: listItems.sort_order })
      .from(listItems)
      .where(eq(listItems.list_id, listId))
      .orderBy(desc(listItems.sort_order))
      .limit(1);

    const nextSort = (lastItem?.sort_order ?? -1) + 1;

    const [created] = await db
      .insert(listItems)
      .values({
        title: title.trim(),
        content: '',
        media_url: null,
        media_type: 'none',
        alt_text: null,
        sort_order: nextSort,
        list_id: listId,
      })
      .returning();

    return NextResponse.json({
      message: 'Item created',
      item: created,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating list item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


