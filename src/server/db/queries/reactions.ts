import { db } from '@/src/server/db';
import { reactions, profiles } from '@/src/server/db/schema';
import { eq, and, sql, desc, isNull, inArray } from 'drizzle-orm';
import { redis } from '@/src/server/redis';

/**
 * Get all reactions for a list with counts grouped by emoji
 */
export async function getListReactions(listId: string) {
  try {
    const result = await db
      .select({
        emoji: reactions.emoji,
        count: sql<number>`count(*)::int`,
        userIds: sql<string[]>`array_agg(${reactions.user_id})`,
      })
      .from(reactions)
      .where(
        and(
          eq(reactions.list_id, listId),
          isNull(reactions.list_item_id)
        )
      )
      .groupBy(reactions.emoji)
      .orderBy(sql`min(${reactions.created_at})`); // Order by first use (most efficient)

    return result;
  } catch (error) {
    console.error('[getListReactions] Error:', error);
    return [];
  }
}

/**
 * Get all reactions for a list item with counts grouped by emoji
 */
export async function getListItemReactions(listItemId: string) {
  const result = await db
    .select({
      emoji: reactions.emoji,
      count: sql<number>`count(*)::int`,
      userIds: sql<string[]>`array_agg(${reactions.user_id})`,
    })
    .from(reactions)
    .where(eq(reactions.list_item_id, listItemId))
    .groupBy(reactions.emoji)
    .orderBy(sql`min(${reactions.created_at})`); // Order by first use (most efficient)

  return result;
}

/**
 * Get ALL reactions aggregate data (counts only, no user-specific data)
 * Cached in Redis for high performance
 */
export async function getAllListReactionsAggregate(listId: string) {
  try {
    const cacheKey = `reactions:aggregate:${listId}`;
    
    // Try to get cached aggregate data
    let aggregateData: Array<{
      list_item_id: string | null;
      emoji: string;
      count: number;
    }> | null = await redis.get(cacheKey);

    // If not cached, fetch from database and cache it
    if (!aggregateData) {
      const dbResults = await db
        .select({
          list_item_id: reactions.list_item_id,
          emoji: reactions.emoji,
          count: sql<number>`count(*)::int`,
        })
        .from(reactions)
        .where(eq(reactions.list_id, listId))
        .groupBy(reactions.list_item_id, reactions.emoji)
        .orderBy(sql`min(${reactions.created_at})`);

      aggregateData = dbResults;
      
      // Cache for 5 minutes - invalidated on writes, so can be long
      // Fire-and-forget (don't await to keep response fast)
      redis.set(cacheKey, aggregateData, { ex: 300 }).catch(err => 
        console.error('[Redis] Failed to cache reactions:', err)
      );
    }

    // Return aggregate data only (no user-specific info)
    const listReactions = aggregateData
      .filter(r => r.list_item_id === null)
      .map(r => ({
        emoji: r.emoji,
        count: r.count,
      }));

    // Group item reactions by item ID
    const itemReactions = aggregateData
      .filter(r => r.list_item_id !== null)
      .reduce((acc, r) => {
        const itemId = r.list_item_id!;
        if (!acc[itemId]) {
          acc[itemId] = [];
        }
        acc[itemId].push({
          emoji: r.emoji,
          count: r.count,
        });
        return acc;
      }, {} as Record<string, Array<{ emoji: string; count: number }>>);

    return {
      list: listReactions,
      items: itemReactions,
    };
  } catch (error) {
    console.error('[getAllListReactionsAggregate] Error:', error);
    return {
      list: [],
      items: {},
    };
  }
}

/**
 * Get user's reactions for a list and all its items (fetched once on page load)
 */
export async function getUserListReactionsAll(listId: string, userId: string) {
  try {
    const userReactions = await db
      .select({
        emoji: reactions.emoji,
        list_item_id: reactions.list_item_id,
      })
      .from(reactions)
      .where(
        and(
          eq(reactions.list_id, listId),
          eq(reactions.user_id, userId)
        )
      );

    // Separate list reactions from item reactions
    const listReactions = userReactions
      .filter(r => r.list_item_id === null)
      .map(r => r.emoji);

    // Group item reactions by item ID
    const itemReactions = userReactions
      .filter(r => r.list_item_id !== null)
      .reduce((acc, r) => {
        const itemId = r.list_item_id!;
        if (!acc[itemId]) {
          acc[itemId] = [];
        }
        acc[itemId].push(r.emoji);
        return acc;
      }, {} as Record<string, string[]>);

    return {
      list: listReactions,
      items: itemReactions,
    };
  } catch (error) {
    console.error('[getUserListReactionsAll] Error:', error);
    return {
      list: [],
      items: {},
    };
  }
}

