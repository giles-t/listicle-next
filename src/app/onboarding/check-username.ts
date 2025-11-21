'use server';

import { db } from '@/server/db';
import { profiles } from '@/server/db/schema';
import { sql } from 'drizzle-orm';
import { createClient } from '@/server/supabase';

export async function checkUsernameAvailability(username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!username || username.trim().length < 3) {
    return {
      available: false,
      error: 'Username must be at least 3 characters',
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      available: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  // Check if username is already taken (case-insensitive)
  const normalizedUsername = username.trim().toLowerCase();
  const [existingProfile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(sql`LOWER(${profiles.username}) = ${normalizedUsername}`)
    .limit(1);

  // If profile exists and belongs to current user, it's available (they're updating their own)
  if (existingProfile && user && existingProfile.id === user.id) {
    return {
      available: true,
    };
  }

  if (existingProfile) {
    return {
      available: false,
      error: 'This username is already taken',
    };
  }

  return {
    available: true,
  };
}

