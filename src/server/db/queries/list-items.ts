import { db } from '../index';
import { listItems, comments, reactions } from '../schema';
import { eq, and, sql, isNull, inArray } from 'drizzle-orm';

export interface ListItemStats {
  viewsCount: number;
  reactionsCount: number;
  commentsCount: number;
}

/**
 * Get stats for a single list item
 */
export async function getListItemStats(itemId: string): Promise<ListItemStats> {
  // Get view count from DB
  const [viewResult] = await db
    .select({ view_count: listItems.view_count })
    .from(listItems)
    .where(eq(listItems.id, itemId));

  // Get reactions count
  const [reactionsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reactions)
    .where(eq(reactions.list_item_id, itemId));

  // Get comments count (only top-level comments, not replies)
  const [commentsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(comments)
    .where(
      and(
        eq(comments.list_item_id, itemId),
        isNull(comments.parent_id)
      )
    );

  return {
    viewsCount: viewResult?.view_count || 0,
    reactionsCount: reactionsResult?.count || 0,
    commentsCount: commentsResult?.count || 0,
  };
}

/**
 * Get stats for multiple list items in a single query
 */
export async function getListItemsStats(itemIds: string[]): Promise<Record<string, ListItemStats>> {
  if (itemIds.length === 0) {
    return {};
  }

  // Get reactions counts for all items
  const reactionsResults = await db
    .select({
      list_item_id: reactions.list_item_id,
      count: sql<number>`count(*)::int`,
    })
    .from(reactions)
    .where(inArray(reactions.list_item_id, itemIds))
    .groupBy(reactions.list_item_id);

  // Get comments counts for all items (only top-level comments)
  const commentsResults = await db
    .select({
      list_item_id: comments.list_item_id,
      count: sql<number>`count(*)::int`,
    })
    .from(comments)
    .where(
      and(
        inArray(comments.list_item_id, itemIds),
        isNull(comments.parent_id)
      )
    )
    .groupBy(comments.list_item_id);

  // Get view counts for all items
  const viewResults = await db
    .select({
      id: listItems.id,
      view_count: listItems.view_count,
    })
    .from(listItems)
    .where(inArray(listItems.id, itemIds));

  // Build result map
  const statsMap: Record<string, ListItemStats> = {};
  
  for (const itemId of itemIds) {
    const viewsCount = viewResults.find(v => v.id === itemId)?.view_count || 0;
    const reactionsCount = reactionsResults.find(r => r.list_item_id === itemId)?.count || 0;
    const commentsCount = commentsResults.find(c => c.list_item_id === itemId)?.count || 0;
    
    statsMap[itemId] = {
      viewsCount,
      reactionsCount,
      commentsCount,
    };
  }

  return statsMap;
}

