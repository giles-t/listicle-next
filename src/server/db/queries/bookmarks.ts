import { db } from '../index';
import { bookmarks, lists, listItems, profiles, reactions, comments, categories, listToCategories, bookmarkCollections } from '../schema';
import { eq, and, isNull, inArray, desc, asc, sql, ilike, or } from 'drizzle-orm';

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
  listItemId?: string,
  collectionId?: string | null
): Promise<{ id: string }> {
  const [bookmark] = await db.insert(bookmarks).values({
    user_id: userId,
    list_id: listId,
    list_item_id: listItemId || null,
    collection_id: collectionId || null,
  }).returning({ id: bookmarks.id });
  
  return bookmark;
}

/**
 * Update a bookmark's collection
 */
export async function updateBookmarkCollection(
  userId: string,
  listId: string,
  collectionId: string | null,
  listItemId?: string
): Promise<void> {
  if (listItemId) {
    await db
      .update(bookmarks)
      .set({ collection_id: collectionId })
      .where(
        and(
          eq(bookmarks.user_id, userId),
          eq(bookmarks.list_id, listId),
          eq(bookmarks.list_item_id, listItemId)
        )
      );
  } else {
    await db
      .update(bookmarks)
      .set({ collection_id: collectionId })
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
  listItemId?: string,
  collectionId?: string | null
): Promise<{ bookmarked: boolean; bookmarkId?: string }> {
  const isBookmarked = listItemId
    ? await isListItemBookmarked(userId, listId, listItemId)
    : await isListBookmarked(userId, listId);

  if (isBookmarked) {
    await removeBookmark(userId, listId, listItemId);
    return { bookmarked: false };
  } else {
    const bookmark = await addBookmark(userId, listId, listItemId, collectionId);
    return { bookmarked: true, bookmarkId: bookmark.id };
  }
}

/**
 * Get existing bookmark for a list or list item
 */
export async function getExistingBookmark(
  userId: string,
  listId: string,
  listItemId?: string
): Promise<{ id: string; collection_id: string | null } | null> {
  const conditions = [
    eq(bookmarks.user_id, userId),
    eq(bookmarks.list_id, listId),
  ];
  
  if (listItemId) {
    conditions.push(eq(bookmarks.list_item_id, listItemId));
  } else {
    conditions.push(isNull(bookmarks.list_item_id));
  }

  const [bookmark] = await db
    .select({
      id: bookmarks.id,
      collection_id: bookmarks.collection_id,
    })
    .from(bookmarks)
    .where(and(...conditions))
    .limit(1);

  return bookmark || null;
}

export type SortOption = 'newest' | 'oldest' | 'alphabetical';

export interface BookmarkWithDetails {
  id: string;
  created_at: Date;
  type: 'list' | 'list_item';
  collection: {
    id: string;
    name: string;
  } | null;
  list: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    cover_image: string | null;
    view_count: number;
    published_at: Date | null;
  };
  list_item: {
    id: string;
    title: string;
    content: string;
    image: string | null;
    media_url: string | null;
  } | null;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  }>;
  stats: {
    reactions: number;
    comments: number;
  };
}

/**
 * Get all bookmarks for a user with full details
 */
