import { db } from '../index';
import { users } from '../schema';
import { eq } from 'drizzle-orm';

export interface CreateUserData {
  id: string;
  email: string;
  username?: string;
  name?: string;
}

/**
 * Get or create a user in the database
 * This ensures that Supabase Auth users have corresponding database records
 */
export async function getOrCreateUser(userData: CreateUserData) {
  const { id, email, username, name } = userData;

  // First, try to get the existing user
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (existingUser) {
    return existingUser;
  }

  // Generate a username if not provided
  const generatedUsername = username || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
  
  // Generate a name if not provided
  const generatedName = name || email.split('@')[0];

  // Create the user
  const [newUser] = await db
    .insert(users)
    .values({
      id,
      email,
      username: generatedUsername,
      name: generatedName,
    })
    .returning();

  return newUser;
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  id: string,
  updates: Partial<{
    username: string;
    name: string;
    bio: string;
    location: string;
    avatar: string;
    website: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    github: string;
  }>
) {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...updates,
      updated_at: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return updatedUser;
} 