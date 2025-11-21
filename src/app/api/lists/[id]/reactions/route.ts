import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import {
  getListReactions,
  addListReaction,
  removeListReaction,
  getUserListReactions,
  addListItemReaction,
  removeListItemReaction,
} from '@/src/server/db/queries/reactions';
import { z } from 'zod';

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
  targetId: z.string().optional(), // For list item reactions
});

/**
 * GET /api/lists/[id]/reactions
 * Get all reactions for a list
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get all reactions grouped by emoji
    const reactions = await getListReactions(listId);

    // Get user's reactions if authenticated
    let userReactions: string[] = [];
    if (user) {
      userReactions = await getUserListReactions(listId, user.id);
    }

    return NextResponse.json({
      reactions,
      userReactions,
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lists/[id]/reactions
 * Add a reaction to a list
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = reactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid emoji', details: validation.error },
        { status: 400 }
      );
    }

    const { emoji, targetId } = validation.data;

    // Add reaction to list item or list
    const result = targetId
      ? await addListItemReaction(listId, targetId, user.id, emoji)
      : await addListReaction(listId, user.id, emoji);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to add reaction' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        reaction: result.reaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lists/[id]/reactions
 * Remove a reaction from a list
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const emoji = searchParams.get('emoji');
    const targetId = searchParams.get('targetId');

    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji parameter is required' },
        { status: 400 }
      );
    }

    // Remove reaction from list item or list
    const result = targetId
      ? await removeListItemReaction(listId, targetId, user.id, emoji)
      : await removeListReaction(listId, user.id, emoji);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Reaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reaction: result.reaction,
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}

