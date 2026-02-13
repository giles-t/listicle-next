import { NextRequest, NextResponse } from 'next/server';
import { getListsByCategorySlug, getCategoryById, type ListSortOption } from '@/server/db/queries/categories';
import { ApiError } from '@/server/api-error';

/**
 * GET /api/categories/[id]/lists
 * Get lists for a category with optional sorting and pagination
 * Accepts either category ID (UUID) or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw ApiError.badRequest('Category ID or slug is required');
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const sortBy = (searchParams.get('sortBy') || 'trending') as ListSortOption;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate sortBy
    const validSortOptions: ListSortOption[] = ['trending', 'views', 'likes', 'newest'];
    if (!validSortOptions.includes(sortBy)) {
      throw ApiError.badRequest('Invalid sortBy parameter');
    }

    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      throw ApiError.badRequest('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw ApiError.badRequest('Offset must be non-negative');
    }

    // Check if id is a UUID (36 chars with dashes) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let categorySlug: string;
    if (isUUID) {
      // It's a UUID, get the category to find its slug
      const category = await getCategoryById(id);
      if (!category) {
        throw ApiError.notFound('Category not found');
      }
      categorySlug = category.slug;
    } else {
      // It's a slug, use it directly
      categorySlug = id;
    }

    const lists = await getListsByCategorySlug(categorySlug, {
      sortBy,
      limit,
      offset,
    });

    return NextResponse.json({
      lists,
      pagination: {
        limit,
        offset,
        hasMore: lists.length === limit,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Get category lists API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
