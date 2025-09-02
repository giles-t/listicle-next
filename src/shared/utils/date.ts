/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format a date for display in the UI
 * @param date Date to format
 * @param options Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
}

/**
 * Format a date for SEO-friendly ISO string
 * @param date Date to format
 * @returns ISO date string
 */
export function formatDateISO(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param date Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}

/**
 * Format a short date for compact display (e.g., "Jan 15", "Mar 2023")
 * @param date Date to format
 * @returns Short date string
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  const isSameYear = dateObj.getFullYear() === now.getFullYear();
  
  if (isSameYear) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Format reading time estimate
 * @param wordCount Number of words in the content
 * @param wordsPerMinute Average reading speed (default: 200)
 * @returns Reading time string
 */
export function formatReadingTime(wordCount: number, wordsPerMinute: number = 200): string {
  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
  return `${minutes} min read`;
}

/**
 * Check if a date is today
 * @param date Date to check
 * @returns Whether the date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is this week
 * @param date Date to check
 * @returns Whether the date is this week
 */
export function isThisWeek(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  return dateObj >= startOfWeek && dateObj <= now;
}

/**
 * Get start and end dates for a time period
 * @param period Time period ('day', 'week', 'month', 'year')
 * @param date Reference date (default: now)
 * @returns Object with start and end dates
 */
export function getDateRange(
  period: 'day' | 'week' | 'month' | 'year',
  date: Date = new Date()
): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(date.getDate() - date.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(date.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
} 