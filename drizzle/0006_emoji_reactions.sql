-- Migration: Add emoji support to reactions table
-- Drop the old unique index
DROP INDEX IF EXISTS "unique_reaction_idx";

-- Add emoji column
ALTER TABLE "reactions" ADD COLUMN "emoji" varchar(10) NOT NULL DEFAULT '👍';

-- Drop the old reaction_type column
ALTER TABLE "reactions" DROP COLUMN IF EXISTS "reaction_type";

-- Create new unique index with emoji
CREATE UNIQUE INDEX "unique_reaction_idx" ON "reactions" ("user_id","list_id","list_item_id","emoji");

-- Remove default value after migration
ALTER TABLE "reactions" ALTER COLUMN "emoji" DROP DEFAULT;

