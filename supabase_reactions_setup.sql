-- ============================================
-- Supabase Reactions Table Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor to:
-- 1. Enable realtime updates for reactions
-- 2. Set REPLICA IDENTITY FULL (required for DELETE events with filters)
-- 3. Set up Row Level Security (RLS) policies
-- ============================================

-- 1. Enable Realtime for reactions table
-- This allows real-time subscriptions to react to changes
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- 2. Set Replica Identity to FULL (REQUIRED for DELETE events with filters)
-- This ensures DELETE events include all column data needed for filter evaluation
ALTER TABLE reactions REPLICA IDENTITY FULL;

-- 3. Enable Row Level Security
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Anyone can view reactions" ON reactions;
DROP POLICY IF EXISTS "Authenticated users can add reactions" ON reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON reactions;

-- 5. Create RLS Policies

-- Policy 1: Allow anyone (including anonymous users) to read reactions
CREATE POLICY "Anyone can view reactions"
  ON reactions
  FOR SELECT
  TO public
  USING (true);

-- Policy 2: Allow authenticated users to insert reactions (must be their own)
CREATE POLICY "Authenticated users can add reactions"
  ON reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Policy 3: Allow users to delete only their own reactions
CREATE POLICY "Users can delete their own reactions"
  ON reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- 6. Verify Setup
-- Run these queries to verify everything is set up correctly

-- Check if realtime is enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND schemaname = 'public' 
  AND tablename = 'reactions';

-- Check if REPLICA IDENTITY is set to FULL (should return 'f' for full)
SELECT 
  schemaname,
  tablename,
  relreplident
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relname = 'reactions';
-- relreplident: 'd' = default, 'n' = nothing, 'f' = full, 'i' = index

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'reactions';

-- List all policies on reactions table
SELECT * FROM pg_policies 
WHERE tablename = 'reactions';

-- ============================================
-- Expected Results:
-- ============================================
-- 1. pg_publication_tables should show reactions table
-- 2. relreplident should be 'f' (full) - REQUIRED for DELETE events with filters
-- 3. rowsecurity should be 't' (true)
-- 4. Should see 3 policies listed
-- ============================================

