-- Bookmark Collections table
CREATE TABLE IF NOT EXISTS "bookmark_collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "user_id" text NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Unique constraint on collection name per user
CREATE UNIQUE INDEX IF NOT EXISTS "unique_collection_name_idx" ON "bookmark_collections" ("user_id", "name");

-- Add collection_id to bookmarks table
ALTER TABLE "bookmarks" ADD COLUMN IF NOT EXISTS "collection_id" uuid REFERENCES "bookmark_collections"("id") ON DELETE SET NULL;

-- Create index for faster collection lookups
CREATE INDEX IF NOT EXISTS "bookmarks_collection_id_idx" ON "bookmarks" ("collection_id");
CREATE INDEX IF NOT EXISTS "bookmark_collections_user_id_idx" ON "bookmark_collections" ("user_id");
