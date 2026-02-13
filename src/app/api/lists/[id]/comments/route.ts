import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import {
  getCommentsWithProfiles,
  addComment,
  deleteComment,
  getListItemContext,
  getListContext,
} from '@/src/server/db/queries/comments';
import { moderateContent } from '@/src/server/ai/moderate';

/**
 * GET /api/lists/[id]/comments
 * Get all comments for a list or list item
 * 
 * Query params:
 * - itemId: Optional list item ID (if not provided, returns list-level comments)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listId } = await context.params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    // Fetch comments with user profiles
    const comments = await getCommentsWithProfiles(listId, itemId);

    // Fetch context for display
    let listContext = null;
    let itemContext = null;

    if (itemId) {
      itemContext = await getListItemContext(itemId);
    }
    listContext = await getListContext(listId);

    return NextResponse.json({
      comments,
      total: comments.length + comments.reduce((sum, c) => sum + (c.replies?.length || 0), 0),
      context: {
        list: listContext,
        item: itemContext,
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lists/[id]/comments
 * Add a new comment to a list or list item
 * 
 * Body:
 * - content: Comment text (required)
 * - itemId: Optional list item ID
 * - parentId: Optional parent comment ID for replies
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: listId } = await context.params;
    const body = await request.json();
    const { content, itemId, parentId } = body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be less than 2000 characters' },
        { status: 400 }
      );
    }

    // Moderate comment content for abuse/inappropriate content
    const moderation = await moderateContent(content.trim());
    if (moderation.flagged) {
      console.log(`[comments] Content flagged for user ${user.id}: ${moderation.reason}`);
      return NextResponse.json(
        { 
          error: 'Your comment could not be posted because it may contain inappropriate content.',
          reason: moderation.reason,
        },
        { status: 422 }
      );
    }

    // Add the comment
    const result = await addComment(
      listId,
      user.id,
      content,
      itemId || null,
      parentId || null
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lists/[id]/comments
 * Delete a comment
 * 
 * Query params:
 * - commentId: The comment ID to delete (required)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: listId } = await context.params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteComment(commentId, user.id, listId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete comment' },
        { status: 403 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
