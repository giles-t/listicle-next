import { db } from '../index';
import { profiles, lists, reactions, comments, follows } from '../schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

export interface CreateUserData {
  id: string;
  username?: string;
  name?: string;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
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
 * Check if user needs onboarding
 * If profile doesn't exist, user needs onboarding (username is required in profile)
 */
export function needsOnboarding(profile: { id: string } | null | undefined): boolean {
  return !profile;
}

/**
 * Get user profile by ID
 */
export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);

  return user || null;
}

/**
 * Get user profile by username (case-insensitive)
 */
export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const normalizedUsername = username.toLowerCase();
  const [user] = await db
    .select()
    .from(profiles)
    .where(sql`LOWER(${profiles.username}) = ${normalizedUsername}`)
    .limit(1);

  return user || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  id: string,
  updates: Partial<{
    username: string;
    name: string;
    bio: string;
    location: string;
    avatar: string;
    website: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    github: string;
  }>
) {
  const [updatedUser] = await db
    .update(profiles)
    .set({
      ...updates,
      updated_at: new Date(),
    })
    .where(eq(profiles.id, id))
    .returning();

  return updatedUser || null;
}

/**
 * Get user statistics for profile page
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const [result] = await db
    .select({
      listsCount: sql<number>`(SELECT COUNT(*) FROM lists WHERE user_id = ${userId} AND is_published = true)`,
      totalLikes: sql<number>`(SELECT COUNT(*) FROM reactions r INNER JOIN lists l ON r.list_id = l.id WHERE l.user_id = ${userId} AND l.is_published = true)`,
      totalComments: sql<number>`(SELECT COUNT(*) FROM comments c INNER JOIN lists l ON c.list_id = l.id WHERE l.user_id = ${userId} AND l.is_published = true)`,
      totalViews: sql<number>`(SELECT COALESCE(SUM(view_count), 0)::int FROM lists WHERE user_id = ${userId} AND is_published = true)`,
      followersCount: sql<number>`(SELECT COUNT(*) FROM follows WHERE following_id = ${userId})`,
      followingCount: sql<number>`(SELECT COUNT(*) FROM follows WHERE follower_id = ${userId})`,
    })
    .from(sql`(SELECT 1) as dummy`);

  return {
    listsCount: result?.listsCount || 0,
    totalViews: result?.totalViews || 0,
    totalLikes: result?.totalLikes || 0,
    totalComments: result?.totalComments || 0,
    followersCount: result?.followersCount || 0,
    followingCount: result?.followingCount || 0,
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
      )`.as('likesCount'),
      commentsCount: sql<number>`(
        SELECT COUNT(*) FROM ${comments} 
        WHERE ${comments.list_id} = ${lists.id}
      )`.as('commentsCount'),
      viewsCount: lists.view_count,
    })
    .from(lists)
    .where(and(eq(lists.user_id, userId), eq(lists.is_published, true)))
    .orderBy(desc(lists.published_at))
    .limit(limit);

  return userLists;
}

/**
 * Check if current user is following the profile user
 */
export async function isFollowing(
  currentUserId: string,
  profileUserId: string
): Promise<boolean> {
  const [result] = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(
      eq(follows.follower_id, currentUserId),
      eq(follows.following_id, profileUserId)
    ))
    .limit(1);

  return !!result;
}

export type SortOption = 'recent' | 'popular' | 'oldest';

export interface PaginatedListsResult {
  lists: UserListPreview[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Get user's published lists with pagination and sorting
 */
export async function getUserLists(
  userId: string,
  options: {
    page?: number;
    perPage?: number;
    sort?: SortOption;
  } = {}
): Promise<PaginatedListsResult> {
  const { page = 1, perPage = 10, sort = 'recent' } = options;
  const offset = (page - 1) * perPage;

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(lists)
    .where(and(eq(lists.user_id, userId), eq(lists.is_published, true)));

  const total = countResult?.count || 0;

  // Determine sort order
  let orderByClause;
  switch (sort) {
    case 'popular':
      orderByClause = sql`(
        SELECT COUNT(*) FROM ${reactions} 
        WHERE ${reactions.list_id} = ${lists.id}
      ) DESC`;
      break;
    case 'oldest':
      orderByClause = sql`${lists.published_at} ASC`;
      break;
    case 'recent':
    default:
      orderByClause = sql`${lists.published_at} DESC`;
      break;
  }

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
      )`.as('likesCount'),
      commentsCount: sql<number>`(
        SELECT COUNT(*) FROM ${comments} 
        WHERE ${comments.list_id} = ${lists.id}
      )`.as('commentsCount'),
      viewsCount: lists.view_count,
    })
    .from(lists)
    .where(and(eq(lists.user_id, userId), eq(lists.is_published, true)))
    .orderBy(orderByClause)
    .limit(perPage)
    .offset(offset);

  return {
    lists: userLists,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Get a published list by username and slug
 */
export interface ListByUsernameAndSlug {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  list_type: 'ordered' | 'unordered' | 'reversed';
  cover_image: string | null;
  is_published: boolean;
  is_visible: boolean;
  allow_comments: boolean;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  user_id: string;
  publication_id: string | null;
  username: string;
  author_name: string;
  author_avatar: string | null;
  likesCount: number;
  commentsCount: number;
}

export async function getListByUsernameAndSlug(
  username: string,
  slug: string
): Promise<ListByUsernameAndSlug | null> {
  const [list] = await db
    .select({
      id: lists.id,
      title: lists.title,
      description: lists.description,
      slug: lists.slug,
      list_type: lists.list_type,
      cover_image: lists.cover_image,
      is_published: lists.is_published,
      is_visible: lists.is_visible,
      allow_comments: lists.allow_comments,
      created_at: lists.created_at,
      updated_at: lists.updated_at,
      published_at: lists.published_at,
      user_id: lists.user_id,
      publication_id: lists.publication_id,
      // User info
      username: profiles.username,
      author_name: profiles.name,
      author_avatar: profiles.avatar,
      // Counts
      likesCount: sql<number>`(
        SELECT COUNT(*) FROM ${reactions} 
        WHERE ${reactions.list_id} = ${lists.id}
      )`.as('likesCount'),
      commentsCount: sql<number>`(
        SELECT COUNT(*) FROM ${comments} 
        WHERE ${comments.list_id} = ${lists.id}
      )`.as('commentsCount'),
    })
    .from(lists)
    .innerJoin(profiles, eq(lists.user_id, profiles.id))
    .where(
      and(
        sql`LOWER(${profiles.username}) = ${username.toLowerCase()}`,
        eq(lists.slug, slug),
        eq(lists.is_published, true)
      )
    )
    .limit(1);

  return list || null;
}
