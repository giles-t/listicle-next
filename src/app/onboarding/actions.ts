'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/server/supabase';
import { updateUserProfile } from '@/server/db/queries/profiles';
import { db } from '@/server/db';
import { profiles } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: 'You must be logged in to complete onboarding',
    };
  }

  // Extract form data
  const rawFormData = {
    username: formData.get('username') as string,
    displayName: formData.get('displayName') as string,
  };

  // Basic validation with field-level errors
  const fieldErrors: Record<string, string[]> = {};
  
  if (!rawFormData.username || rawFormData.username.trim().length < 3) {
    fieldErrors.username = ['Username must be at least 3 characters'];
  }

  if (!rawFormData.displayName || rawFormData.displayName.trim().length < 2) {
    fieldErrors.displayName = ['Display name must be at least 2 characters'];
  }

  // Validate username format
  if (rawFormData.username && !/^[a-zA-Z0-9_]+$/.test(rawFormData.username)) {
    fieldErrors.username = ['Username can only contain letters, numbers, and underscores'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: 'Please fix the errors below',
      fieldErrors,
    };
  }

  // Check if username is already taken (case-insensitive)
  const normalizedUsername = rawFormData.username.trim().toLowerCase();
  const [existingProfile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(sql`LOWER(${profiles.username}) = ${normalizedUsername}`)
    .limit(1);

  if (existingProfile && existingProfile.id !== user.id) {
    return {
      error: 'Username is already taken',
      fieldErrors: {
        username: ['This username is already taken'],
      },
    };
  }

  const profileData = {
    username: rawFormData.username.trim(),
    displayName: rawFormData.displayName.trim(),
  };

  try {
    // Check if profile already exists
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    let profile;
    
    if (existingProfile) {
      // Profile exists, update it
      console.log('Updating existing profile for user:', user.id);
      profile = await updateUserProfile(user.id, {
        username: profileData.username.toLowerCase(), // Store lowercase for uniqueness
        name: profileData.displayName ?? undefined,
      });
    } else {
      // Profile doesn't exist, create it (onboarding creates the profile)
      console.log('Creating new profile for user:', user.id);
      
      // Store username in lowercase for case-insensitive uniqueness
      // But display the original case to the user
      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: user.id,
          username: profileData.username.toLowerCase(), // Store lowercase for uniqueness
          name: profileData.displayName,
        })
        .returning();
      
      profile = newProfile;
    }

    if (!profile) {
      console.error('Failed to create/update profile');
      return {
        error: 'Failed to create profile. Please try again.',
      };
    }

    // Sync critical fields to auth metadata (this is what middleware checks)
    // This is critical - middleware uses this to determine if onboarding is complete
    try {
      await supabase.auth.updateUser({
        data: {
          username: profileData.username,
          name: profileData.displayName ?? undefined,
        }
      });
      console.log('Successfully synced username to auth metadata');
    } catch (metadataError) {
      console.error('Failed to sync metadata:', metadataError);
      // This is critical - if metadata sync fails, user will be stuck in onboarding loop
      return {
        error: 'Failed to save profile. Please try again.',
      };
    }

    // Revalidate paths
    revalidatePath('/onboarding');
    revalidatePath('/dashboard');
    
    return {
      success: true,
      message: 'Profile setup complete!',
    };
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to complete setup. Please try again.',
    };
  }
}

