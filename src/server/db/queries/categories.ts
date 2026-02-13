import { db } from '../index';
import { categories, categoryFollows, listToCategories, lists, profiles, reactions, comments } from '../schema';
import { eq, and, desc, asc, sql, count, ilike } from 'drizzle-orm';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryWithStats extends Category {
  followerCount: number;
  listCount: number;
}

export interface CategoryWithFollowStatus extends CategoryWithStats {
  isFollowing: boolean;
}

export type SortOption = 'name' | 'followers' | 'lists' | 'sort_order';

/**
 * Get all categories with follower and list counts
 */
export async function getAllCategories(options?: {
  search?: string;
  sortBy?: SortOption;
  userId?: string;
}): Promise<CategoryWithFollowStatus[]> {
  const { search, sortBy = 'sort_order', userId } = options || {};

  // Build the base query - counts will be added separately due to drizzle subquery issues
  let baseQuery = db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      icon: categories.icon,
      color: categories.color,
      sort_order: categories.sort_order,
      created_at: categories.created_at,
      updated_at: categories.updated_at,
    })
    .from(categories);

  // Apply search filter if provided
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    baseQuery = baseQuery.where(
      sql`${categories.name} ILIKE ${searchTerm} OR ${categories.description} ILIKE ${searchTerm}`
    ) as typeof baseQuery;
  }

  // Apply sorting
  let result;
  switch (sortBy) {
    case 'name':
      result = await baseQuery.orderBy(asc(categories.name));
      break;
    case 'followers':
      // Sort by followers - will be done in-memory after fetching counts
      result = await baseQuery.orderBy(asc(categories.name));
      break;
    case 'lists':
      // Sort by lists - will be done in-memory after fetching counts
      result = await baseQuery.orderBy(asc(categories.name));
      break;
    case 'sort_order':
    default:
      result = await baseQuery.orderBy(asc(categories.sort_order));
      break;
  }

  // Fetch follower counts for all categories
  const followerCounts = await db
    .select({
      category_id: categoryFollows.category_id,
      count: count(),
    })
    .from(categoryFollows)
    .groupBy(categoryFollows.category_id);
  
  const followerCountMap = new Map(followerCounts.map(fc => [fc.category_id, fc.count]));

  // Fetch list counts for all categories (only published lists)
  const listCounts = await db
    .select({
      category_id: listToCategories.category_id,
      count: count(),
    })
    .from(listToCategories)
    .innerJoin(lists, eq(lists.id, listToCategories.list_id))
    .where(eq(lists.is_published, true))
    .groupBy(listToCategories.category_id);
  
  const listCountMap = new Map(listCounts.map(lc => [lc.category_id, lc.count]));

  // Fetch user's followed categories
  let followedCategoryIds: Set<string> = new Set();
  if (userId) {
    const userFollows = await db
      .select({ category_id: categoryFollows.category_id })
      .from(categoryFollows)
      .where(eq(categoryFollows.user_id, userId));
    
    followedCategoryIds = new Set(userFollows.map(f => f.category_id));
  }

  // Combine all data
  let finalResult = result.map(cat => ({
    ...cat,
    followerCount: followerCountMap.get(cat.id) || 0,
    listCount: listCountMap.get(cat.id) || 0,
    isFollowing: followedCategoryIds.has(cat.id),
  }));

  // Apply in-memory sorting for followers/lists
  if (sortBy === 'followers') {
    finalResult.sort((a, b) => b.followerCount - a.followerCount);
  } else if (sortBy === 'lists') {
    finalResult.sort((a, b) => b.listCount - a.listCount);
  }

  return finalResult;
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryWithStats | null> {
  const [category] = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      icon: categories.icon,
      color: categories.color,
      sort_order: categories.sort_order,
      created_at: categories.created_at,
      updated_at: categories.updated_at,
      followerCount: sql<number>`(
        SELECT COUNT(*)::int FROM category_follows 
        WHERE category_follows.category_id = categories.id
      )`.as('followerCount'),
      listCount: sql<number>`(
        SELECT COUNT(*)::int FROM list_to_categories
        INNER JOIN lists ON lists.id = list_to_categories.list_id
        WHERE list_to_categories.category_id = categories.id
        AND lists.is_published = true
      )`.as('listCount'),
    })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) return null;

  return {
    ...category,
    followerCount: Number(category.followerCount) || 0,
    listCount: Number(category.listCount) || 0,
  };
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return category || null;
}

/**
 * Follow a category
 */
export async function followCategory(userId: string, categoryId: string): Promise<boolean> {
  try {
    await db.insert(categoryFollows).values({
      user_id: userId,
      category_id: categoryId,
    });
    return true;
  } catch (error: any) {
    // If unique constraint violation, user already follows
    if (error.code === '23505') {
      return false;
    }
    throw error;
  }
}

/**
 * Unfollow a category
 */
export async function unfollowCategory(userId: string, categoryId: string): Promise<boolean> {
  const result = await db
    .delete(categoryFollows)
    .where(
      and(
        eq(categoryFollows.user_id, userId),
        eq(categoryFollows.category_id, categoryId)
      )
    )
    .returning({ id: categoryFollows.id });

  return result.length > 0;
}

