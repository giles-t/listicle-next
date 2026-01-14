-- Create notification_type enum
CREATE TYPE "notification_type" AS ENUM ('follow', 'comment', 'reaction_milestone', 'view_milestone');

-- Create follows table
CREATE TABLE IF NOT EXISTS "follows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "follower_id" text NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "following_id" text NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create unique index for follows (prevent duplicate follows)
CREATE UNIQUE INDEX "unique_follow_idx" ON "follows" ("follower_id", "following_id");

-- Create indexes for efficient follow queries
CREATE INDEX "follows_follower_id_idx" ON "follows" ("follower_id");
CREATE INDEX "follows_following_id_idx" ON "follows" ("following_id");

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" "notification_type" NOT NULL,
  "user_id" text NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "actor_id" text REFERENCES "profiles"("id") ON DELETE CASCADE,
  "list_id" uuid REFERENCES "lists"("id") ON DELETE CASCADE,
  "comment_id" uuid REFERENCES "comments"("id") ON DELETE CASCADE,
  "milestone_count" integer,
  "is_read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for efficient notification queries
CREATE INDEX "notifications_user_id_idx" ON "notifications" ("user_id");
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications" ("user_id", "is_read");
CREATE INDEX "notifications_created_at_idx" ON "notifications" ("created_at" DESC);
