import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { db } from '@/src/server/db';
import { lists, tags, listToTags } from '@/src/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const listId = params.id;

    if (!listId) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    // Check if list exists and user has access
    const listData = await db
      .select({ id: lists.id, user_id: lists.user_id, is_published: lists.is_published })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (listData.length === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const list = listData[0];

    // Check access permissions
    if (!list.is_published && (!user || list.user_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden: You cannot access this list' }, { status: 403 });
    }

    // Get tags for this list
    const listTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(tags)
      .innerJoin(listToTags, eq(tags.id, listToTags.tag_id))
      .where(eq(listToTags.list_id, listId));

    return NextResponse.json({
      listId,
      tags: listTags
    });

  } catch (error) {
    console.error('Error fetching list tags:', error);
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
    const { tags: categoriesArray } = body;

    if (!Array.isArray(categoriesArray)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Forbidden: You can only update tags for your own lists' }, { status: 403 });
    }

    // Handle tag updates
    if (categoriesArray.length > 0) {
      // Create a slug function for tags
      const createSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Find existing tags or create new ones
      const tagNames = categoriesArray.map((cat: any) => cat.name || cat);
      const existingTags = await db
        .select()
        .from(tags)
        .where(inArray(tags.name, tagNames));
      
      const existingTagNames = existingTags.map(tag => tag.name);
      const newTagNames = tagNames.filter((name: string) => !existingTagNames.includes(name));
      
      // Create new tags
      const newTags = [];
      for (const name of newTagNames) {
        const [newTag] = await db
          .insert(tags)
          .values({
            name,
            slug: createSlug(name)
          })
          .returning();
        newTags.push(newTag);
      }
      
      // Combine existing and new tags
      const allTags = [...existingTags, ...newTags];
      
      // Remove existing list-to-tags relationships
      await db
        .delete(listToTags)
        .where(eq(listToTags.list_id, listId));
      
      // Create new list-to-tags relationships
      if (allTags.length > 0) {
        await db
          .insert(listToTags)
          .values(
            allTags.map(tag => ({
              list_id: listId,
              tag_id: tag.id
            }))
          );
      }

      return NextResponse.json({
        listId,
        tags: allTags.map(tag => ({ id: tag.id, name: tag.name, slug: tag.slug })),
        message: 'Tags updated successfully'
      });
    } else {
      // If empty tags array, remove all tags for this list
      await db
        .delete(listToTags)
        .where(eq(listToTags.list_id, listId));

      return NextResponse.json({
        listId,
        tags: [],
        message: 'All tags removed successfully'
      });
    }

  } catch (error) {
    console.error('Error updating list tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: 'Forbidden: You can only remove tags from your own lists' }, { status: 403 });
    }

    // Remove all tags for this list
    await db
      .delete(listToTags)
      .where(eq(listToTags.list_id, listId));

    return NextResponse.json({
      listId,
      message: 'All tags removed successfully'
    });

  } catch (error) {
    console.error('Error removing list tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
