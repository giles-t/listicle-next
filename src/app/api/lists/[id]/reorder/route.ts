import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { db } from '@/src/server/db';
import { lists, listItems } from '@/src/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    sort_order: z.number(),
  })),
});

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
    const validationResult = reorderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: validationResult.error.issues 
      }, { status: 400 });
    }

    const { items } = validationResult.data;

    // Check if the list exists and belongs to the authenticated user
    const existingList = await db
      .select({ id: lists.id, user_id: lists.user_id })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (existingList.length === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    if (existingList[0].user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only reorder your own list items' }, { status: 403 });
    }

    // Verify that all items belong to this list
    const existingItems = await db
      .select({ id: listItems.id })
      .from(listItems)
      .where(eq(listItems.list_id, listId));

    const existingItemIds = new Set(existingItems.map(item => item.id));
    const providedItemIds = new Set(items.map(item => item.id));

    // Check if all provided items exist and belong to this list
    for (const itemId of providedItemIds) {
      if (!existingItemIds.has(itemId)) {
        return NextResponse.json({ 
          error: `Item with ID ${itemId} does not belong to this list` 
        }, { status: 400 });
      }
    }

    // Perform all updates in a transaction to ensure consistency
    await db.transaction(async (tx) => {
      // Update the sort order for each item
      const updatePromises = items.map(item =>
        tx
          .update(listItems)
          .set({ 
            sort_order: item.sort_order,
            updated_at: new Date()
          })
          .where(and(
            eq(listItems.id, item.id),
            eq(listItems.list_id, listId)
          ))
      );

      await Promise.all(updatePromises);

      // Update the list's updated_at timestamp
      await tx
        .update(lists)
        .set({ updated_at: new Date() })
        .where(and(
          eq(lists.id, listId),
          eq(lists.user_id, user.id)
        ));
    });

    return NextResponse.json({
      message: 'List items reordered successfully',
      listId,
      itemsUpdated: items.length
    });

  } catch (error) {
    console.error('Error reordering list items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
