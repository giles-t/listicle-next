# Reaction Bar Implementation

## Overview

This document describes the real-time emoji reaction bar implementation using Supabase Realtime.

## Features

✅ Real-time emoji reactions (like Slack/Discord)  
✅ Supabase Realtime for instant updates across all users  
✅ Emoji picker integration (emoji-picker-react)  
✅ Quick access emojis (😊, ❤️, 👍, 🏆)  
✅ Optimistic UI updates for instant feedback  
✅ User authentication integration  
✅ Grouped emoji counts  

## Architecture

### Database Schema

The `reactions` table has been updated:
- **emoji**: `varchar(10)` - Stores any emoji character
- **user_id**: References the user who reacted
- **list_id**: References the list being reacted to
- **list_item_id**: Optional - for item-level reactions
- **created_at**: Timestamp of the reaction
- **Unique constraint**: (user_id, list_id, list_item_id, emoji) - One reaction per emoji per user

### Components

1. **ReactionBar** (`src/app/profile/[username]/[slug]/ReactionBar.tsx`)
   - Client component with real-time subscription
   - Handles emoji selection and toggling
   - Shows quick access emojis and all other reactions
   - Integrates emoji-picker-react

2. **ReactionBarWrapper** (`src/app/profile/[username]/[slug]/ReactionBarWrapper.tsx`)
   - Server component that fetches user authentication
   - Passes user ID to ReactionBar

### API Endpoints

**GET** `/api/lists/[id]/reactions`
- Fetches all reactions for a list with counts
- Returns user's reactions if authenticated

**POST** `/api/lists/[id]/reactions`
- Adds a reaction (requires authentication)
- Body: `{ emoji: string }`

**DELETE** `/api/lists/[id]/reactions?emoji=<emoji>`
- Removes a reaction (requires authentication)
- Query param: `emoji`

### Database Queries

Located in `src/server/db/queries/reactions.ts`:
- `getListReactions()` - Get all reactions grouped by emoji
- `getUserListReactions()` - Get user's reactions
- `addListReaction()` - Add a reaction
- `removeListReaction()` - Remove a reaction
- Plus item-level equivalents for future use

## Supabase Realtime Setup

### Enable Realtime on Reactions Table

To enable real-time updates, you need to enable replication for the `reactions` table in Supabase:

1. Go to your Supabase dashboard
2. Navigate to **Database** → **Replication**
3. Find the `reactions` table
4. Toggle **Enable** for the table
5. Save changes

Or run this SQL in the SQL Editor:

```sql
-- Enable realtime for reactions table
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- Verify it's enabled
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Enable Row Level Security (RLS)

For security, ensure RLS is enabled:

```sql
-- Enable RLS on reactions table
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reactions
CREATE POLICY "Anyone can view reactions"
  ON reactions FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert their own reactions
CREATE POLICY "Authenticated users can add reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reactions
CREATE POLICY "Users can delete their own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

## Usage

The reaction bar is automatically displayed on list view pages below the engagement buttons (views, likes, comments).

### User Flow

1. **Viewing Reactions**
   - All users can see reaction counts
   - Reactions update in real-time

2. **Adding Reactions**
   - Click a quick emoji (😊, ❤️, 👍, 🏆) to react
   - Click the + button to open emoji picker
   - Select any emoji from the picker
   - Reaction is added instantly (optimistic update)
   - All connected users see the update in real-time

3. **Removing Reactions**
   - Click a highlighted emoji to remove your reaction
   - Reaction is removed instantly
   - All connected users see the update in real-time

### Authentication

- Unauthenticated users can view reactions
- Only authenticated users can add/remove reactions
- Each user can only have one reaction per emoji per list

## Real-time Updates

The component subscribes to Supabase Realtime channels:
- Channel name: `reactions:list:{listId}`
- Listens for: INSERT, UPDATE, DELETE events
- Auto-refetches reactions on any change
- Cleans up subscription on unmount

## Styling

The reaction bar follows the existing design system:
- Uses the `Button` component from `@/ui/components/Button`
- Quick emojis displayed first, then other reactions
- Active reactions highlighted with `brand-tertiary` variant
- Inactive reactions use `neutral-tertiary` variant
- Emoji counts shown next to emojis

## Future Enhancements

Potential improvements:
- [ ] Add reactions to individual list items
- [ ] Show user names on hover (who reacted)
- [ ] Add reaction animations
- [ ] Add "Popular" emoji suggestions
- [ ] Add reaction analytics
- [ ] Rate limiting for spam prevention
- [ ] Emoji search in picker

## Testing

To test the implementation:

1. **Basic Functionality**
   - Open a list view page
   - Click quick emojis to react
   - Click + button to open emoji picker
   - Select different emojis
   - Click again to remove reactions

2. **Real-time Updates**
   - Open the same list in two browser windows
   - Add/remove reactions in one window
   - Verify instant updates in the other window

3. **Authentication**
   - Test as unauthenticated user (can view only)
   - Test as authenticated user (can add/remove)

## Troubleshooting

### Reactions not updating in real-time

- Verify Supabase Realtime is enabled for `reactions` table
- Check browser console for subscription errors
- Verify environment variables are set correctly

### Can't add reactions

- Verify user is authenticated
- Check RLS policies are configured
- Check browser console for API errors

### Emoji picker not showing

- Verify `emoji-picker-react` is installed
- Check for CSS conflicts
- Try clearing browser cache

## Dependencies

- `emoji-picker-react`: ^4.x.x (or latest)
- `@supabase/supabase-js`: ^2.x.x
- `@supabase/ssr`: ^0.6.x

## Migration Applied

Migration file: `drizzle/0006_emoji_reactions.sql`
- Adds `emoji` column to reactions table
- Drops old `reaction_type` enum column
- Updates unique index to use emoji instead of reaction_type

