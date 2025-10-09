/**
 * Utility functions for extracting images from TipTap editor content
 */

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
}

interface TipTapDocument {
  type: 'doc';
  content: TipTapNode[];
}

/**
 * Recursively extracts all image URLs from TipTap JSON content
 */
function extractImagesFromNode(node: TipTapNode): string[] {
  const images: string[] = [];

  // Handle regular image nodes
  if (node.type === 'image' && node.attrs?.src) {
    images.push(node.attrs.src);
  }

  // Handle AI-generated image nodes
  if (node.type === 'aiImage' && node.attrs?.generatedImageSrc) {
    images.push(node.attrs.generatedImageSrc);
  }

  // Recursively check child nodes
  if (node.content && Array.isArray(node.content)) {
    for (const childNode of node.content) {
      images.push(...extractImagesFromNode(childNode));
    }
  }

  return images;
}

/**
 * Extracts all image URLs from TipTap editor content
 * @param content - TipTap JSON content (string or object)
 * @returns Array of unique image URLs
 */
export function extractImagesFromContent(content: string | TipTapDocument | null): string[] {
  if (!content) return [];

  try {
    let parsedContent: TipTapDocument;

    if (typeof content === 'string') {
      // Handle empty or whitespace-only strings
      if (!content.trim()) return [];
      parsedContent = JSON.parse(content);
    } else {
      parsedContent = content;
    }

    // Validate that it's a TipTap document
    if (!parsedContent || parsedContent.type !== 'doc' || !Array.isArray(parsedContent.content)) {
      return [];
    }

    const images: string[] = [];
    
    // Extract images from all nodes in the document
    for (const node of parsedContent.content) {
      images.push(...extractImagesFromNode(node));
    }

    // Return unique URLs only, filtering out empty/invalid URLs
    return [...new Set(images)].filter(url => 
      url && 
      typeof url === 'string' && 
      url.trim().length > 0 &&
      (url.startsWith('http') || url.startsWith('/'))
    );

  } catch (error) {
    console.error('Error extracting images from content:', error);
    return [];
  }
}

/**
 * Extracts images from multiple list items
 * @param items - Array of list items with content
 * @returns Array of unique image URLs from all items
 */
export function extractImagesFromListItems(items: Array<{ content: string }>): string[] {
  const allImages: string[] = [];

  for (const item of items) {
    const images = extractImagesFromContent(item.content);
    allImages.push(...images);
  }

  // Return unique URLs only
  return [...new Set(allImages)];
}
