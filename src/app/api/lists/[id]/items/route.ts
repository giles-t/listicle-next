import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { db } from '@/src/server/db';
import { listItems, lists } from '@/src/server/db/schema';
import { and, asc, desc, eq } from 'drizzle-orm';
import { extractImagesFromContent } from '@/shared/utils/extract-images';

export async function GET(
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

    // Get order parameter from query string
    const { searchParams } = new URL(request.url);
    const order = searchParams.get('order') || 'asc';

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
      return NextResponse.json({ error: 'Forbidden: You can only access your own lists' }, { status: 403 });
    }

    // Fetch items with the specified order
    const items = await db
      .select({
        id: listItems.id,
        title: listItems.title,
        content: listItems.content,
        sort_order: listItems.sort_order,
      })
      .from(listItems)
      .where(eq(listItems.list_id, listId))
      .orderBy(order === 'desc' ? desc(listItems.sort_order) : asc(listItems.sort_order));

    return NextResponse.json({
      items,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching list items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

export async function PUT(
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
    
    // Check if this is a bulk update request
    if (body.bulk && Array.isArray(body.items)) {
      return await handleBulkUpdate(listId, body.items, user.id);
    }
    
    // Single item update (existing logic)
    const itemId: string | undefined = body?.id;
    const content: string | undefined = body?.content;
    const sort_order: number | undefined = body?.sort_order;

    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
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

    // Verify the item belongs to this list
    const [existingItem] = await db
      .select({ id: listItems.id })
      .from(listItems)
      .where(and(eq(listItems.id, itemId), eq(listItems.list_id, listId)))
      .limit(1);

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found in this list' }, { status: 404 });
    }

    // Build update object
    const updateData: any = {};
    if (content !== undefined) {
      updateData.content = content;
      // Automatically extract and save the first image from the content
      const images = extractImagesFromContent(content);
      updateData.image = images.length > 0 ? images[0] : null;
    }
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Update the item
    const [updated] = await db
      .update(listItems)
      .set(updateData)
      .where(eq(listItems.id, itemId))
      .returning();

    return NextResponse.json({
      message: 'Item updated',
      item: updated,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating list item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleBulkUpdate(listId: string, items: Array<{id: string, sort_order: number}>, userId: string) {
  try {
    // Verify ownership of list
    const [existingList] = await db
      .select({ id: lists.id, user_id: lists.user_id })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (!existingList) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    if (existingList.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden: You can only modify your own lists' }, { status: 403 });
    }

    // Verify all items belong to this list
    const itemIds = items.map(item => item.id);
    const existingItems = await db
      .select({ id: listItems.id })
      .from(listItems)
      .where(and(eq(listItems.list_id, listId)));

    const existingItemIds = new Set(existingItems.map(item => item.id));
    const invalidItems = itemIds.filter(id => !existingItemIds.has(id));
    
    if (invalidItems.length > 0) {
      return NextResponse.json({ 
        error: `Items not found in this list: ${invalidItems.join(', ')}` 
      }, { status: 404 });
    }

    // Perform bulk update using a transaction
    const updatedItems = [];
    for (const item of items) {
      const [updated] = await db
        .update(listItems)
        .set({ sort_order: item.sort_order })
        .where(eq(listItems.id, item.id))
        .returning();
      updatedItems.push(updated);
    }

    return NextResponse.json({
      message: 'Items updated successfully',
      items: updatedItems,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


