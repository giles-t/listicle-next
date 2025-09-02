/**
 * Slug utility functions for generating SEO-friendly URLs
 * Format: /@username/list-title-slug
 */

/**
 * Generate a URL-friendly slug from a title
 * @param title The title to convert to a slug
 * @param maxLength Maximum length of the slug (default: 100)
 * @returns A URL-friendly slug
 */
export function generateSlug(title: string, maxLength: number = 100): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Truncate if too long
    .substring(0, maxLength)
    // Remove trailing hyphen after truncation
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by checking against existing slugs
 * @param title The title to convert to a slug
 * @param existingSlugs Array of existing slugs to check against
 * @param maxLength Maximum length of the slug
 * @returns A unique slug
 */
export function generateUniqueSlug(
  title: string, 
  existingSlugs: string[] = [], 
  maxLength: number = 100
): string {
  const baseSlug = generateSlug(title, maxLength - 10); // Reserve space for suffix
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Try with incrementing numbers
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug) && counter < 1000) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  if (counter >= 1000) {
    // Fallback to timestamp if we've tried too many
    const timestamp = Date.now().toString(36);
    uniqueSlug = `${baseSlug}-${timestamp}`;
  }
  
  return uniqueSlug;
}

/**
 * Validate a slug format
 * @param slug The slug to validate
 * @returns Whether the slug is valid
 */
export function validateSlug(slug: string): boolean {
  // Must be 3-150 characters, lowercase letters, numbers, and hyphens only
  const slugRegex = /^[a-z0-9-]{3,150}$/;
  return slugRegex.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
}

/**
 * Generate a list URL path
 * @param username The username
 * @param slug The list slug
 * @returns The full URL path
 */
export function generateListPath(username: string, slug: string): string {
  return `/@${username}/${slug}`;
}

/**
 * Generate a publication URL path
 * @param publicationSlug The publication slug
 * @param listSlug The list slug (optional)
 * @returns The full URL path
 */
export function generatePublicationPath(publicationSlug: string, listSlug?: string): string {
  if (listSlug) {
    return `/pub/${publicationSlug}/${listSlug}`;
  }
  return `/pub/${publicationSlug}`;
}

/**
 * Generate a user profile URL path
 * @param username The username
 * @returns The full URL path
 */
export function generateProfilePath(username: string): string {
  return `/@${username}`;
}

/**
 * Extract username and slug from a list path
 * @param path The URL path (e.g., "/@username/list-slug")
 * @returns Object with username and slug, or null if invalid
 */
export function parseListPath(path: string): { username: string; slug: string } | null {
  const match = path.match(/^\/@([^\/]+)\/(.+)$/);
  if (!match) return null;
  
  const [, username, slug] = match;
  return { username, slug };
} 