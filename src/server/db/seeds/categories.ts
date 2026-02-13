/**
 * Category seed data for Listicle
 * 
 * This file contains all pre-defined categories that will be seeded into the database.
 * Edit this file to add, remove, or modify categories.
 * 
 * Available icons: cpu, plane, utensils, heart, briefcase, activity, film, graduation-cap, 
 *                  trophy, shirt, book, music, camera, home, car, gamepad, palette, globe
 * 
 * Available colors: brand, success, warning, error, neutral
 */

export interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: 'brand' | 'success' | 'warning' | 'error' | 'neutral';
  sort_order: number;
}

export const CATEGORIES: CategorySeed[] = [
  // Technology & Digital
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest innovations, gadgets, software, and tech trends shaping our digital future',
    icon: 'cpu',
    color: 'brand',
    sort_order: 1,
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Video games, esports, gaming hardware, and interactive entertainment',
    icon: 'gamepad',
    color: 'brand',
    sort_order: 2,
  },
  {
    name: 'Science',
    slug: 'science',
    description: 'Scientific discoveries, research breakthroughs, and exploration of the natural world',
    icon: 'globe',
    color: 'brand',
    sort_order: 3,
  },

  // Lifestyle & Wellness
  {
    name: 'Health & Fitness',
    slug: 'health-fitness',
    description: 'Workout routines, nutrition advice, mental health, and wellness guides',
    icon: 'activity',
    color: 'success',
    sort_order: 10,
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Tips for living your best life, from wellness to home decor and personal growth',
    icon: 'heart',
    color: 'error',
    sort_order: 11,
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Interior design, DIY projects, gardening tips, and home improvement ideas',
    icon: 'home',
    color: 'success',
    sort_order: 12,
  },
  {
    name: 'Parenting & Family',
    slug: 'parenting-family',
    description: 'Parenting advice, family activities, child development, and household tips',
    icon: 'heart',
    color: 'error',
    sort_order: 13,
  },
  {
    name: 'Relationships',
    slug: 'relationships',
    description: 'Dating advice, relationship guidance, communication tips, and social connections',
    icon: 'heart',
    color: 'error',
    sort_order: 14,
  },

  // Food & Drink
  {
    name: 'Food & Cooking',
    slug: 'food-cooking',
    description: 'Recipes, cooking techniques, restaurant reviews, and culinary adventures',
    icon: 'utensils',
    color: 'warning',
    sort_order: 20,
  },
  {
    name: 'Drinks & Beverages',
    slug: 'drinks-beverages',
    description: 'Coffee, cocktails, wine, craft beer, and non-alcoholic drink recipes',
    icon: 'utensils',
    color: 'warning',
    sort_order: 21,
  },

  // Travel & Adventure
  {
    name: 'Travel',
    slug: 'travel',
    description: 'Destination guides, travel tips, adventure inspiration, and cultural experiences',
    icon: 'plane',
    color: 'success',
    sort_order: 30,
  },
  {
    name: 'Outdoor & Adventure',
    slug: 'outdoor-adventure',
    description: 'Hiking, camping, extreme sports, and outdoor exploration guides',
    icon: 'plane',
    color: 'success',
    sort_order: 31,
  },

  // Entertainment & Culture
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Movies, TV shows, streaming content, and pop culture trends',
    icon: 'film',
    color: 'brand',
    sort_order: 40,
  },
  {
    name: 'Music',
    slug: 'music',
    description: 'Artists, albums, genres, playlists, concerts, and music industry news',
    icon: 'music',
    color: 'brand',
    sort_order: 41,
  },
  {
    name: 'Books & Literature',
    slug: 'books-literature',
    description: 'Book recommendations, author spotlights, reading lists, and literary discussions',
    icon: 'book',
    color: 'neutral',
    sort_order: 42,
  },
  {
    name: 'Art & Design',
    slug: 'art-design',
    description: 'Visual arts, graphic design, photography, and creative inspiration',
    icon: 'palette',
    color: 'brand',
    sort_order: 43,
  },
  {
    name: 'Photography',
    slug: 'photography',
    description: 'Photography techniques, gear reviews, editing tips, and visual storytelling',
    icon: 'camera',
    color: 'neutral',
    sort_order: 44,
  },

  // Business & Career
  {
    name: 'Business',
    slug: 'business',
    description: 'Entrepreneurship, startups, business strategy, and corporate insights',
    icon: 'briefcase',
    color: 'neutral',
    sort_order: 50,
  },
  {
    name: 'Career & Jobs',
    slug: 'career-jobs',
    description: 'Career advice, job hunting, workplace tips, and professional development',
    icon: 'briefcase',
    color: 'neutral',
    sort_order: 51,
  },
  {
    name: 'Productivity',
    slug: 'productivity',
    description: 'Time management, organization tools, work habits, and efficiency tips',
    icon: 'briefcase',
    color: 'neutral',
    sort_order: 52,
  },
  {
    name: 'Finance & Money',
    slug: 'finance-money',
    description: 'Personal finance, investing, budgeting, and money management strategies',
    icon: 'briefcase',
    color: 'success',
    sort_order: 53,
  },
  {
    name: 'Marketing',
    slug: 'marketing',
    description: 'Digital marketing, social media strategy, branding, and growth tactics',
    icon: 'briefcase',
    color: 'brand',
    sort_order: 54,
  },

  // Education & Learning
  {
    name: 'Education',
    slug: 'education',
    description: 'Learning resources, study tips, online courses, and educational content',
    icon: 'graduation-cap',
    color: 'warning',
    sort_order: 60,
  },
  {
    name: 'Self-Improvement',
    slug: 'self-improvement',
    description: 'Personal development, skill building, motivation, and life hacks',
    icon: 'graduation-cap',
    color: 'warning',
    sort_order: 61,
  },
  {
    name: 'Languages',
    slug: 'languages',
    description: 'Language learning tips, vocabulary, grammar guides, and multilingual resources',
    icon: 'book',
    color: 'warning',
    sort_order: 62,
  },

  // Sports & Fitness
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Game highlights, athlete profiles, sports analysis, and fan content',
    icon: 'trophy',
    color: 'error',
    sort_order: 70,
  },
  {
    name: 'Fitness & Exercise',
    slug: 'fitness-exercise',
    description: 'Workout plans, exercise routines, gym tips, and athletic training',
    icon: 'activity',
    color: 'success',
    sort_order: 71,
  },

  // Fashion & Beauty
  {
    name: 'Fashion & Style',
    slug: 'fashion-style',
    description: 'Trends, outfit ideas, style inspiration, and wardrobe essentials',
    icon: 'shirt',
    color: 'brand',
    sort_order: 80,
  },
  {
    name: 'Beauty & Skincare',
    slug: 'beauty-skincare',
    description: 'Makeup tutorials, skincare routines, beauty products, and grooming tips',
    icon: 'heart',
    color: 'error',
    sort_order: 81,
  },

  // Automotive
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Cars, motorcycles, EVs, automotive news, and vehicle reviews',
    icon: 'car',
    color: 'neutral',
    sort_order: 90,
  },

  // Pets & Animals
  {
    name: 'Pets & Animals',
    slug: 'pets-animals',
    description: 'Pet care tips, animal facts, wildlife, and content for animal lovers',
    icon: 'heart',
    color: 'warning',
    sort_order: 100,
  },

  // News & Current Events
  {
    name: 'News & Politics',
    slug: 'news-politics',
    description: 'Current events, political analysis, world news, and civic engagement',
    icon: 'globe',
    color: 'neutral',
    sort_order: 110,
  },

  // DIY & Crafts
  {
    name: 'DIY & Crafts',
    slug: 'diy-crafts',
    description: 'Handmade projects, craft tutorials, upcycling ideas, and creative hobbies',
    icon: 'palette',
    color: 'warning',
    sort_order: 120,
  },

  // Environment & Sustainability
  {
    name: 'Environment',
    slug: 'environment',
    description: 'Sustainability, climate action, eco-friendly living, and environmental news',
    icon: 'globe',
    color: 'success',
    sort_order: 130,
  },

  // History & Culture
  {
    name: 'History',
    slug: 'history',
    description: 'Historical events, ancient civilizations, cultural heritage, and timelines',
    icon: 'book',
    color: 'neutral',
    sort_order: 140,
  },

  // Humor & Fun
  {
    name: 'Humor & Memes',
    slug: 'humor-memes',
    description: 'Funny lists, memes, internet culture, and entertainment for laughs',
    icon: 'film',
    color: 'warning',
    sort_order: 150,
  },
];

/**
 * Generate SQL INSERT statements for categories
 */
export function generateCategoriesSQL(): string {
  const values = CATEGORIES.map(
    (cat) =>
      `('${cat.name.replace(/'/g, "''")}', '${cat.slug}', '${cat.description.replace(/'/g, "''")}', '${cat.icon}', '${cat.color}', ${cat.sort_order})`
  ).join(',\n  ');

  return `INSERT INTO "categories" ("name", "slug", "description", "icon", "color", "sort_order") VALUES
  ${values}
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();`;
}

/**
 * Get category by slug
 */
export function getCategorySeedBySlug(slug: string): CategorySeed | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}

/**
 * Get all category slugs
 */
export function getAllCategorySlugs(): string[] {
  return CATEGORIES.map((cat) => cat.slug);
}
