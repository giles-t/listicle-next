ALTER TABLE "list_items" ADD COLUMN "title" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;