import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/server/db';
import { lists, profiles, reactions, comments, listToCategories, categories } from '@/src/server/db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

export type FeedSortOption = 'trending' | 'views' | 'likes' | 'newest';
export type TimeFilter = 'today' | 'week' | 'month' | 'all';

interface FeedListItem {
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

function getDateThreshold(timeFilter: TimeFilter): Date | null {
  const now = new Date();
  switch (timeFilter) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return monthAgo;
    case 'all':
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = (searchParams.get('sortBy') as FeedSortOption) || 'trending';
    const timeFilter = (searchParams.get('time') as TimeFilter) || 'all';
    const categorySlug = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get date threshold for time filter
    const dateThreshold = getDateThreshold(timeFilter);

    // Build conditions
    const conditions = [eq(lists.is_published, true)];
    
    if (dateThreshold) {
      conditions.push(gte(lists.published_at, dateThreshold));
    }

    // Base query with optional category join
    let baseQuery;
    
    if (categorySlug) {
      // Get category first
      const [category] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      
      if (category) {
        conditions.push(eq(listToCategories.category_id, category.id));
      }

      baseQuery = db
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
        .innerJoin(listToCategories, eq(lists.id, listToCategories.list_id))
        .where(and(...conditions));
    } else {
      baseQuery = db
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
        .where(and(...conditions));
    }

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

    const formattedLists: FeedListItem[] = result.map((list) => ({
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

    return NextResponse.json({
      lists: formattedLists,
      hasMore: result.length === limit,
    });

  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
