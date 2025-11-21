-- Migration: Create trigger to automatically create profiles on user signup
-- 
-- NOTE: This trigger is OPTIONAL and not required.
-- The onboarding flow now creates profiles when users complete onboarding.
-- 
-- If you want automatic profile creation on signup, run this migration.
-- Otherwise, profiles will be created when users complete onboarding.
--
-- To use this trigger:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Profiles will be auto-created with temporary usernames
-- 3. Users will still be redirected to onboarding to set their real username
--
-- To skip this trigger:
-- - Simply don't run this migration
-- - Profiles will be created during onboarding instead

-- Function to auto-create user profile (public data only, no email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  generated_username text;
  final_username text;
  username_exists boolean;
  attempt_count int := 0;
  username_was_set boolean;
BEGIN
  -- Determine if username was provided by user (in metadata) or auto-generated
  -- If username exists in metadata, user has set it; otherwise it's auto-generated
  username_was_set := NEW.raw_user_meta_data->>'username' IS NOT NULL;
  
  -- Extract username from metadata or generate from email
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Sanitize username (remove non-alphanumeric except underscore)
  generated_username := REGEXP_REPLACE(generated_username, '[^a-zA-Z0-9_]', '', 'g');
  
  -- Ensure username has minimum length
  -- If no username provided, create a temporary one that onboarding will replace
  IF LENGTH(generated_username) = 0 THEN
    generated_username := 'user' || SUBSTRING(NEW.id, 1, 8);
  END IF;
  
  -- Truncate to max length
  generated_username := SUBSTRING(generated_username, 1, 30);
  
  -- Ensure username uniqueness with retry logic
  final_username := generated_username;
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = final_username) INTO username_exists;
    EXIT WHEN NOT username_exists OR attempt_count > 10;
    final_username := SUBSTRING(generated_username || FLOOR(RANDOM() * 10000)::text, 1, 30);
    attempt_count := attempt_count + 1;
  END LOOP;
  
  -- Insert user profile (public data only, no email)
  -- If profile exists, user has completed onboarding (username is required)
  INSERT INTO public.profiles (id, username, name, avatar)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name', 
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after user is created in auth.users
-- NOTE: This is optional - you can skip this if you want onboarding to create profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
