import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { db } from '@/src/server/db';
import { lists, tags, listToTags } from '@/src/server/db/schema';
import { eq, and } from 'drizzle-orm';

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
      return NextResponse.json({ error: 'Forbidden: You can only delete your own lists' }, { status: 403 });
    }

    // Delete the list (cascade will handle list_items, comments, etc.)
    await db
      .delete(lists)
      .where(and(
        eq(lists.id, listId),
        eq(lists.user_id, user.id)
      ));

    return NextResponse.json({ 
      message: 'List deleted successfully',
      id: listId 
    });

  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get the specific list
    const listData = await db
      .select({
        id: lists.id,
        title: lists.title,
        description: lists.description,
        slug: lists.slug,
        list_type: lists.list_type,
        cover_image: lists.cover_image,
        is_published: lists.is_published,
        is_visible: lists.is_visible,
        created_at: lists.created_at,
        updated_at: lists.updated_at,
        published_at: lists.published_at,
        user_id: lists.user_id,
        publication_id: lists.publication_id,
      })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (listData.length === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const list = listData[0];

    // Check if user can access this list
    // Visible published lists can be accessed by anyone
    // Hidden lists (is_visible=false) can only be accessed by the owner or people with direct link
    // Draft lists (is_published=false) can only be accessed by the owner
    if (!list.is_published && (!user || list.user_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden: This list is not published' }, { status: 403 });
    }
    
    // For published lists, check if it's visible or if user is the owner
    if (list.is_published && !list.is_visible && (!user || list.user_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden: This list is hidden' }, { status: 403 });
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
      ...list,
      tags: listTags
    });

  } catch (error) {
    console.error('Error fetching list:', error);
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

    // Check if the list exists and belongs to the authenticated user
    const existingList = await db
      .select({ id: lists.id, user_id: lists.user_id, published_at: lists.published_at })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (existingList.length === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    if (existingList[0].user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own lists' }, { status: 403 });
    }

    // Update the list
    const updateData: any = {
      updated_at: new Date(),
    };

    // Only update fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.list_type !== undefined) updateData.list_type = body.list_type;
    if (body.cover_image !== undefined) updateData.cover_image = body.cover_image;
    if (body.is_published !== undefined) {
      updateData.is_published = body.is_published;
      // Set published_at when publishing for the first time
      if (body.is_published && !existingList[0].published_at) {
        updateData.published_at = new Date();
      }
    }
    if (body.is_visible !== undefined) updateData.is_visible = body.is_visible;
    if (body.publication_id !== undefined) updateData.publication_id = body.publication_id;
    if (body.is_pinned !== undefined) updateData.is_pinned = body.is_pinned;
    if (body.allow_comments !== undefined) updateData.allow_comments = body.allow_comments;
    if (body.seo_title !== undefined) updateData.seo_title = body.seo_title;
    if (body.seo_description !== undefined) updateData.seo_description = body.seo_description;

    const [updatedList] = await db
      .update(lists)
      .set(updateData)
      .where(and(
        eq(lists.id, listId),
        eq(lists.user_id, user.id)
      ))
      .returning();

    if (!updatedList) {
      return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
    }


    return NextResponse.json({
      ...updatedList,
      message: 'List updated successfully'
    });

  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
