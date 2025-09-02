/**
 * Pagination utilities for handling cursor-based and offset-based pagination
 */

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CursorPaginationMeta {
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: CursorPaginationMeta;
}

/**
 * Create pagination parameters from page and limit
 * @param page Page number (1-based)
 * @param limit Items per page
 * @returns Pagination parameters with offset calculated
 */
export function createPaginationParams(page: number = 1, limit: number = 20): PaginationParams {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(100, Math.max(1, limit)); // Cap at 100 items per page
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset: (normalizedPage - 1) * normalizedLimit,
  };
}

/**
 * Create cursor-based pagination parameters
 * @param cursor Optional cursor for pagination
 * @param limit Items per page
 * @returns Cursor pagination parameters
 */
export function createCursorPaginationParams(cursor?: string, limit: number = 20): CursorPaginationParams {
  const normalizedLimit = Math.min(100, Math.max(1, limit));
  
  return {
    cursor,
    limit: normalizedLimit,
  };
}

/**
 * Create pagination metadata
 * @param total Total number of items
 * @param page Current page
 * @param limit Items per page
 * @returns Pagination metadata
 */
export function createPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Create cursor-based pagination metadata
 * @param data The current page data
 * @param limit Items per page
 * @param getCursor Function to extract cursor from an item
 * @returns Cursor pagination metadata
 */
export function createCursorPaginationMeta<T>(
  data: T[],
  limit: number,
  getCursor: (item: T) => string
): CursorPaginationMeta {
  const hasNext = data.length === limit;
  const nextCursor = hasNext && data.length > 0 ? getCursor(data[data.length - 1]) : undefined;
  const prevCursor = data.length > 0 ? getCursor(data[0]) : undefined;
  
  return {
    hasNext,
    hasPrev: false, // We don't track previous cursor in this implementation
    nextCursor,
    prevCursor,
  };
}

/**
 * Parse pagination parameters from URL search params
 * @param searchParams URL search parameters
 * @returns Pagination parameters
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  
  return createPaginationParams(page, limit);
}

/**
 * Parse cursor pagination parameters from URL search params
 * @param searchParams URL search parameters
 * @returns Cursor pagination parameters
 */
export function parseCursorPaginationParams(searchParams: URLSearchParams): CursorPaginationParams {
  const cursor = searchParams.get('cursor') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  
  return createCursorPaginationParams(cursor, limit);
}

/**
 * Generate pagination URLs for navigation
 * @param baseUrl Base URL without query parameters
 * @param currentPage Current page number
 * @param totalPages Total number of pages
 * @param limit Items per page
 * @returns Object with navigation URLs
 */
export function generatePaginationUrls(
  baseUrl: string,
  currentPage: number,
  totalPages: number,
  limit: number = 20
) {
  const createUrl = (page: number) => {
    const url = new URL(baseUrl);
    url.searchParams.set('page', page.toString());
    if (limit !== 20) {
      url.searchParams.set('limit', limit.toString());
    }
    return url.toString();
  };

  return {
    first: currentPage > 1 ? createUrl(1) : null,
    prev: currentPage > 1 ? createUrl(currentPage - 1) : null,
    next: currentPage < totalPages ? createUrl(currentPage + 1) : null,
    last: currentPage < totalPages ? createUrl(totalPages) : null,
  };
}

/**
 * Generate cursor pagination URLs for navigation
 * @param baseUrl Base URL without query parameters
 * @param nextCursor Next cursor for forward pagination
 * @param limit Items per page
 * @returns Object with navigation URLs
 */
export function generateCursorPaginationUrls(
  baseUrl: string,
  nextCursor?: string,
  limit: number = 20
) {
  const createUrl = (cursor: string) => {
    const url = new URL(baseUrl);
    url.searchParams.set('cursor', cursor);
    if (limit !== 20) {
      url.searchParams.set('limit', limit.toString());
    }
    return url.toString();
  };

  return {
    next: nextCursor ? createUrl(nextCursor) : null,
  };
}

/**
 * Default pagination settings for different content types
 */
export const PAGINATION_DEFAULTS = {
  LISTS_PER_PAGE: 15,
  LIST_ITEMS_PER_PAGE: 20,
  COMMENTS_PER_PAGE: 10,
  COMMENTS_INITIAL: 5,
  SEARCH_RESULTS_PER_PAGE: 20,
  NOTIFICATIONS_PER_PAGE: 25,
} as const; 