/**
 * Get user's reactions for a list
 */
export async function getUserListReactions(listId: string, userId: string) {
  try {
    const result = await db
      .select({
        emoji: reactions.emoji,
      })
      .from(reactions)
      .where(
        and(
          eq(reactions.list_id, listId),
          eq(reactions.user_id, userId),
          isNull(reactions.list_item_id)
        )
      );

    return result.map((r) => r.emoji);
  } catch (error) {
    console.error('[getUserListReactions] Error:', error);
    return [];
  }
}

/**
 * Add a reaction to a list
 */
export async function addListReaction(
  listId: string,
  userId: string,
  emoji: string
) {
  try {
    const result = await db
      .insert(reactions)
      .values({
        list_id: listId,
        user_id: userId,
        emoji: emoji,
        list_item_id: null,
      })
      .returning();

    // Invalidate Redis cache for this list (fire-and-forget)
    redis.del(`reactions:aggregate:${listId}`).catch(err =>
      console.error('[Redis] Failed to invalidate cache:', err)
    );

    return { success: true, reaction: result[0] };
  } catch (error: any) {
    // Handle duplicate reaction (unique constraint violation)
    if (error.code === '23505') {
      return { success: false, error: 'Reaction already exists' };
    }
    throw error;
  }
}

/**
 * Remove a reaction from a list
 */
export async function removeListReaction(
  listId: string,
  userId: string,
  emoji: string
) {
  const result = await db
    .delete(reactions)
    .where(
      and(
        eq(reactions.list_id, listId),
        eq(reactions.user_id, userId),
        eq(reactions.emoji, emoji),
        isNull(reactions.list_item_id)
      )
    )
    .returning();

  // Invalidate Redis cache for this list (fire-and-forget)
  redis.del(`reactions:aggregate:${listId}`).catch(err =>
    console.error('[Redis] Failed to invalidate cache:', err)
  );

  return { success: result.length > 0, reaction: result[0] };
}

/**
 * Add a reaction to a list item
 */
export async function addListItemReaction(
  listId: string,
  listItemId: string,
  userId: string,
  emoji: string
) {
  try {
    const result = await db
      .insert(reactions)
      .values({
        list_id: listId,
        list_item_id: listItemId,
        user_id: userId,
        emoji: emoji,
      })
      .returning();

    // Invalidate Redis cache for this list (fire-and-forget)
    redis.del(`reactions:aggregate:${listId}`).catch(err =>
      console.error('[Redis] Failed to invalidate cache:', err)
    );

    return { success: true, reaction: result[0] };
  } catch (error: any) {
    // Handle duplicate reaction (unique constraint violation)
    if (error.code === '23505') {
      return { success: false, error: 'Reaction already exists' };
    }
    throw error;
  }
}

/**
 * Remove a reaction from a list item
 */
export async function removeListItemReaction(
  listId: string,
  listItemId: string,
  userId: string,
  emoji: string
) {
  const result = await db
    .delete(reactions)
    .where(
      and(
        eq(reactions.list_id, listId),
        eq(reactions.list_item_id, listItemId),
        eq(reactions.user_id, userId),
        eq(reactions.emoji, emoji)
      )
    )
    .returning();

  // Invalidate Redis cache for this list (fire-and-forget)
  redis.del(`reactions:aggregate:${listId}`).catch(err =>
    console.error('[Redis] Failed to invalidate cache:', err)
  );

  return { success: result.length > 0, reaction: result[0] };
}

/**
 * Get all reactions for a list/item with user profile details
 * Used for the reactions drawer to show who reacted with what
 */
export async function getReactionsWithProfiles(
  listId: string,
  listItemId?: string | null
) {
  try {
    const result = await db
      .select({
        id: reactions.id,
        emoji: reactions.emoji,
        created_at: reactions.created_at,
        user: {
          id: profiles.id,
          username: profiles.username,
          name: profiles.name,
          avatar: profiles.avatar,
          bio: profiles.bio,
        },
      })
      .from(reactions)
      .innerJoin(profiles, eq(reactions.user_id, profiles.id))
      .where(
        listItemId
          ? and(
              eq(reactions.list_id, listId),
              eq(reactions.list_item_id, listItemId)
            )
          : and(
              eq(reactions.list_id, listId),
              isNull(reactions.list_item_id)
            )
      )
      .orderBy(desc(reactions.created_at));

    return result;
  } catch (error) {
    console.error('[getReactionsWithProfiles] Error:', error);
    return [];
  }
}

