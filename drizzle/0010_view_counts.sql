-- Add view_count columns to lists and list_items tables
ALTER TABLE "lists" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "list_items" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;

-- Create indexes for efficient queries when syncing view counts
CREATE INDEX "lists_view_count_idx" ON "lists" ("view_count");
CREATE INDEX "list_items_view_count_idx" ON "list_items" ("view_count");
