ALTER TABLE "lists" RENAME COLUMN "is_public" TO "is_visible";--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "allow_comments" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "seo_description" text;