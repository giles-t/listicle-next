-- Create category icon enum
DO $$ BEGIN
  CREATE TYPE "category_icon" AS ENUM (
    'cpu', 'plane', 'utensils', 'heart', 'briefcase', 'activity', 
    'film', 'graduation-cap', 'trophy', 'shirt', 'book', 'music',
    'camera', 'home', 'car', 'gamepad', 'palette', 'globe'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create category color enum
DO $$ BEGIN
  CREATE TYPE "category_color" AS ENUM ('brand', 'success', 'warning', 'error', 'neutral');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(50) NOT NULL UNIQUE,
  "slug" varchar(50) NOT NULL UNIQUE,
  "description" text,
  "icon" "category_icon" NOT NULL DEFAULT 'globe',
  "color" "category_color" NOT NULL DEFAULT 'brand',
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create category_follows table
CREATE TABLE IF NOT EXISTS "category_follows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create unique index for category follows
CREATE UNIQUE INDEX IF NOT EXISTS "unique_category_follow_idx" ON "category_follows" ("user_id", "category_id");

-- Create list_to_categories junction table
CREATE TABLE IF NOT EXISTS "list_to_categories" (
  "list_id" uuid NOT NULL REFERENCES "lists"("id") ON DELETE CASCADE,
  "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY ("list_id", "category_id")
);

-- Seed default categories
-- Full category list is maintained in: src/server/db/seeds/categories.ts
-- Run `npx tsx src/server/db/seeds/run-seed.ts` to seed/update categories
INSERT INTO "categories" ("name", "slug", "description", "icon", "color", "sort_order") VALUES
  -- Technology & Digital
  ('Technology', 'technology', 'Latest innovations, gadgets, software, and tech trends shaping our digital future', 'cpu', 'brand', 1),
  ('Gaming', 'gaming', 'Video games, esports, gaming hardware, and interactive entertainment', 'gamepad', 'brand', 2),
  ('Science', 'science', 'Scientific discoveries, research breakthroughs, and exploration of the natural world', 'globe', 'brand', 3),
  
  -- Lifestyle & Wellness
  ('Health & Fitness', 'health-fitness', 'Workout routines, nutrition advice, mental health, and wellness guides', 'activity', 'success', 10),
  ('Lifestyle', 'lifestyle', 'Tips for living your best life, from wellness to home decor and personal growth', 'heart', 'error', 11),
  ('Home & Garden', 'home-garden', 'Interior design, DIY projects, gardening tips, and home improvement ideas', 'home', 'success', 12),
  ('Parenting & Family', 'parenting-family', 'Parenting advice, family activities, child development, and household tips', 'heart', 'error', 13),
  ('Relationships', 'relationships', 'Dating advice, relationship guidance, communication tips, and social connections', 'heart', 'error', 14),
  
  -- Food & Drink
  ('Food & Cooking', 'food-cooking', 'Recipes, cooking techniques, restaurant reviews, and culinary adventures', 'utensils', 'warning', 20),
  ('Drinks & Beverages', 'drinks-beverages', 'Coffee, cocktails, wine, craft beer, and non-alcoholic drink recipes', 'utensils', 'warning', 21),
  
  -- Travel & Adventure
  ('Travel', 'travel', 'Destination guides, travel tips, adventure inspiration, and cultural experiences', 'plane', 'success', 30),
  ('Outdoor & Adventure', 'outdoor-adventure', 'Hiking, camping, extreme sports, and outdoor exploration guides', 'plane', 'success', 31),
  
  -- Entertainment & Culture
  ('Entertainment', 'entertainment', 'Movies, TV shows, streaming content, and pop culture trends', 'film', 'brand', 40),
  ('Music', 'music', 'Artists, albums, genres, playlists, concerts, and music industry news', 'music', 'brand', 41),
  ('Books & Literature', 'books-literature', 'Book recommendations, author spotlights, reading lists, and literary discussions', 'book', 'neutral', 42),
  ('Art & Design', 'art-design', 'Visual arts, graphic design, photography, and creative inspiration', 'palette', 'brand', 43),
  ('Photography', 'photography', 'Photography techniques, gear reviews, editing tips, and visual storytelling', 'camera', 'neutral', 44),
  
  -- Business & Career
  ('Business', 'business', 'Entrepreneurship, startups, business strategy, and corporate insights', 'briefcase', 'neutral', 50),
  ('Career & Jobs', 'career-jobs', 'Career advice, job hunting, workplace tips, and professional development', 'briefcase', 'neutral', 51),
  ('Productivity', 'productivity', 'Time management, organization tools, work habits, and efficiency tips', 'briefcase', 'neutral', 52),
  ('Finance & Money', 'finance-money', 'Personal finance, investing, budgeting, and money management strategies', 'briefcase', 'success', 53),
  ('Marketing', 'marketing', 'Digital marketing, social media strategy, branding, and growth tactics', 'briefcase', 'brand', 54),
  
  -- Education & Learning
  ('Education', 'education', 'Learning resources, study tips, online courses, and educational content', 'graduation-cap', 'warning', 60),
  ('Self-Improvement', 'self-improvement', 'Personal development, skill building, motivation, and life hacks', 'graduation-cap', 'warning', 61),
  ('Languages', 'languages', 'Language learning tips, vocabulary, grammar guides, and multilingual resources', 'book', 'warning', 62),
  
  -- Sports & Fitness
  ('Sports', 'sports', 'Game highlights, athlete profiles, sports analysis, and fan content', 'trophy', 'error', 70),
  ('Fitness & Exercise', 'fitness-exercise', 'Workout plans, exercise routines, gym tips, and athletic training', 'activity', 'success', 71),
  
  -- Fashion & Beauty
  ('Fashion & Style', 'fashion-style', 'Trends, outfit ideas, style inspiration, and wardrobe essentials', 'shirt', 'brand', 80),
  ('Beauty & Skincare', 'beauty-skincare', 'Makeup tutorials, skincare routines, beauty products, and grooming tips', 'heart', 'error', 81),
  
  -- Automotive
  ('Automotive', 'automotive', 'Cars, motorcycles, EVs, automotive news, and vehicle reviews', 'car', 'neutral', 90),
  
  -- Pets & Animals
  ('Pets & Animals', 'pets-animals', 'Pet care tips, animal facts, wildlife, and content for animal lovers', 'heart', 'warning', 100),
  
  -- News & Current Events
  ('News & Politics', 'news-politics', 'Current events, political analysis, world news, and civic engagement', 'globe', 'neutral', 110),
  
  -- DIY & Crafts
  ('DIY & Crafts', 'diy-crafts', 'Handmade projects, craft tutorials, upcycling ideas, and creative hobbies', 'palette', 'warning', 120),
  
  -- Environment & Sustainability
  ('Environment', 'environment', 'Sustainability, climate action, eco-friendly living, and environmental news', 'globe', 'success', 130),
  
  -- History & Culture
  ('History', 'history', 'Historical events, ancient civilizations, cultural heritage, and timelines', 'book', 'neutral', 140),
  
  -- Humor & Fun
  ('Humor & Memes', 'humor-memes', 'Funny lists, memes, internet culture, and entertainment for laughs', 'film', 'warning', 150)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
