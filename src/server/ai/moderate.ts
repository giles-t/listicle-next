import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  flagged: boolean;
  categories: {
    hate: boolean;
    'hate/threatening': boolean;
    harassment: boolean;
    'harassment/threatening': boolean;
    'self-harm': boolean;
    'self-harm/intent': boolean;
    'self-harm/instructions': boolean;
    sexual: boolean;
    'sexual/minors': boolean;
    violence: boolean;
    'violence/graphic': boolean;
  };
  categoryScores: {
    hate: number;
    'hate/threatening': number;
    harassment: number;
    'harassment/threatening': number;
    'self-harm': number;
    'self-harm/intent': number;
    'self-harm/instructions': number;
    sexual: number;
    'sexual/minors': number;
    violence: number;
    'violence/graphic': number;
  };
  reason?: string;
}

/**
 * Get a human-readable reason for why content was flagged
 */
function getFlaggedReason(categories: ModerationResult['categories']): string {
  const reasons: string[] = [];

  if (categories.hate || categories['hate/threatening']) {
    reasons.push('hate speech');
  }
  if (categories.harassment || categories['harassment/threatening']) {
    reasons.push('harassment');
  }
  if (categories['self-harm'] || categories['self-harm/intent'] || categories['self-harm/instructions']) {
    reasons.push('self-harm content');
  }
  if (categories.sexual || categories['sexual/minors']) {
    reasons.push('sexual content');
  }
  if (categories.violence || categories['violence/graphic']) {
    reasons.push('violent content');
  }

  if (reasons.length === 0) {
    return 'inappropriate content';
  }

  return reasons.join(', ');
}

/**
 * Moderate text content using OpenAI's moderation API (free)
 * 
 * @param text - The text content to moderate
 * @returns ModerationResult with flagged status and categories
 */
export async function moderateContent(text: string): Promise<ModerationResult> {
  // Skip moderation if no API key (development fallback)
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[moderation] No OpenAI API key, skipping moderation');
    return {
      flagged: false,
      categories: {
        hate: false,
        'hate/threatening': false,
        harassment: false,
        'harassment/threatening': false,
        'self-harm': false,
        'self-harm/intent': false,
        'self-harm/instructions': false,
        sexual: false,
        'sexual/minors': false,
        violence: false,
        'violence/graphic': false,
      },
      categoryScores: {
        hate: 0,
        'hate/threatening': 0,
        harassment: 0,
        'harassment/threatening': 0,
        'self-harm': 0,
        'self-harm/intent': 0,
        'self-harm/instructions': 0,
        sexual: 0,
        'sexual/minors': 0,
        violence: 0,
        'violence/graphic': 0,
      },
    };
  }

  // Don't moderate empty content
  if (!text || text.trim().length === 0) {
    return {
      flagged: false,
      categories: {
        hate: false,
        'hate/threatening': false,
        harassment: false,
        'harassment/threatening': false,
        'self-harm': false,
        'self-harm/intent': false,
        'self-harm/instructions': false,
        sexual: false,
        'sexual/minors': false,
        violence: false,
        'violence/graphic': false,
      },
      categoryScores: {
        hate: 0,
        'hate/threatening': 0,
        harassment: 0,
        'harassment/threatening': 0,
        'self-harm': 0,
        'self-harm/intent': 0,
        'self-harm/instructions': 0,
        sexual: 0,
        'sexual/minors': 0,
        violence: 0,
        'violence/graphic': 0,
      },
    };
  }

  try {
    const response = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: text,
    });

    const result = response.results[0];
    
    if (!result) {
      console.error('[moderation] No result from OpenAI moderation API');
      // Fail open - allow content if moderation fails
      return {
        flagged: false,
        categories: {
          hate: false,
          'hate/threatening': false,
          harassment: false,
          'harassment/threatening': false,
          'self-harm': false,
          'self-harm/intent': false,
          'self-harm/instructions': false,
          sexual: false,
          'sexual/minors': false,
          violence: false,
          'violence/graphic': false,
        },
        categoryScores: {
          hate: 0,
          'hate/threatening': 0,
          harassment: 0,
          'harassment/threatening': 0,
          'self-harm': 0,
          'self-harm/intent': 0,
          'self-harm/instructions': 0,
          sexual: 0,
          'sexual/minors': 0,
          violence: 0,
          'violence/graphic': 0,
        },
      };
    }

    const moderationResult: ModerationResult = {
      flagged: result.flagged,
      categories: {
        hate: result.categories.hate,
        'hate/threatening': result.categories['hate/threatening'],
        harassment: result.categories.harassment,
        'harassment/threatening': result.categories['harassment/threatening'],
        'self-harm': result.categories['self-harm'],
        'self-harm/intent': result.categories['self-harm/intent'],
        'self-harm/instructions': result.categories['self-harm/instructions'],
        sexual: result.categories.sexual,
        'sexual/minors': result.categories['sexual/minors'],
        violence: result.categories.violence,
        'violence/graphic': result.categories['violence/graphic'],
      },
      categoryScores: {
        hate: result.category_scores.hate,
        'hate/threatening': result.category_scores['hate/threatening'],
        harassment: result.category_scores.harassment,
        'harassment/threatening': result.category_scores['harassment/threatening'],
        'self-harm': result.category_scores['self-harm'],
        'self-harm/intent': result.category_scores['self-harm/intent'],
        'self-harm/instructions': result.category_scores['self-harm/instructions'],
        sexual: result.category_scores.sexual,
        'sexual/minors': result.category_scores['sexual/minors'],
        violence: result.category_scores.violence,
        'violence/graphic': result.category_scores['violence/graphic'],
      },
    };

    // Add human-readable reason if flagged
    if (moderationResult.flagged) {
      moderationResult.reason = getFlaggedReason(moderationResult.categories);
      console.log('[moderation] Content flagged:', moderationResult.reason);
    }

    return moderationResult;
  } catch (error) {
    console.error('[moderation] Error calling OpenAI moderation API:', error);
    // Fail open - allow content if API call fails
    // In production, you might want to fail closed instead (block content)
    return {
      flagged: false,
      categories: {
        hate: false,
        'hate/threatening': false,
        harassment: false,
        'harassment/threatening': false,
        'self-harm': false,
        'self-harm/intent': false,
        'self-harm/instructions': false,
        sexual: false,
        'sexual/minors': false,
        violence: false,
        'violence/graphic': false,
      },
      categoryScores: {
        hate: 0,
        'hate/threatening': 0,
        harassment: 0,
        'harassment/threatening': 0,
        'self-harm': 0,
        'self-harm/intent': 0,
        'self-harm/instructions': 0,
        sexual: 0,
        'sexual/minors': 0,
        violence: 0,
        'violence/graphic': 0,
      },
    };
  }
}

/**
 * Quick check if content is safe (not flagged)
 */
export async function isContentSafe(text: string): Promise<boolean> {
  const result = await moderateContent(text);
  return !result.flagged;
}
