import { db } from '../index';
import { follows, profiles, notifications } from '../schema';
import { eq, and, count } from 'drizzle-orm';

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

/**
 * Follow a user
 * Creates a follow relationship and a notification for the followed user
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; alreadyFollowing?: boolean }> {
  // Check if already following
  const existing = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(
      eq(follows.follower_id, followerId),
      eq(follows.following_id, followingId)
    ))
    .limit(1);

  if (existing.length > 0) {
    return { success: true, alreadyFollowing: true };
  }

  // Create the follow relationship
  await db.insert(follows).values({
    follower_id: followerId,
    following_id: followingId,
  });

  // Create notification for the followed user
  await db.insert(notifications).values({
    type: 'follow',
    user_id: followingId, // The person being followed receives the notification
    actor_id: followerId, // The person who followed
  });

  return { success: true, alreadyFollowing: false };
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; wasFollowing: boolean }> {
  const result = await db
    .delete(follows)
    .where(and(
      eq(follows.follower_id, followerId),
      eq(follows.following_id, followingId)
    ))
    .returning({ id: follows.id });

  return {
    success: true,
    wasFollowing: result.length > 0,
  };
}

/**
 * Check if a user is following another user
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const [result] = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(
      eq(follows.follower_id, followerId),
      eq(follows.following_id, followingId)
    ))
    .limit(1);

  return !!result;
}

/**
 * Get follower and following counts for a user
 */
export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  // Get followers count (people following this user)
  const [followersResult] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.following_id, userId));

  // Get following count (people this user is following)
  const [followingResult] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.follower_id, userId));

  return {
    followersCount: followersResult?.count || 0,
    followingCount: followingResult?.count || 0,
  };
}

export interface FollowerInfo {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  followed_at: Date;
}

/**
 * Get list of followers for a user
 */
export async function getFollowers(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<FollowerInfo[]> {
  const results = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      name: profiles.name,
      avatar: profiles.avatar,
      followed_at: follows.created_at,
    })
    .from(follows)
    .innerJoin(profiles, eq(follows.follower_id, profiles.id))
    .where(eq(follows.following_id, userId))
    .limit(limit)
    .offset(offset);

  return results;
}

/**
 * Get list of users that a user is following
 */
export async function getFollowing(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<FollowerInfo[]> {
  const results = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      name: profiles.name,
      avatar: profiles.avatar,
      followed_at: follows.created_at,
    })
    .from(follows)
    .innerJoin(profiles, eq(follows.following_id, profiles.id))
    .where(eq(follows.follower_id, userId))
    .limit(limit)
    .offset(offset);

  return results;
}
