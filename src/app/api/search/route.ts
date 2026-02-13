import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/server/db';
import { lists, profiles, reactions, comments, listToCategories, categories, follows } from '@/src/server/db/schema';
import { eq, desc, sql, and, or, ilike, gte, lte } from 'drizzle-orm';
import { createClient } from '@/server/supabase';

export type SearchSortOption = 'relevance' | 'newest' | 'popular';
export type DateFilter = 'any' | 'day' | 'week' | 'month' | 'year';
export type ListLengthFilter = 'any' | 'short' | 'medium' | 'long';

interface SearchListItem {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image: string | null;
  published_at: Date | null;
  view_count: number;
  likesCount: number;
  commentsCount: number;
  itemCount: number;
  category: {
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
}

interface SearchUserItem {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  followerCount: number;
  listCount: number;
  isFollowing: boolean;
}

function getDateThreshold(dateFilter: DateFilter): Date | null {
  const now = new Date();
  switch (dateFilter) {
    case 'day':
      const dayAgo = new Date(now);
      dayAgo.setDate(dayAgo.getDate() - 1);
      return dayAgo;
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return monthAgo;
    case 'year':
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return yearAgo;
    case 'any':
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'lists'; // 'lists' | 'users'
    const sortBy = (searchParams.get('sortBy') as SearchSortOption) || 'relevance';
    const dateFilter = (searchParams.get('date') as DateFilter) || 'any';
    const categorySlug = searchParams.get('category');
    const listLength = (searchParams.get('listLength') as ListLengthFilter) || 'any';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get current user for follow status
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (type === 'users') {
      // Search users
      const conditions = [];
      
      if (query) {
        conditions.push(
          or(
            ilike(profiles.username, `%${query}%`),
            ilike(profiles.name, `%${query}%`),
            ilike(profiles.bio, `%${query}%`)
          )
        );
      }

      const usersQuery = db
        .select({
          id: profiles.id,
          username: profiles.username,
          name: profiles.name,
          avatar: profiles.avatar,
          bio: profiles.bio,
          followerCount: sql<number>`(
            SELECT COUNT(*) FROM follows
            WHERE follows.following_id = profiles.id
          )`.as('followerCount'),
          listCount: sql<number>`(
            SELECT COUNT(*) FROM lists
            WHERE lists.user_id = profiles.id
            AND lists.is_published = true
          )`.as('listCount'),
        })
        .from(profiles)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Execute and sort
      let users = await usersQuery;

      // Sort users
      if (sortBy === 'popular') {
        users.sort((a, b) => Number(b.followerCount) - Number(a.followerCount));
      } else if (sortBy === 'newest') {
        // For users, we don't have a created_at readily available, so we'll just use default order
      }

      // Apply pagination
      const paginatedUsers = users.slice(offset, offset + limit);

      // Check follow status for each user
      let followingSet = new Set<string>();
      if (user) {
        const followingRecords = await db
          .select({ following_id: follows.following_id })
          .from(follows)
          .where(eq(follows.follower_id, user.id));
        followingSet = new Set(followingRecords.map(f => f.following_id));
      }

      const formattedUsers: SearchUserItem[] = paginatedUsers.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        avatar: u.avatar,
        bio: u.bio,
        followerCount: Number(u.followerCount) || 0,
        listCount: Number(u.listCount) || 0,
        isFollowing: followingSet.has(u.id),
      }));

      return NextResponse.json({
        users: formattedUsers,
        hasMore: users.length > offset + limit,
        total: users.length,
      });
    }

    // Search lists
    const dateThreshold = getDateThreshold(dateFilter);
    const conditions = [eq(lists.is_published, true)];

    if (query) {
      conditions.push(
        or(
          ilike(lists.title, `%${query}%`),
          ilike(lists.description, `%${query}%`)
        )!
      );
    }

    if (dateThreshold) {
      conditions.push(gte(lists.published_at, dateThreshold));
    }

    // Category filter
    let categoryId: string | null = null;
    if (categorySlug) {
      const [category] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      
      if (category) {
        categoryId = category.id;
      }
    }

    // Build and execute query
    let baseQuery;
    
    if (categoryId) {
      conditions.push(eq(listToCategories.category_id, categoryId));
      
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
          itemCount: sql<number>`(
            SELECT COUNT(*) FROM list_items
            WHERE list_items.list_id = ${lists.id}
          )`.as('itemCount'),
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
          author_id: profiles.id,
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
          itemCount: sql<number>`(
            SELECT COUNT(*) FROM list_items
            WHERE list_items.list_id = ${lists.id}
          )`.as('itemCount'),
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
          author_id: profiles.id,
          author_username: profiles.username,
          author_name: profiles.name,
          author_avatar: profiles.avatar,
        })
        .from(lists)
        .innerJoin(profiles, eq(lists.user_id, profiles.id))
        .where(and(...conditions));
    }

    // Execute query
    let result = await baseQuery;

    // Filter by list length
    if (listLength !== 'any') {
      result = result.filter((list) => {
        const count = Number(list.itemCount);
        switch (listLength) {
          case 'short':
            return count < 10;
          case 'medium':
            return count >= 10 && count <= 20;
          case 'long':
            return count > 20;
          default:
            return true;
        }
      });
    }

    // Sort results
    if (sortBy === 'newest') {
      result.sort((a, b) => {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === 'popular') {
      result.sort((a, b) => {
        const scoreA = a.view_count + Number(a.likesCount) * 10;
        const scoreB = b.view_count + Number(b.likesCount) * 10;
        return scoreB - scoreA;
      });
    } else {
      // Relevance: prioritize query match, then engagement
      result.sort((a, b) => {
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

    const totalCount = result.length;
    
    // Apply pagination
    const paginatedResult = result.slice(offset, offset + limit);

    const formattedLists: SearchListItem[] = paginatedResult.map((list) => ({
      id: list.id,
      title: list.title,
      description: list.description,
      slug: list.slug,
      cover_image: list.cover_image,
      published_at: list.published_at,
      view_count: list.view_count,
      likesCount: Number(list.likesCount) || 0,
      commentsCount: Number(list.commentsCount) || 0,
      itemCount: Number(list.itemCount) || 0,
      category: list.category_name ? {
        name: list.category_name,
        slug: list.category_slug!,
      } : null,
      author: {
        id: list.author_id,
        username: list.author_username,
        name: list.author_name,
        avatar: list.author_avatar,
      },
    }));

    return NextResponse.json({
      lists: formattedLists,
      hasMore: totalCount > offset + limit,
      total: totalCount,
    });

  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
