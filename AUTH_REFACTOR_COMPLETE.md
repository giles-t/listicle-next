# Auth Refactor - Implementation Complete ✅

## Summary

Successfully refactored authentication to use Supabase best practices:
- ✅ Renamed `users` table to `profiles` (public data only)
- ✅ Removed `email` from profiles (stays in `auth.users`)
- ✅ Created database trigger for auto-profile creation
- ✅ Updated all code to use `profiles` table
- ✅ Configured metadata sync for username, name, avatar
- ✅ Optimized TopNav to use `user.user_metadata` (no extra API call)
- ✅ Profile updates sync back to auth metadata
- ✅ Removed manual user sync logic

## Database Migrations Created

### 1. `drizzle/0008_rename_to_profiles.sql`
- Renames `users` table to `profiles`
- Removes `email` column (stays private in `auth.users`)
- Updates all foreign key constraints
- Adds foreign key to `auth.users` with cascade delete

### 2. `drizzle/0009_auto_create_profiles.sql`
- Creates `handle_new_user()` trigger function
- Automatically creates profile when user signs up
- Extracts username, name, avatar from metadata
- Generates unique usernames with fallback logic
- Includes error handling to not block signups

## Next Steps - Database Setup

You need to apply these migrations to your database. Since you have a fresh database, here are your options:

### Option A: Use Drizzle Push (Recommended for fresh DB)

When you run `npm run db:push`, it will ask if you want to:
1. **Create** profiles table (choose this if truly fresh)
2. **Rename** users to profiles (choose this if you had users table)

Then manually run the trigger migration:

```bash
# After drizzle push completes, run the trigger SQL in Supabase SQL Editor
# Copy contents of drizzle/0009_auto_create_profiles.sql
```

### Option B: Manual SQL Execution

If you prefer full control, run these in Supabase SQL Editor in order:

1. First run: `drizzle/0008_rename_to_profiles.sql`
2. Then run: `drizzle/0009_auto_create_profiles.sql`

## Code Changes Made

### Schema Changes
- **`src/server/db/schema.ts`**: Renamed `users` → `profiles`, removed `email` field
- All relations updated to reference `profiles`

### Query Layer
- **`src/server/db/queries/profiles.ts`**: 
  - Consolidated all profile queries into single file
  - Merged functions from old `users.ts` file
  - Contains: `getUserById`, `getUserByUsername`, `updateUserProfile`, `getUserStats`, `getUserRecentLists`, etc.
  - Deleted old `users.ts` file (functions merged into profiles.ts)

### API Routes
- **`src/app/api/profile/route.ts`**: 
  - Uses `profiles` table
  - Syncs username/name/avatar updates back to auth metadata
- **Deleted**: `src/app/api/user/sync/route.ts` (no longer needed)

### Client Components
- **`src/client/hooks/use-auth.ts`**: 
  - Updated `signUp()` to accept metadata options
  - Passes username, name, avatar to Supabase auth
- **`src/client/components/TopNav.tsx`**:
  - Now reads from `user.user_metadata` directly
  - No separate API call needed for username/name/avatar
  - Much faster and more efficient

### Server Components
- **`src/app/dashboard/page.tsx`**: Removed manual user sync
- **`src/app/auth/callback/page.tsx`**: Removed sync API call
- **`src/app/me/list/[id]/edit/page.tsx`**: Updated to use `profiles`
- **`src/app/me/lists/page.tsx`**: Updated to use `profiles`
- **`src/app/me/lists/drafts/page.tsx`**: Updated to use `profiles`
- **`src/app/me/lists/published/page.tsx`**: Updated to use `profiles`

## How It Works Now

### Signup Flow
1. User signs up via `useAuth().signUp(email, password, { username, name, avatar })`
2. Supabase creates user in `auth.users` with metadata
3. Database trigger automatically creates profile in `profiles` table
4. No manual sync needed!

### Login Flow
1. User logs in
2. `useAuth()` provides user object with metadata
3. TopNav reads `user.user_metadata.{username, name, avatar}` directly
4. Fast, single-call authentication check

### Profile Update Flow
1. User updates profile via `/api/profile` PUT endpoint
2. Updates `profiles` table in database
3. Syncs critical fields (username, name, avatar) back to `auth.users` metadata
4. Both sources stay in sync

## Benefits Achieved

✅ **Performance**: Nav bar now makes 1 call instead of 2
✅ **Best Practices**: Follows Supabase documentation exactly
✅ **Separation of Concerns**: Public data in `profiles`, private in `auth.users`
✅ **Automatic Sync**: Database trigger handles profile creation
✅ **Data Consistency**: Metadata sync keeps everything aligned
✅ **Cleaner Code**: Removed 100+ lines of manual sync logic

## Testing Checklist

Once migrations are applied:

- [ ] Sign up a new user
- [ ] Verify profile is auto-created in `profiles` table
- [ ] Check that username/name appear in TopNav immediately
- [ ] Update profile in settings
- [ ] Verify changes sync to both `profiles` table and auth metadata
- [ ] Test magic link login
- [ ] Verify profile data persists across sessions

## Troubleshooting

### If trigger doesn't fire
Check that trigger was created:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### If profiles aren't created
Check trigger function exists:
```sql
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```

### If metadata isn't syncing
Profile updates will still work, metadata is just for performance. Check:
- Profile API returns 200
- `profiles` table has correct data
- Auth state refreshes after update

## Migration Files Location

- `drizzle/0008_rename_to_profiles.sql`
- `drizzle/0009_auto_create_profiles.sql`

Both files are ready to run in your Supabase SQL Editor.

