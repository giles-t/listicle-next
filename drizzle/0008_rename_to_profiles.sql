-- Migration: Rename users table to profiles and remove email column
-- This separates public profile data from private auth data

-- Rename users table to profiles
ALTER TABLE users RENAME TO profiles;

-- Drop email column (email stays private in auth.users)
ALTER TABLE profiles DROP COLUMN email;

-- Add foreign key constraint to auth.users with cascade delete
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update all foreign key constraint names to reflect new table name
-- Lists table
ALTER TABLE lists DROP CONSTRAINT IF EXISTS lists_user_id_users_id_fk;
ALTER TABLE lists ADD CONSTRAINT lists_user_id_profiles_id_fk 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Comments table
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_users_id_fk;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_profiles_id_fk 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Reactions table
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_user_id_users_id_fk;
ALTER TABLE reactions ADD CONSTRAINT reactions_user_id_profiles_id_fk 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Publication members table
ALTER TABLE publication_members DROP CONSTRAINT IF EXISTS publication_members_user_id_users_id_fk;
ALTER TABLE publication_members ADD CONSTRAINT publication_members_user_id_profiles_id_fk 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Bookmarks table
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_users_id_fk;
ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_user_id_profiles_id_fk 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

