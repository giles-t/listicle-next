import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { db } from '@/src/server/db';
import { lists, listItems } from '@/src/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { createListSchema } from '@/shared/validation/list';
import { generateSlug, generateUniqueSlug } from '@/shared/utils/slug';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const validation = createListSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { title, description, listType, coverImage, items, isPublished, publicationId, tags } = validation.data;

    // Generate a unique slug
    const baseSlug = generateSlug(title);
    
    // Check for existing slugs for this user
    const existingLists = await db
      .select({ slug: lists.slug })
      .from(lists)
      .where(eq(lists.user_id, user.id));
    
    const existingSlugs = existingLists.map(list => list.slug);
    const uniqueSlug = generateUniqueSlug(title, existingSlugs);

    // Start a database transaction
    const result = await db.transaction(async (tx) => {
      // Create the list
      const [newList] = await tx
        .insert(lists)
        .values({
          title,
          description: description || null,
          slug: uniqueSlug,
          list_type: listType,
          cover_image: coverImage || null,
          is_published: isPublished,
          user_id: user.id,
          publication_id: publicationId || null,
          published_at: isPublished ? new Date() : null,
        })
        .returning();

      if (!newList) {
        throw new Error('Failed to create list');
      }

      // Create list items
      const listItemsData = items.map((item, index) => ({
        content: item.content,
        media_url: item.mediaUrl || null,
        media_type: item.mediaType,
        alt_text: item.altText || null,
        sort_order: item.sortOrder || index,
        list_id: newList.id,
      }));

      await tx.insert(listItems).values(listItemsData);

      return newList;
    });

    return NextResponse.json({
      ...result,
      message: 'List created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all lists for the authenticated user
    const userLists = await db
      .select({
        id: lists.id,
        title: lists.title,
        description: lists.description,
        slug: lists.slug,
        list_type: lists.list_type,
        cover_image: lists.cover_image,
        is_published: lists.is_published,
        created_at: lists.created_at,
        updated_at: lists.updated_at,
        published_at: lists.published_at,
      })
      .from(lists)
      .where(eq(lists.user_id, user.id))
      .orderBy(lists.created_at);

    return NextResponse.json(userLists);

  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 