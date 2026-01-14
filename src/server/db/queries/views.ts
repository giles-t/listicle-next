import { db } from '../index';
import { lists, listItems } from '../schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { redis } from '@/src/server/redis';

// Redis key patterns
const LIST_VIEW_KEY = (listId: string) => `views:list:${listId}`;
const ITEM_VIEW_KEY = (itemId: string) => `views:item:${itemId}`;

/**
 * Track a view for a list using HyperLogLog
 * @param listId - The list ID to track
 * @param visitorId - Unique visitor identifier (user ID or hashed IP)
 */
export async function trackListView(listId: string, visitorId: string): Promise<void> {
  try {
    const key = LIST_VIEW_KEY(listId);
    // PFADD adds the visitor to the HyperLogLog, returns 1 if new, 0 if exists
    await redis.pfadd(key, visitorId);
  } catch (error) {
    console.error('[trackListView] Error:', error);
    // Non-critical - don't throw, just log
  }
}

/**
 * Track views for multiple list items using HyperLogLog
 * @param itemIds - Array of item IDs to track
 * @param visitorId - Unique visitor identifier (user ID or hashed IP)
 */
export async function trackItemViews(itemIds: string[], visitorId: string): Promise<void> {
  if (itemIds.length === 0) return;
  
  try {
    // Use pipeline for efficient batch operations
    const pipeline = redis.pipeline();
    
    for (const itemId of itemIds) {
      const key = ITEM_VIEW_KEY(itemId);
      pipeline.pfadd(key, visitorId);
    }
    
    await pipeline.exec();
  } catch (error) {
    console.error('[trackItemViews] Error:', error);
    // Non-critical - don't throw, just log
  }
}

/**
 * Get the unique view count for a list
 * @param listId - The list ID
 * @returns The approximate unique view count
 */
export async function getListViewCount(listId: string): Promise<number> {
  try {
    const key = LIST_VIEW_KEY(listId);
    const count = await redis.pfcount(key);
    return count;
  } catch (error) {
    console.error('[getListViewCount] Error:', error);
    // Fall back to database count
    try {
      const [result] = await db
        .select({ view_count: lists.view_count })
        .from(lists)
        .where(eq(lists.id, listId));
      return result?.view_count ?? 0;
    } catch {
      return 0;
    }
  }
}

/**
 * Get unique view counts for multiple items
 * @param itemIds - Array of item IDs
 * @returns Record of itemId -> view count
 */
export async function getItemViewCounts(itemIds: string[]): Promise<Record<string, number>> {
  if (itemIds.length === 0) return {};
  
  const result: Record<string, number> = {};
  
  try {
    // Use pipeline for efficient batch reads
    const pipeline = redis.pipeline();
    
    for (const itemId of itemIds) {
      const key = ITEM_VIEW_KEY(itemId);
      pipeline.pfcount(key);
    }
    
    const counts = await pipeline.exec();
    
    itemIds.forEach((itemId, index) => {
      result[itemId] = (counts[index] as number) ?? 0;
    });
    
    return result;
  } catch (error) {
    console.error('[getItemViewCounts] Error:', error);
    // Fall back to database counts
    try {
      const dbResults = await db
        .select({ id: listItems.id, view_count: listItems.view_count })
        .from(listItems)
        .where(inArray(listItems.id, itemIds));
      
      for (const item of dbResults) {
        result[item.id] = item.view_count;
      }
      // Fill in zeros for items not found
      for (const itemId of itemIds) {
        if (!(itemId in result)) {
          result[itemId] = 0;
        }
      }
      return result;
    } catch {
      // Return zeros if all fails
      for (const itemId of itemIds) {
        result[itemId] = 0;
      }
      return result;
    }
  }
}

/**
 * Sync view counts from Redis to the database
 * This should be called by a cron job periodically
 * @returns Summary of synced counts
 */
export async function syncViewCountsToDatabase(): Promise<{
  listsUpdated: number;
  itemsUpdated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let listsUpdated = 0;
  let itemsUpdated = 0;
  
  try {
    // Scan for all list view keys
    const listKeys: string[] = [];
    let cursor = 0;
    
    do {
      const [newCursor, keys] = await redis.scan(cursor, {
        match: 'views:list:*',
        count: 100,
      });
      cursor = Number(newCursor);
      listKeys.push(...keys);
    } while (cursor !== 0);
    
    // Update list view counts
    for (const key of listKeys) {
      try {
        const listId = key.replace('views:list:', '');
        const count = await redis.pfcount(key);
        
        await db
          .update(lists)
          .set({ view_count: count })
          .where(eq(lists.id, listId));
        
        listsUpdated++;
      } catch (err) {
        errors.push(`Failed to sync list ${key}: ${err}`);
      }
    }
    
    // Scan for all item view keys
    const itemKeys: string[] = [];
    cursor = 0;
    
    do {
      const [newCursor, keys] = await redis.scan(cursor, {
        match: 'views:item:*',
        count: 100,
      });
      cursor = Number(newCursor);
      itemKeys.push(...keys);
    } while (cursor !== 0);
    
    // Update item view counts
    for (const key of itemKeys) {
      try {
        const itemId = key.replace('views:item:', '');
        const count = await redis.pfcount(key);
        
        await db
          .update(listItems)
          .set({ view_count: count })
          .where(eq(listItems.id, itemId));
        
        itemsUpdated++;
      } catch (err) {
        errors.push(`Failed to sync item ${key}: ${err}`);
      }
    }
    
    return { listsUpdated, itemsUpdated, errors };
  } catch (error) {
    console.error('[syncViewCountsToDatabase] Error:', error);
    errors.push(`Sync failed: ${error}`);
    return { listsUpdated, itemsUpdated, errors };
  }
}

/**
 * Get a visitor identifier from request headers
 * Uses user ID if authenticated, otherwise hashes the IP
 * @param userId - Optional authenticated user ID
 * @param ip - Client IP address
 * @returns A unique visitor identifier
 */
export function getVisitorId(userId: string | null, ip: string | null): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // For anonymous users, use the IP (or a default if not available)
  const clientIp = ip || 'unknown';
  // Simple hash to avoid storing raw IPs
  return `anon:${hashString(clientIp)}`;
}

/**
 * Simple string hash function for anonymizing IPs
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
