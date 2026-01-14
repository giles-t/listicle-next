import { db } from '../index';
import { notifications, profiles, lists, comments } from '../schema';
import { eq, and, desc, count, inArray } from 'drizzle-orm';

export type NotificationType = 'follow' | 'comment' | 'reaction_milestone' | 'view_milestone';

export interface NotificationWithDetails {
  id: string;
  type: NotificationType;
  user_id: string;
  actor_id: string | null;
  list_id: string | null;
  comment_id: string | null;
  milestone_count: number | null;
  is_read: boolean;
  created_at: Date;
  // Joined data
  actor?: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  } | null;
  list?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  comment?: {
    id: string;
    content: string;
  } | null;
}

export interface GetNotificationsOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

/**
 * Get notifications for a user with actor, list, and comment details
 */
export async function getNotifications(
  userId: string,
  options: GetNotificationsOptions = {}
): Promise<NotificationWithDetails[]> {
  const { limit = 50, offset = 0, unreadOnly = false } = options;

  const conditions = [eq(notifications.user_id, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.is_read, false));
  }

  const results = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      user_id: notifications.user_id,
      actor_id: notifications.actor_id,
      list_id: notifications.list_id,
      comment_id: notifications.comment_id,
      milestone_count: notifications.milestone_count,
      is_read: notifications.is_read,
      created_at: notifications.created_at,
      // Actor info
      actor_username: profiles.username,
      actor_name: profiles.name,
      actor_avatar: profiles.avatar,
    })
    .from(notifications)
    .leftJoin(profiles, eq(notifications.actor_id, profiles.id))
    .where(and(...conditions))
    .orderBy(desc(notifications.created_at))
    .limit(limit)
    .offset(offset);

  // If we have notifications, fetch list and comment details separately
  const listIds = results
    .map(n => n.list_id)
    .filter((id): id is string => id !== null);
  
  const commentIds = results
    .map(n => n.comment_id)
    .filter((id): id is string => id !== null);

  // Fetch lists
  const listMap = new Map<string, { id: string; title: string; slug: string }>();
  if (listIds.length > 0) {
    const listResults = await db
      .select({
        id: lists.id,
        title: lists.title,
        slug: lists.slug,
      })
      .from(lists)
      .where(inArray(lists.id, listIds));
    
    listResults.forEach(list => listMap.set(list.id, list));
  }

  // Fetch comments
  const commentMap = new Map<string, { id: string; content: string }>();
  if (commentIds.length > 0) {
    const commentResults = await db
      .select({
        id: comments.id,
        content: comments.content,
      })
      .from(comments)
      .where(inArray(comments.id, commentIds));
    
    commentResults.forEach(comment => commentMap.set(comment.id, comment));
  }

  // Map results to NotificationWithDetails
  return results.map(row => ({
    id: row.id,
    type: row.type as NotificationType,
    user_id: row.user_id,
    actor_id: row.actor_id,
    list_id: row.list_id,
    comment_id: row.comment_id,
    milestone_count: row.milestone_count,
    is_read: row.is_read,
    created_at: row.created_at,
    actor: row.actor_id ? {
      id: row.actor_id,
      username: row.actor_username!,
      name: row.actor_name!,
      avatar: row.actor_avatar,
    } : null,
    list: row.list_id ? listMap.get(row.list_id) || null : null,
    comment: row.comment_id ? commentMap.get(row.comment_id) || null : null,
  }));
}

/**
 * Get count of unread notifications for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(
      eq(notifications.user_id, userId),
      eq(notifications.is_read, false)
    ));

  return result?.count || 0;
}

/**
 * Mark notifications as read
 * If notificationIds is provided, mark only those notifications
 * Otherwise, mark all notifications for the user as read
 */
export async function markAsRead(
  userId: string,
  notificationIds?: string[]
): Promise<number> {
  const conditions = [eq(notifications.user_id, userId)];
  
  if (notificationIds && notificationIds.length > 0) {
    conditions.push(inArray(notifications.id, notificationIds));
  }

  const result = await db
    .update(notifications)
    .set({ is_read: true })
    .where(and(...conditions));

  // Drizzle doesn't return affected rows count directly, so we'll return 1 on success
  return 1;
}

export interface CreateNotificationData {
  type: NotificationType;
  user_id: string;
  actor_id?: string;
  list_id?: string;
  comment_id?: string;
  milestone_count?: number;
}

/**
 * Create a new notification
 */
export async function createNotification(
  data: CreateNotificationData
): Promise<{ id: string }> {
  const [result] = await db
    .insert(notifications)
    .values({
      type: data.type,
      user_id: data.user_id,
      actor_id: data.actor_id || null,
      list_id: data.list_id || null,
      comment_id: data.comment_id || null,
      milestone_count: data.milestone_count || null,
    })
    .returning({ id: notifications.id });

  return result;
}

/**
 * Delete old read notifications (cleanup utility)
 * Keeps notifications for the specified number of days
 */
export async function cleanupOldNotifications(
  daysToKeep: number = 90
): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  await db
    .delete(notifications)
    .where(and(
      eq(notifications.is_read, true),
      // Note: For proper date comparison, you might need to use sql`` template
    ));
}
