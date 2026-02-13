import { db } from '../index';
import { lists, profiles, reactions, comments, listToCategories, categories } from '../schema';
import { eq, desc, sql } from 'drizzle-orm';

export type ListSortOption = 'trending' | 'views' | 'likes' | 'newest';

export interface ListWithAuthor {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image: string | null;
  published_at: Date | null;
  view_count: number;
  likesCount: number;
  commentsCount: number;
  category: {
    name: string;
    slug: string;
  } | null;
  author: {
    username: string;
    name: string;
    avatar: string | null;
  };
}

/**
 * Get trending/recent lists for the home page
 */
export async function getTrendingLists(options?: {
  sortBy?: ListSortOption;
  limit?: number;
  offset?: number;
}): Promise<ListWithAuthor[]> {
  const { sortBy = 'trending', limit = 12, offset = 0 } = options || {};

  // Build the base query
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
      // Get the first category for the list
      category_name: sql<string | null>`(
        SELECT c.name FROM ${listToCategories} ltc
        INNER JOIN ${categories} c ON c.id = ltc.category_id
        WHERE ltc.list_id = ${lists.id}
        LIMIT 1
      )`.as('category_name'),
      category_slug: sql<string | null>`(
        SELECT c.slug FROM ${listToCategories} ltc
        INNER JOIN ${categories} c ON c.id = ltc.category_id
        WHERE ltc.list_id = ${lists.id}
        LIMIT 1
      )`.as('category_slug'),
      author_username: profiles.username,
      author_name: profiles.name,
      author_avatar: profiles.avatar,
    })
    .from(lists)
    .innerJoin(profiles, eq(lists.user_id, profiles.id))
    .where(eq(lists.is_published, true));

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
    category: list.category_name ? {
      name: list.category_name,
      slug: list.category_slug!,
    } : null,
    author: {
      username: list.author_username,
      name: list.author_name,
      avatar: list.author_avatar,
    },
  }));
}

/**
 * Get total count of published lists
 */
export async function getPublishedListsCount(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(lists)
    .where(eq(lists.is_published, true));

  return result?.count || 0;
}
