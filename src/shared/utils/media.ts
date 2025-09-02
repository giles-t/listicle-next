/**
 * Media utility functions for handling images, videos, and embeds
 */

export type MediaType = 'image' | 'video' | 'tweet' | 'youtube' | 'none';

export interface MediaInfo {
  type: MediaType;
  url: string;
  embedId?: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

/**
 * Detect media type from URL
 * @param url Media URL
 * @returns Media type
 */
export function detectMediaType(url: string): MediaType {
  if (!url || typeof url !== 'string') return 'none';
  
  const urlLower = url.toLowerCase();
  
  // YouTube patterns
  if (
    urlLower.includes('youtube.com/watch') ||
    urlLower.includes('youtu.be/') ||
    urlLower.includes('youtube.com/embed/')
  ) {
    return 'youtube';
  }
  
  // Twitter patterns
  if (
    urlLower.includes('twitter.com/') ||
    urlLower.includes('x.com/')
  ) {
    return 'tweet';
  }
  
  // Image patterns
  if (
    urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) ||
    urlLower.includes('images.unsplash.com') ||
    urlLower.includes('cdn.') ||
    urlLower.includes('imgur.com')
  ) {
    return 'image';
  }
  
  // Video patterns
  if (urlLower.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return 'video';
  }
  
  return 'none';
}

/**
 * Extract YouTube video ID from URL
 * @param url YouTube URL
 * @returns Video ID or null
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract Twitter tweet ID from URL
 * @param url Twitter URL
 * @returns Tweet ID or null
 */
export function extractTweetId(url: string): string | null {
  const patterns = [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /(?:twitter\.com|x\.com)\/\w+\/statuses\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Generate YouTube thumbnail URL
 * @param videoId YouTube video ID
 * @param quality Thumbnail quality ('default', 'hqdefault', 'maxresdefault')
 * @returns Thumbnail URL
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'hqdefault' | 'maxresdefault' = 'hqdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Generate YouTube embed URL
 * @param videoId YouTube video ID
 * @returns Embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Validate image URL
 * @param url Image URL
 * @returns Whether the URL is a valid image
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return detectMediaType(url) === 'image';
  } catch {
    return false;
  }
}

/**
 * Get optimized image URL for different sizes
 * @param originalUrl Original image URL
 * @param width Desired width
 * @param height Desired height
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  width?: number,
  height?: number
): string {
  // For Unsplash images, we can use their optimization parameters
  if (originalUrl.includes('images.unsplash.com')) {
    const url = new URL(originalUrl);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    return url.toString();
  }
  
  // For other CDNs, return as-is for now
  // In the future, we could integrate with Cloudinary or similar
  return originalUrl;
}

/**
 * Extract media information from URL
 * @param url Media URL
 * @returns Media information object
 */
export function extractMediaInfo(url: string): MediaInfo {
  const type = detectMediaType(url);
  const info: MediaInfo = { type, url };
  
  switch (type) {
    case 'youtube':
      const youtubeId = extractYouTubeId(url);
      if (youtubeId) {
        info.embedId = youtubeId;
        info.thumbnailUrl = getYouTubeThumbnail(youtubeId);
      }
      break;
      
    case 'tweet':
      const tweetId = extractTweetId(url);
      if (tweetId) {
        info.embedId = tweetId;
      }
      break;
      
    case 'image':
      info.thumbnailUrl = getOptimizedImageUrl(url, 400, 225);
      break;
  }
  
  return info;
}

/**
 * Get embed HTML for different media types
 * @param mediaInfo Media information
 * @returns Embed HTML string
 */
export function getEmbedHtml(mediaInfo: MediaInfo): string {
  switch (mediaInfo.type) {
    case 'youtube':
      if (!mediaInfo.embedId) return '';
      return `<iframe width="560" height="315" src="${getYouTubeEmbedUrl(mediaInfo.embedId)}" frameborder="0" allowfullscreen></iframe>`;
      
    case 'tweet':
      if (!mediaInfo.embedId) return '';
      return `<blockquote class="twitter-tweet"><a href="https://twitter.com/x/status/${mediaInfo.embedId}"></a></blockquote>`;
      
    case 'image':
      return `<img src="${mediaInfo.url}" alt="${mediaInfo.title || ''}" loading="lazy" />`;
      
    default:
      return '';
  }
}

/**
 * Count words in text content
 * @param text Text content
 * @returns Word count
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  
  // Remove HTML tags and normalize whitespace
  const cleanText = text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!cleanText) return 0;
  
  return cleanText.split(' ').length;
}

/**
 * Image dimension presets for different use cases
 */
export const IMAGE_PRESETS = {
  LIST_THUMBNAIL: { width: 400, height: 225 }, // 16:9
  LIST_HERO: { width: 1200, height: 675 }, // 16:9
  PROFILE_AVATAR: { width: 150, height: 150 }, // 1:1
  PUBLICATION_LOGO: { width: 200, height: 200 }, // 1:1
  OG_IMAGE: { width: 1200, height: 630 }, // Facebook OG
} as const; 