/**
 * Check if user is following a category
 */
export async function isFollowingCategory(userId: string, categoryId: string): Promise<boolean> {
  const [result] = await db
    .select({ id: categoryFollows.id })
    .from(categoryFollows)
    .where(
      and(
        eq(categoryFollows.user_id, userId),
        eq(categoryFollows.category_id, categoryId)
      )
    )
    .limit(1);

  return !!result;
}

/**
 * Get categories a user is following
 */
export async function getUserFollowedCategories(userId: string): Promise<CategoryWithStats[]> {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      icon: categories.icon,
      color: categories.color,
      sort_order: categories.sort_order,
      created_at: categories.created_at,
      updated_at: categories.updated_at,
      followerCount: sql<number>`(
        SELECT COUNT(*)::int FROM category_follows cf2
        WHERE cf2.category_id = categories.id
      )`.as('followerCount'),
      listCount: sql<number>`(
        SELECT COUNT(*)::int FROM list_to_categories
        INNER JOIN lists ON lists.id = list_to_categories.list_id
        WHERE list_to_categories.category_id = categories.id
        AND lists.is_published = true
      )`.as('listCount'),
    })
    .from(categories)
    .innerJoin(categoryFollows, eq(categoryFollows.category_id, categories.id))
    .where(eq(categoryFollows.user_id, userId))
    .orderBy(asc(categories.name));

  return result.map(cat => ({
    ...cat,
    followerCount: Number(cat.followerCount) || 0,
    listCount: Number(cat.listCount) || 0,
  }));
}

/**
 * Get total count of categories
 */
export async function getCategoriesCount(): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(categories);

  return result?.count || 0;
}

export type ListSortOption = 'trending' | 'views' | 'likes' | 'newest';

export interface CategoryList {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image: string | null;
  published_at: Date | null;
  view_count: number;
  likesCount: number;
  commentsCount: number;
  author: {
    username: string;
    name: string;
    avatar: string | null;
  };
}

/**
 * Get lists by category slug with sorting
 */
export async function getListsByCategorySlug(
  categorySlug: string,
  options?: {
    sortBy?: ListSortOption;
    limit?: number;
    offset?: number;
  }
): Promise<CategoryList[]> {
  const { sortBy = 'trending', limit = 20, offset = 0 } = options || {};

  // First get the category
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return [];
  }

  // Build the base query - fetch all data first, then sort in memory for complex cases
  const baseQuery = db
    .select({
      id: lists.id,
      title: lists.title,
      description: lists.description,
      slug: lists.slug,
      cover_image: lists.cover_image,
      published_at: lists.published_at,
      view_count: lists.view_count,
      likesCount: sql<number>`(
        SELECT COUNT(*) FROM ${reactions} 
        WHERE ${reactions.list_id} = ${lists.id}
      )`.as('likesCount'),
      commentsCount: sql<number>`(
        SELECT COUNT(*) FROM ${comments} 
        WHERE ${comments.list_id} = ${lists.id}
      )`.as('commentsCount'),
      author_username: profiles.username,
      author_name: profiles.name,
      author_avatar: profiles.avatar,
    })
    .from(lists)
    .innerJoin(listToCategories, eq(lists.id, listToCategories.list_id))
    .innerJoin(profiles, eq(lists.user_id, profiles.id))
    .where(
      and(
        eq(listToCategories.category_id, category.id),
        eq(lists.is_published, true)
      )
    );

  // Apply sorting and execute query
  let result;
  if (sortBy === 'views') {
    result = await baseQuery
      .orderBy(desc(lists.view_count))
      .limit(limit)
      .offset(offset);
  } else if (sortBy === 'newest') {
    result = await baseQuery
      .orderBy(desc(lists.published_at))
      .limit(limit)
      .offset(offset);
  } else {
    // For 'trending' and 'likes', fetch all and sort in memory
    const allResults = await baseQuery;
    
    // Sort in memory
    if (sortBy === 'likes') {
      allResults.sort((a, b) => Number(b.likesCount) - Number(a.likesCount));
    } else if (sortBy === 'trending') {
      // Trending: combination of views, likes, and recency
      allResults.sort((a, b) => {
        const scoreA = 
          a.view_count * 0.1 + 
          Number(a.likesCount) * 2 +
          (a.published_at ? (Date.now() - new Date(a.published_at).getTime()) / (1000 * 60 * 60 * 24) * -0.1 : 0);
        const scoreB = 
          b.view_count * 0.1 + 
          Number(b.likesCount) * 2 +
          (b.published_at ? (Date.now() - new Date(b.published_at).getTime()) / (1000 * 60 * 60 * 24) * -0.1 : 0);
        return scoreB - scoreA;
      });
    }
    
    // Apply pagination
    result = allResults.slice(offset, offset + limit);
  }

  return result.map((list) => ({
    id: list.id,
    title: list.title,
    description: list.description,
    slug: list.slug,
    cover_image: list.cover_image,
    published_at: list.published_at,
    view_count: list.view_count,
    likesCount: Number(list.likesCount) || 0,
    commentsCount: Number(list.commentsCount) || 0,
    author: {
      username: list.author_username,
      name: list.author_name,
      avatar: list.author_avatar,
    },
  }));
}
