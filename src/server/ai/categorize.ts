import OpenAI from 'openai';
import { db } from '@/server/db';
import { categories, lists, listItems } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CategorySuggestion {
  id: string;
  name: string;
  slug: string;
  confidence: number;
}

export interface CategorizationResult {
  suggestions: CategorySuggestion[];
  reasoning?: string;
}

/**
 * Get all available categories from the database
 */
export async function getAvailableCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
    })
    .from(categories)
    .orderBy(categories.sort_order);
}

/**
 * Get list data for categorization
 */
export async function getListForCategorization(listId: string) {
  // Get list details
  const [list] = await db
    .select({
      id: lists.id,
      title: lists.title,
      description: lists.description,
    })
    .from(lists)
    .where(eq(lists.id, listId))
    .limit(1);

  if (!list) {
    return null;
  }

  // Get list items
  const items = await db
    .select({
      title: listItems.title,
      content: listItems.content,
    })
    .from(listItems)
    .where(eq(listItems.list_id, listId))
    .orderBy(listItems.sort_order);

  return {
    title: list.title,
    description: list.description,
    items: items.map(item => ({
      title: item.title,
      // Strip HTML tags from content for cleaner text
      content: item.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) || '',
    })),
  };
}

/**
 * Use AI to suggest categories for a list based on its content
 */
export async function suggestCategoriesForList(
  listId: string,
  maxSuggestions: number = 3
): Promise<CategorizationResult> {
  // Get list data
  const listData = await getListForCategorization(listId);
  
  if (!listData) {
    throw new Error('List not found');
  }

  // Get available categories
  const availableCategories = await getAvailableCategories();
  
  if (availableCategories.length === 0) {
    return { suggestions: [] };
  }

  // Build the prompt
  const categoryList = availableCategories
    .map(cat => `- ${cat.name}: ${cat.description || 'No description'}`)
    .join('\n');

  const itemsList = listData.items
    .map((item, i) => `${i + 1}. ${item.title}${item.content ? `: ${item.content}` : ''}`)
    .join('\n');

  const prompt = `Analyze the following list and suggest the most appropriate categories from the available options.

LIST TITLE: ${listData.title}
${listData.description ? `LIST DESCRIPTION: ${listData.description}` : ''}

LIST ITEMS:
${itemsList || 'No items yet'}

AVAILABLE CATEGORIES:
${categoryList}

Based on the list's title, description, and items, select the ${maxSuggestions} most relevant categories. Return ONLY a JSON object with this exact format (no markdown, no code blocks):
{
  "suggestions": [
    {"slug": "category-slug", "confidence": 0.95},
    {"slug": "another-category", "confidence": 0.80}
  ],
  "reasoning": "Brief explanation of why these categories were chosen"
}

Important:
- Only use slugs that exist in the AVAILABLE CATEGORIES list
- Confidence should be between 0 and 1
- Order suggestions by confidence (highest first)
- Return at least 1 category, maximum ${maxSuggestions} categories
- If the content doesn't clearly match any category, choose the most general applicable ones`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a content categorization assistant. Your job is to analyze list content and assign appropriate categories. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent categorization
      max_tokens: 500,
    });

    const content = response.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content returned from OpenAI for categorization');
      return { suggestions: [] };
    }

    // Parse the JSON response
    let parsed;
    try {
      // Clean up potential markdown code blocks
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsed = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI categorization response:', content);
      return { suggestions: [] };
    }

    // Map the slugs back to full category data
    const categoryMap = new Map(
      availableCategories.map(cat => [cat.slug, cat])
    );

    const suggestions: CategorySuggestion[] = (parsed.suggestions || [])
      .filter((s: any) => categoryMap.has(s.slug))
      .map((s: any) => {
        const cat = categoryMap.get(s.slug)!;
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          confidence: Math.min(1, Math.max(0, s.confidence || 0.5)),
        };
      })
      .slice(0, maxSuggestions);

    return {
      suggestions,
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    console.error('Error calling OpenAI for categorization:', error);
    throw error;
  }
}
