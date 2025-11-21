-- Migration: Add list_item_id support to bookmarks table
-- Drop the old unique index
DROP INDEX IF EXISTS "unique_bookmark_idx";

-- Add list_item_id column (nullable, as bookmarks can be for lists or list items)
ALTER TABLE "bookmarks" ADD COLUMN IF NOT EXISTS "list_item_id" uuid REFERENCES "list_items"("id") ON DELETE CASCADE;

-- Create partial unique indexes to handle NULLs properly
-- For list bookmarks (list_item_id IS NULL): one bookmark per user per list
CREATE UNIQUE INDEX "unique_bookmark_list_idx" ON "bookmarks" ("user_id", "list_id") 
WHERE "list_item_id" IS NULL;

-- For item bookmarks (list_item_id IS NOT NULL): one bookmark per user per list per item
CREATE UNIQUE INDEX "unique_bookmark_item_idx" ON "bookmarks" ("user_id", "list_id", "list_item_id") 
WHERE "list_item_id" IS NOT NULL;

