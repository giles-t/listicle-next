import { db } from '../index';
import { bookmarkCollections, bookmarks } from '../schema';
import { eq, and, sql, asc, desc } from 'drizzle-orm';

export interface Collection {
  id: string;
  name: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CollectionWithCount extends Collection {
  bookmarkCount: number;
}

/**
 * Get all collections for a user
 */
export async function getUserCollections(userId: string): Promise<CollectionWithCount[]> {
  const collections = await db
    .select({
      id: bookmarkCollections.id,
      name: bookmarkCollections.name,
      user_id: bookmarkCollections.user_id,
      created_at: bookmarkCollections.created_at,
      updated_at: bookmarkCollections.updated_at,
      bookmarkCount: sql<number>`(
        SELECT COUNT(*)::int FROM bookmarks 
        WHERE bookmarks.collection_id = bookmark_collections.id
      )`.as('bookmarkCount'),
    })
    .from(bookmarkCollections)
    .where(eq(bookmarkCollections.user_id, userId))
    .orderBy(asc(bookmarkCollections.name));

  return collections.map(c => ({
    ...c,
    bookmarkCount: Number(c.bookmarkCount) || 0,
  }));
}

/**
 * Get a single collection by ID
 */
export async function getCollectionById(
  userId: string,
  collectionId: string
): Promise<CollectionWithCount | null> {
  const [collection] = await db
    .select({
      id: bookmarkCollections.id,
      name: bookmarkCollections.name,
      user_id: bookmarkCollections.user_id,
      created_at: bookmarkCollections.created_at,
      updated_at: bookmarkCollections.updated_at,
      bookmarkCount: sql<number>`(
        SELECT COUNT(*)::int FROM bookmarks 
        WHERE bookmarks.collection_id = bookmark_collections.id
      )`.as('bookmarkCount'),
    })
    .from(bookmarkCollections)
    .where(
      and(
        eq(bookmarkCollections.id, collectionId),
        eq(bookmarkCollections.user_id, userId)
      )
    )
    .limit(1);

  if (!collection) return null;

  return {
    ...collection,
    bookmarkCount: Number(collection.bookmarkCount) || 0,
  };
}

/**
 * Create a new collection
 */
export async function createCollection(
  userId: string,
  name: string
): Promise<Collection> {
  const [collection] = await db
    .insert(bookmarkCollections)
    .values({
      name: name.trim(),
      user_id: userId,
    })
    .returning();

  return collection;
}

/**
 * Update a collection name
 */
export async function updateCollection(
  userId: string,
  collectionId: string,
  name: string
): Promise<Collection | null> {
  const [collection] = await db
    .update(bookmarkCollections)
    .set({
      name: name.trim(),
      updated_at: new Date(),
    })
    .where(
      and(
        eq(bookmarkCollections.id, collectionId),
        eq(bookmarkCollections.user_id, userId)
      )
    )
    .returning();

  return collection || null;
}

/**
 * Delete a collection (bookmarks are preserved with collection_id set to null)
 */
export async function deleteCollection(
  userId: string,
  collectionId: string
): Promise<boolean> {
  const result = await db
    .delete(bookmarkCollections)
    .where(
      and(
        eq(bookmarkCollections.id, collectionId),
        eq(bookmarkCollections.user_id, userId)
      )
    )
    .returning({ id: bookmarkCollections.id });

  return result.length > 0;
}

/**
 * Move a bookmark to a collection (or remove from collection if collectionId is null)
 */
export async function moveBookmarkToCollection(
  userId: string,
  bookmarkId: string,
  collectionId: string | null
): Promise<boolean> {
  // Verify the bookmark belongs to the user
  const [bookmark] = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.id, bookmarkId),
        eq(bookmarks.user_id, userId)
      )
    )
    .limit(1);

  if (!bookmark) return false;

  // If collectionId is provided, verify it belongs to the user
  if (collectionId) {
    const [collection] = await db
      .select({ id: bookmarkCollections.id })
      .from(bookmarkCollections)
      .where(
        and(
          eq(bookmarkCollections.id, collectionId),
          eq(bookmarkCollections.user_id, userId)
        )
      )
      .limit(1);

    if (!collection) return false;
  }

  // Update the bookmark's collection
  await db
    .update(bookmarks)
    .set({ collection_id: collectionId })
    .where(eq(bookmarks.id, bookmarkId));

  return true;
}

/**
 * Get the current collection for a bookmark
 */
export async function getBookmarkCollection(
  userId: string,
  bookmarkId: string
): Promise<Collection | null> {
  const [result] = await db
    .select({
      collection_id: bookmarks.collection_id,
    })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.id, bookmarkId),
        eq(bookmarks.user_id, userId)
      )
    )
    .limit(1);

  if (!result || !result.collection_id) return null;

  const [collection] = await db
    .select()
    .from(bookmarkCollections)
    .where(eq(bookmarkCollections.id, result.collection_id))
    .limit(1);

  return collection || null;
}

/**
 * Check if a collection name already exists for a user
 */
export async function collectionNameExists(
  userId: string,
  name: string,
  excludeCollectionId?: string
): Promise<boolean> {
  const conditions = [
    eq(bookmarkCollections.user_id, userId),
    sql`LOWER(${bookmarkCollections.name}) = LOWER(${name.trim()})`,
  ];

  if (excludeCollectionId) {
    conditions.push(sql`${bookmarkCollections.id} != ${excludeCollectionId}`);
  }

  const [result] = await db
    .select({ id: bookmarkCollections.id })
    .from(bookmarkCollections)
    .where(and(...conditions))
    .limit(1);

  return !!result;
}
