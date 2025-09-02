import { db } from '../index';
import { users, lists, reactions, comments } from '../schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  github: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserStats {
  listsCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followersCount: number;
  followingCount: number;
}

export interface UserListPreview {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image: string | null;
  is_published: boolean;
  created_at: Date;
  published_at: Date | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
}

/**
 * Get user profile by username
 */
export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user || null;
}

/**
 * Get user statistics for profile page
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  // Get lists count
  const [listsCountResult] = await db
    .select({ count: count() })
    .from(lists)
    .where(and(eq(lists.user_id, userId), eq(lists.is_published, true)));

  // Get total likes on user's lists
  const [likesResult] = await db
    .select({ count: count() })
    .from(reactions)
    .innerJoin(lists, eq(reactions.list_id, lists.id))
    .where(and(
      eq(lists.user_id, userId),
      eq(lists.is_published, true),
      eq(reactions.reaction_type, 'like')
    ));

  // Get total comments on user's lists
  const [commentsResult] = await db
    .select({ count: count() })
    .from(comments)
    .innerJoin(lists, eq(comments.list_id, lists.id))
    .where(and(eq(lists.user_id, userId), eq(lists.is_published, true)));

  return {
    listsCount: listsCountResult?.count || 0,
    totalViews: 0, // TODO: Implement views tracking
    totalLikes: likesResult?.count || 0,
    totalComments: commentsResult?.count || 0,
    followersCount: 0, // TODO: Implement follow system
    followingCount: 0, // TODO: Implement follow system
  };
}

/**
 * Get user's recent published lists
 */
export async function getUserRecentLists(
  userId: string,
  limit: number = 6
): Promise<UserListPreview[]> {
  const userLists = await db
    .select({
      id: lists.id,
      title: lists.title,
      description: lists.description,
      slug: lists.slug,
      cover_image: lists.cover_image,
      is_published: lists.is_published,
      created_at: lists.created_at,
      published_at: lists.published_at,
      likesCount: sql<number>`(
        SELECT COUNT(*) FROM ${reactions} 
        WHERE ${reactions.list_id} = ${lists.id} 
        AND ${reactions.reaction_type} = 'like'
      )`.as('likesCount'),
      commentsCount: sql<number>`(
        SELECT COUNT(*) FROM ${comments} 
        WHERE ${comments.list_id} = ${lists.id}
      )`.as('commentsCount'),
    })
    .from(lists)
    .where(and(eq(lists.user_id, userId), eq(lists.is_published, true)))
    .orderBy(desc(lists.published_at))
    .limit(limit);

  return userLists.map(list => ({
    ...list,
    viewsCount: 0, // TODO: Implement views tracking
  }));
}

/**
 * Check if current user is following the profile user
 */
export async function isFollowing(
  currentUserId: string,
  profileUserId: string
): Promise<boolean> {
  // TODO: Implement follow system
  return false;
} 