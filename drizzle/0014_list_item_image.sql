-- Add image column to list_items table for preview/thumbnail images
ALTER TABLE "list_items" ADD COLUMN IF NOT EXISTS "image" text;

-- Optionally populate the image column from media_url where media_type is 'image'
-- This migrates existing image media to the new dedicated image field
UPDATE "list_items" 
SET "image" = "media_url" 
WHERE "media_type" = 'image' AND "media_url" IS NOT NULL AND "image" IS NULL;
