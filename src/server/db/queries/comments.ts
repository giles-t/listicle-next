import { db } from '@/src/server/db';
import { comments, profiles, listItems, lists } from '@/src/server/db/schema';
import { eq, and, sql, desc, isNull, count } from 'drizzle-orm';

export interface CommentWithUser {
  id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  parent_id: string | null;
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
  replies?: CommentWithUser[];
  isAuthor?: boolean;
}

export interface ListItemContext {
  id: string;
  title: string;
  content: string;
  sort_order: number;
}

export interface ListContext {
  id: string;
  title: string;
  slug: string;
  user_id: string;
}

/**
 * Get all comments for a list (optionally filtered by list item)
 * Includes user profile information and nested replies
 */
export async function getCommentsWithProfiles(
  listId: string,
  listItemId?: string | null
): Promise<CommentWithUser[]> {
  try {
    // Get the list author ID for "Author" badge
    const list = await db
      .select({ user_id: lists.user_id })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    const listAuthorId = list[0]?.user_id;

    // Fetch all comments (including replies) for the list/item
    const whereCondition = listItemId
      ? and(
          eq(comments.list_id, listId),
          eq(comments.list_item_id, listItemId)
        )
      : and(
          eq(comments.list_id, listId),
          isNull(comments.list_item_id)
        );

    const allComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        created_at: comments.created_at,
        updated_at: comments.updated_at,
        parent_id: comments.parent_id,
        user: {
          id: profiles.id,
          username: profiles.username,
          name: profiles.name,
          avatar: profiles.avatar,
        },
      })
      .from(comments)
      .innerJoin(profiles, eq(comments.user_id, profiles.id))
      .where(whereCondition)
      .orderBy(desc(comments.created_at));

    // Build nested structure: separate top-level comments from replies
    const topLevelComments: CommentWithUser[] = [];
    const repliesByParentId = new Map<string, CommentWithUser[]>();

    for (const comment of allComments) {
      const commentWithAuthorFlag: CommentWithUser = {
        ...comment,
        isAuthor: comment.user.id === listAuthorId,
      };

      if (comment.parent_id) {
        const replies = repliesByParentId.get(comment.parent_id) || [];
        replies.push(commentWithAuthorFlag);
        repliesByParentId.set(comment.parent_id, replies);
      } else {
        topLevelComments.push(commentWithAuthorFlag);
      }
    }

    // Attach replies to their parent comments
    for (const comment of topLevelComments) {
      const replies = repliesByParentId.get(comment.id);
      if (replies) {
        // Sort replies oldest first (chronological order)
        comment.replies = replies.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    }

    return topLevelComments;
  } catch (error) {
    console.error('[getCommentsWithProfiles] Error:', error);
    return [];
  }
}

/**
 * Get the list item context for displaying in the comments drawer
 */
export async function getListItemContext(
  listItemId: string
): Promise<ListItemContext | null> {
  try {
    const result = await db
      .select({
        id: listItems.id,
        title: listItems.title,
        content: listItems.content,
        sort_order: listItems.sort_order,
      })
      .from(listItems)
      .where(eq(listItems.id, listItemId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('[getListItemContext] Error:', error);
    return null;
  }
}

/**
 * Get the list context for displaying in the comments drawer
 */
export async function getListContext(
  listId: string
): Promise<ListContext | null> {
  try {
    const result = await db
      .select({
        id: lists.id,
        title: lists.title,
        slug: lists.slug,
        user_id: lists.user_id,
      })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('[getListContext] Error:', error);
    return null;
  }
}

/**
 * Add a comment to a list or list item
 */
export async function addComment(
  listId: string,
  userId: string,
  content: string,
  listItemId?: string | null,
  parentId?: string | null
) {
  try {
    const result = await db
      .insert(comments)
      .values({
        list_id: listId,
        user_id: userId,
        content: content.trim(),
        list_item_id: listItemId || null,
        parent_id: parentId || null,
      })
      .returning();

    return { success: true, comment: result[0] };
  } catch (error) {
    console.error('[addComment] Error:', error);
    throw error;
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
) {
  try {
    const result = await db
      .update(comments)
      .set({
        content: content.trim(),
        updated_at: new Date(),
      })
      .where(
        and(
          eq(comments.id, commentId),
          eq(comments.user_id, userId)
        )
      )
      .returning();

    if (result.length === 0) {
      return { success: false, error: 'Comment not found or unauthorized' };
    }

    return { success: true, comment: result[0] };
  } catch (error) {
    console.error('[updateComment] Error:', error);
    throw error;
  }
}

/**
 * Delete a comment (only by the comment owner or list owner)
 */
export async function deleteComment(
  commentId: string,
  userId: string,
  listId: string
) {
  try {
    // Check if user is comment owner or list owner
    const [comment, list] = await Promise.all([
      db.select({ user_id: comments.user_id }).from(comments).where(eq(comments.id, commentId)).limit(1),
      db.select({ user_id: lists.user_id }).from(lists).where(eq(lists.id, listId)).limit(1),
    ]);

    const commentOwnerId = comment[0]?.user_id;
    const listOwnerId = list[0]?.user_id;

    if (commentOwnerId !== userId && listOwnerId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete the comment (cascades to delete replies via foreign key)
    const result = await db
      .delete(comments)
      .where(eq(comments.id, commentId))
      .returning();

    return { success: result.length > 0, comment: result[0] };
  } catch (error) {
    console.error('[deleteComment] Error:', error);
    throw error;
  }
}

/**
 * Get comment count for a list or list item
 */
export async function getCommentCount(
  listId: string,
  listItemId?: string | null
): Promise<number> {
  try {
    const whereCondition = listItemId
      ? and(
          eq(comments.list_id, listId),
          eq(comments.list_item_id, listItemId)
        )
      : and(
          eq(comments.list_id, listId),
          isNull(comments.list_item_id)
        );

    const result = await db
      .select({ count: count() })
      .from(comments)
      .where(whereCondition);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('[getCommentCount] Error:', error);
    return 0;
  }
}

/**
 * Get all comment counts for a list and its items in one query
 */
export async function getAllCommentCounts(listId: string): Promise<{
  list: number;
  items: Record<string, number>;
}> {
  try {
    const result = await db
      .select({
        list_item_id: comments.list_item_id,
        count: sql<number>`count(*)::int`,
      })
      .from(comments)
      .where(eq(comments.list_id, listId))
      .groupBy(comments.list_item_id);

    const listCount = result.find(r => r.list_item_id === null)?.count || 0;
    const itemCounts = result
      .filter(r => r.list_item_id !== null)
      .reduce((acc, r) => {
        acc[r.list_item_id!] = r.count;
        return acc;
      }, {} as Record<string, number>);

    return {
      list: listCount,
      items: itemCounts,
    };
  } catch (error) {
    console.error('[getAllCommentCounts] Error:', error);
    return { list: 0, items: {} };
  }
}
