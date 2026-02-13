import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/server/supabase';
import { db } from '@/server/db';
import { lists, categories, listToCategories } from '@/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { suggestCategoriesForList } from '@/server/ai/categorize';

/**
 * GET /api/lists/[id]/categories
 * Get categories for a list
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listId = params.id;

    if (!listId) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    // Get categories for this list
    const listCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        icon: categories.icon,
        color: categories.color,
      })
      .from(categories)
      .innerJoin(listToCategories, eq(categories.id, listToCategories.category_id))
      .where(eq(listToCategories.list_id, listId));

    return NextResponse.json({
      listId,
      categories: listCategories,
    });
  } catch (error) {
    console.error('Error fetching list categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/lists/[id]/categories
 * Set categories for a list (replaces existing categories)
 */
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
    const { categoryIds } = body;

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json({ error: 'categoryIds must be an array' }, { status: 400 });
    }

    // Check if the list exists and belongs to the authenticated user
    const [existingList] = await db
      .select({ id: lists.id, user_id: lists.user_id })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (!existingList) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    if (existingList.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only update categories for your own lists' }, { status: 403 });
    }

    // Remove existing categories for this list
    await db
      .delete(listToCategories)
      .where(eq(listToCategories.list_id, listId));

    // Add new categories if any
    if (categoryIds.length > 0) {
      // Verify all category IDs exist
      const validCategories = await db
        .select({ id: categories.id })
        .from(categories)
        .where(inArray(categories.id, categoryIds));

      const validCategoryIds = validCategories.map(c => c.id);

      if (validCategoryIds.length > 0) {
        await db
          .insert(listToCategories)
          .values(
            validCategoryIds.map(categoryId => ({
              list_id: listId,
              category_id: categoryId,
            }))
          );
      }
    }

    // Fetch updated categories to return
    const updatedCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        icon: categories.icon,
        color: categories.color,
      })
      .from(categories)
      .innerJoin(listToCategories, eq(categories.id, listToCategories.category_id))
      .where(eq(listToCategories.list_id, listId));

    return NextResponse.json({
      listId,
      categories: updatedCategories,
      message: 'Categories updated successfully',
    });
  } catch (error) {
    console.error('Error updating list categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lists/[id]/categories
 * Auto-categorize a list using AI
 */
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

    // Check if the list exists and belongs to the authenticated user
    const [existingList] = await db
      .select({ id: lists.id, user_id: lists.user_id })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (!existingList) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    if (existingList.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only auto-categorize your own lists' }, { status: 403 });
    }

    // Get optional parameters from request body
    const body = await request.json().catch(() => ({}));
    const { maxSuggestions = 3, autoApply = false } = body;

    // Get AI suggestions
    const result = await suggestCategoriesForList(listId, maxSuggestions);

    // If autoApply is true, automatically set the categories
    if (autoApply && result.suggestions.length > 0) {
      // Remove existing categories
      await db
        .delete(listToCategories)
        .where(eq(listToCategories.list_id, listId));

      // Add suggested categories
      await db
        .insert(listToCategories)
        .values(
          result.suggestions.map(suggestion => ({
            list_id: listId,
            category_id: suggestion.id,
          }))
        );

      return NextResponse.json({
        listId,
        suggestions: result.suggestions,
        reasoning: result.reasoning,
        applied: true,
        message: 'Categories automatically applied',
      });
    }

    return NextResponse.json({
      listId,
      suggestions: result.suggestions,
      reasoning: result.reasoning,
      applied: false,
      message: 'Category suggestions generated',
    });
  } catch (error) {
    console.error('Error auto-categorizing list:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'List not found') {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      if (error.message.includes('rate_limit_exceeded')) {
        return NextResponse.json({ error: 'Rate limit exceeded, please try again later' }, { status: 429 });
      }
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json({ error: 'AI service quota exceeded' }, { status: 402 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
