ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_id_comments_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" varchar(100);