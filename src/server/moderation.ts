/**
 * Content moderation utilities for filtering harmful content
 */

export interface ModerationResult {
  isAllowed: boolean;
  flaggedReasons: string[];
  confidence: number;
  suggestedAction?: 'allow' | 'review' | 'block';
}

/**
 * Basic profanity filter - replace with more sophisticated filtering in production
 */
const PROFANITY_PATTERNS = [
  // Add basic patterns here - in production, use a comprehensive profanity list
  /\b(spam|scam|fake)\b/gi,
  /\b(hate|racist|sexist)\b/gi,
  // Add more patterns as needed
];

/**
 * Moderate text content for harmful material
 * @param content Text content to moderate
 * @returns Moderation result
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  if (!content || typeof content !== 'string') {
    return {
      isAllowed: true,
      flaggedReasons: [],
      confidence: 1.0,
    };
  }

  const result: ModerationResult = {
    isAllowed: true,
    flaggedReasons: [],
    confidence: 0.0,
  };

  try {
    // Basic profanity check
    const profanityFlags = checkProfanity(content);
    if (profanityFlags.length > 0) {
      result.flaggedReasons.push(...profanityFlags);
      result.confidence = 0.8;
    }

    // Check for spam patterns
    const spamFlags = checkSpamPatterns(content);
    if (spamFlags.length > 0) {
      result.flaggedReasons.push(...spamFlags);
      result.confidence = Math.max(result.confidence, 0.7);
    }

    // Determine if content should be allowed
    result.isAllowed = result.flaggedReasons.length === 0;
    
    // Suggest action based on confidence
    if (!result.isAllowed) {
      if (result.confidence >= 0.9) {
        result.suggestedAction = 'block';
      } else if (result.confidence >= 0.6) {
        result.suggestedAction = 'review';
      } else {
        result.suggestedAction = 'allow';
        result.isAllowed = true; // Low confidence, allow with caution
      }
    }

    // TODO: Integrate with OpenAI Moderation API for more sophisticated filtering
    // const openaiResult = await moderateWithOpenAI(content);
    // if (openaiResult.flagged) {
    //   result.flaggedReasons.push(...openaiResult.categories);
    //   result.confidence = Math.max(result.confidence, openaiResult.confidence);
    //   result.isAllowed = false;
    // }

    return result;
  } catch (error) {
    console.error('Content moderation failed:', error);
    
    // Fail open - allow content if moderation fails
    return {
      isAllowed: true,
      flaggedReasons: ['moderation_error'],
      confidence: 0.0,
    };
  }
}

/**
 * Check for basic profanity patterns
 * @param content Text content
 * @returns Array of flagged reasons
 */
function checkProfanity(content: string): string[] {
  const flags: string[] = [];
  
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) {
      flags.push(`profanity_${pattern.source}`);
    }
  }
  
  return flags;
}

/**
 * Check for spam patterns
 * @param content Text content
 * @returns Array of flagged reasons
 */
function checkSpamPatterns(content: string): string[] {
  const flags: string[] = [];
  
  // Check for excessive capitalization
  const uppercaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (uppercaseRatio > 0.6 && content.length > 10) {
    flags.push('excessive_caps');
  }
  
  // Check for repeated characters
  if (/(.)\1{4,}/.test(content)) {
    flags.push('repeated_characters');
  }
  
  // Check for excessive URLs
  const urlCount = (content.match(/https?:\/\/\S+/g) || []).length;
  if (urlCount > 3) {
    flags.push('excessive_urls');
  }
  
  // Check for excessive special characters (simplified emoji detection)
  const specialCharCount = (content.match(/[^\w\s.,!?-]/g) || []).length;
  if (specialCharCount > content.length * 0.3) {
    flags.push('excessive_special_chars');
  }
  
  return flags;
}

/**
 * Moderate image content (placeholder for future image moderation)
 * @param imageUrl Image URL to moderate
 * @returns Moderation result
 */
export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  // TODO: Integrate with image moderation service (e.g., Google Vision API, AWS Rekognition)
  
  return {
    isAllowed: true,
    flaggedReasons: [],
    confidence: 0.0,
  };
}

/**
 * Check if user should be rate limited based on previous violations
 * @param userId User ID
 * @returns Whether user should be rate limited
 */
export async function shouldRateLimitUser(userId: string): Promise<boolean> {
  // TODO: Implement user reputation system
  // Check database for recent violations
  // Return true if user has too many recent violations
  
  return false;
}

/**
 * Log moderation action for audit trail
 * @param action Moderation action taken
 * @param content Content that was moderated
 * @param userId User ID (if available)
 * @param moderatorId Moderator ID (if manual action)
 */
export function logModerationAction(
  action: 'allow' | 'review' | 'block' | 'delete',
  content: string,
  userId?: string,
  moderatorId?: string
): void {
  console.info({
    action,
    contentPreview: content.substring(0, 100),
    userId,
    moderatorId,
    timestamp: new Date().toISOString(),
  }, 'Moderation action logged');
}

/**
 * Moderation configuration
 */
export const MODERATION_CONFIG = {
  // Auto-block threshold
  AUTO_BLOCK_CONFIDENCE: 0.9,
  
  // Review threshold
  REVIEW_CONFIDENCE: 0.6,
  
  // Maximum content length before requiring review
  MAX_CONTENT_LENGTH: 10000,
  
  // Maximum URLs allowed in content
  MAX_URLS_PER_CONTENT: 3,
  
  // Rate limiting for flagged users
  FLAGGED_USER_RATE_LIMIT: { requests: 5, window: 60 * 60 * 1000 }, // 5 requests per hour
} as const; 