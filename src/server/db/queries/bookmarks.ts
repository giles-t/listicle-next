import { db } from '../index';
import { bookmarks } from '../schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';

/**
 * Check if a user has bookmarked a list
 */
export async function isListBookmarked(
  userId: string,
  listId: string
): Promise<boolean> {
  const [bookmark] = await db
    .select()
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.user_id, userId),
        eq(bookmarks.list_id, listId),
        isNull(bookmarks.list_item_id)
      )
    )
    .limit(1);

  return !!bookmark;
}

/**
 * Check if a user has bookmarked a list item
 */
export async function isListItemBookmarked(
  userId: string,
  listId: string,
  listItemId: string
): Promise<boolean> {
  const [bookmark] = await db
    .select()
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.user_id, userId),
        eq(bookmarks.list_id, listId),
        eq(bookmarks.list_item_id, listItemId)
      )
    )
    .limit(1);

  return !!bookmark;
}

/**
 * Add a bookmark
 */
export async function addBookmark(
  userId: string,
  listId: string,
  listItemId?: string
): Promise<void> {
  await db.insert(bookmarks).values({
    user_id: userId,
    list_id: listId,
    list_item_id: listItemId || null,
  });
}

/**
 * Remove a bookmark
 */
export async function removeBookmark(
  userId: string,
  listId: string,
  listItemId?: string
): Promise<void> {
  if (listItemId) {
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.user_id, userId),
          eq(bookmarks.list_id, listId),
          eq(bookmarks.list_item_id, listItemId)
        )
      );
  } else {
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.user_id, userId),
          eq(bookmarks.list_id, listId),
          isNull(bookmarks.list_item_id)
        )
      );
  }
}

/**
 * Get all bookmarked list items for a user and list
 * Returns a Set of list item IDs that are bookmarked
 */
export async function getBookmarkedListItems(
  userId: string,
  listId: string,
  itemIds: string[]
): Promise<Set<string>> {
  if (itemIds.length === 0) {
    return new Set();
  }

  const bookmarkedItems = await db
    .select({
      list_item_id: bookmarks.list_item_id,
    })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.user_id, userId),
        eq(bookmarks.list_id, listId),
        inArray(bookmarks.list_item_id, itemIds)
      )
    );

  return new Set(
    bookmarkedItems
      .map(b => b.list_item_id)
      .filter((id): id is string => id !== null)
  );
}

/**
 * Toggle bookmark (add if not exists, remove if exists)
 */
export async function toggleBookmark(
  userId: string,
  listId: string,
  listItemId?: string
): Promise<{ bookmarked: boolean }> {
  const isBookmarked = listItemId
    ? await isListItemBookmarked(userId, listId, listItemId)
    : await isListBookmarked(userId, listId);

  if (isBookmarked) {
    await removeBookmark(userId, listId, listItemId);
    return { bookmarked: false };
  } else {
    await addBookmark(userId, listId, listItemId);
    return { bookmarked: true };
  }
}