export async function getUserBookmarks(
  userId: string,
  options?: {
    search?: string;
    categorySlug?: string;
    collectionId?: string | null; // null = uncategorized, undefined = all
    sortBy?: SortOption;
    limit?: number;
    offset?: number;
  }
): Promise<BookmarkWithDetails[]> {
  const { search, categorySlug, collectionId, sortBy = 'newest', limit = 50, offset = 0 } = options || {};

  // Build where conditions
  const whereConditions = [
    eq(bookmarks.user_id, userId),
    eq(lists.is_published, true), // Only show bookmarks for published lists
  ];

  // Filter by collection
  if (collectionId !== undefined) {
    if (collectionId === null) {
      // Filter to uncategorized (no collection)
      whereConditions.push(isNull(bookmarks.collection_id));
    } else {
      // Filter to specific collection
      whereConditions.push(eq(bookmarks.collection_id, collectionId));
    }
  }

  // Get all bookmarks for the user with list/item details
  const bookmarkRows = await db
    .select({
      id: bookmarks.id,
      created_at: bookmarks.created_at,
      list_id: bookmarks.list_id,
      list_item_id: bookmarks.list_item_id,
      collection_id: bookmarks.collection_id,
      // List fields
      list_title: lists.title,
      list_description: lists.description,
      list_slug: lists.slug,
      list_cover_image: lists.cover_image,
      list_view_count: lists.view_count,
      list_published_at: lists.published_at,
      list_user_id: lists.user_id,
      // Author fields
      author_id: profiles.id,
      author_username: profiles.username,
      author_name: profiles.name,
      author_avatar: profiles.avatar,
    })
    .from(bookmarks)
    .innerJoin(lists, eq(bookmarks.list_id, lists.id))
    .innerJoin(profiles, eq(lists.user_id, profiles.id))
    .where(and(...whereConditions));

  // Get list item details for bookmarks that have list_item_id
  const bookmarksWithItems = bookmarkRows.filter(b => b.list_item_id);
  const listItemIds = bookmarksWithItems.map(b => b.list_item_id!);
  
  let listItemsMap = new Map<string, { id: string; title: string; content: string; image: string | null; media_url: string | null }>();
  if (listItemIds.length > 0) {
    const listItemRows = await db
      .select({
        id: listItems.id,
        title: listItems.title,
        content: listItems.content,
        image: listItems.image,
        media_url: listItems.media_url,
      })
      .from(listItems)
      .where(inArray(listItems.id, listItemIds));
    
    listItemsMap = new Map(listItemRows.map(item => [item.id, item]));
  }

  // Get categories for all lists
  const listIds = [...new Set(bookmarkRows.map(b => b.list_id))];
  let categoriesMap = new Map<string, Array<{ id: string; name: string; slug: string; icon: string; color: string }>>();
  
  if (listIds.length > 0) {
    const categoryRows = await db
      .select({
        list_id: listToCategories.list_id,
        category_id: categories.id,
        category_name: categories.name,
        category_slug: categories.slug,
        category_icon: categories.icon,
        category_color: categories.color,
      })
      .from(listToCategories)
      .innerJoin(categories, eq(listToCategories.category_id, categories.id))
      .where(inArray(listToCategories.list_id, listIds));
    
    for (const row of categoryRows) {
      const existing = categoriesMap.get(row.list_id) || [];
      existing.push({
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        icon: row.category_icon,
        color: row.category_color,
      });
      categoriesMap.set(row.list_id, existing);
    }
  }

  // Get reaction counts for all lists
  let reactionCountsMap = new Map<string, number>();
  if (listIds.length > 0) {
    const reactionCounts = await db
      .select({
        list_id: reactions.list_id,
        count: sql<number>`count(*)::int`,
      })
      .from(reactions)
      .where(inArray(reactions.list_id, listIds))
      .groupBy(reactions.list_id);
    
    reactionCountsMap = new Map(reactionCounts.map(r => [r.list_id, r.count]));
  }

  // Get comment counts for all lists
  let commentCountsMap = new Map<string, number>();
  if (listIds.length > 0) {
    const commentCounts = await db
      .select({
        list_id: comments.list_id,
        count: sql<number>`count(*)::int`,
      })
      .from(comments)
      .where(inArray(comments.list_id, listIds))
      .groupBy(comments.list_id);
    
    commentCountsMap = new Map(commentCounts.map(c => [c.list_id, c.count]));
  }

  // Get collections for all bookmarks
  const collectionIds = [...new Set(bookmarkRows.map(b => b.collection_id).filter((id): id is string => id !== null))];
  let collectionsMap = new Map<string, { id: string; name: string }>();
  
  if (collectionIds.length > 0) {
    const collectionRows = await db
      .select({
        id: bookmarkCollections.id,
        name: bookmarkCollections.name,
      })
      .from(bookmarkCollections)
      .where(inArray(bookmarkCollections.id, collectionIds));
    
    collectionsMap = new Map(collectionRows.map(c => [c.id, c]));
  }

  // Build result
  let result: BookmarkWithDetails[] = bookmarkRows.map(row => {
    const listItem = row.list_item_id ? listItemsMap.get(row.list_item_id) || null : null;
    const collection = row.collection_id ? collectionsMap.get(row.collection_id) || null : null;
    
    return {
      id: row.id,
      created_at: row.created_at,
      type: row.list_item_id ? 'list_item' : 'list' as const,
      collection,
      list: {
        id: row.list_id,
        title: row.list_title,
        description: row.list_description,
        slug: row.list_slug,
        cover_image: row.list_cover_image,
        view_count: row.list_view_count,
        published_at: row.list_published_at,
      },
      list_item: listItem,
      author: {
        id: row.author_id,
        username: row.author_username,
        name: row.author_name,
        avatar: row.author_avatar,
      },
      categories: categoriesMap.get(row.list_id) || [],
      stats: {
        reactions: reactionCountsMap.get(row.list_id) || 0,
        comments: commentCountsMap.get(row.list_id) || 0,
      },
    };
  });

  // Apply search filter
  if (search && search.trim()) {
    const searchLower = search.toLowerCase().trim();
    result = result.filter(bookmark => {
      const title = bookmark.list_item?.title || bookmark.list.title;
      const description = bookmark.list_item?.content || bookmark.list.description || '';
      return (
        title.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower) ||
        bookmark.author.name.toLowerCase().includes(searchLower) ||
        bookmark.author.username.toLowerCase().includes(searchLower)
      );
    });
  }

  // Apply category filter
  if (categorySlug) {
    result = result.filter(bookmark => 
      bookmark.categories.some(cat => cat.slug === categorySlug)
    );
  }

  // Apply sorting
  switch (sortBy) {
    case 'oldest':
      result.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
      break;
    case 'alphabetical':
      result.sort((a, b) => {
        const titleA = a.list_item?.title || a.list.title;
        const titleB = b.list_item?.title || b.list.title;
        return titleA.localeCompare(titleB);
      });
      break;
    case 'newest':
    default:
      result.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      break;
  }

  // Apply pagination
  return result.slice(offset, offset + limit);
}

/**
 * Get count of user bookmarks
 */
export async function getUserBookmarksCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookmarks)
    .innerJoin(lists, eq(bookmarks.list_id, lists.id))
    .where(
      and(
        eq(bookmarks.user_id, userId),
        eq(lists.is_published, true)
      )
    );
  
  return result?.count || 0;
}

/**
 * Delete a bookmark by ID (for the authenticated user)
 */
export async function deleteBookmarkById(
  userId: string,
  bookmarkId: string
): Promise<boolean> {
  const result = await db
    .delete(bookmarks)
    .where(
      and(
        eq(bookmarks.id, bookmarkId),
        eq(bookmarks.user_id, userId)
      )
    )
    .returning({ id: bookmarks.id });
  
  return result.length > 0;
}

