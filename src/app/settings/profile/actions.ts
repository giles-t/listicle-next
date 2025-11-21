'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/server/supabase';
import { updateUserProfile } from '@/server/db/queries/profiles';
import { profileFormSchema, type ProfileFormData } from '@/shared/validation/user';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Extract form data
  const rawFormData = {
    username: formData.get('username') as string,
    displayName: formData.get('displayName') as string,
    bio: formData.get('bio') as string,
    location: formData.get('location') as string,
    website: formData.get('website') as string,
    twitter: formData.get('twitter') as string,
    linkedin: formData.get('linkedin') as string,
    instagram: formData.get('instagram') as string,
    youtube: formData.get('youtube') as string,
    github: formData.get('github') as string,
  };

  // Validate form data
  const validationResult = profileFormSchema.safeParse(rawFormData);
  
  if (!validationResult.success) {
    return {
      error: 'Invalid form data',
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const profileData = validationResult.data;

  try {
    // Update user profile directly in database
    console.log('Updating profile for user:', user.id, 'with data:', profileData);
    
    const updatedUser = await updateUserProfile(user.id, {
      username: profileData.username,
      name: profileData.displayName ?? undefined,
      bio: profileData.bio ?? undefined,
      location: profileData.location ?? undefined,
      website: profileData.website ?? undefined,
      twitter: profileData.twitter ?? undefined,
      linkedin: profileData.linkedin ?? undefined,
      instagram: profileData.instagram ?? undefined,
      youtube: profileData.youtube ?? undefined,
      github: profileData.github ?? undefined,
    });

    console.log('Update result:', updatedUser);

    if (!updatedUser) {
      console.error('No user returned from update - profile may not exist in database');
      return {
        error: 'Profile not found. Please sign out and sign in again to create your profile.',
      };
    }

    // Sync critical fields to auth metadata
    try {
      await supabase.auth.updateUser({
        data: {
          username: profileData.username,
          name: profileData.displayName ?? undefined,
        }
      });
      console.log('Synced metadata to auth.users');
    } catch (metadataError) {
      console.error('Failed to sync metadata (non-critical):', metadataError);
      // Don't fail the request if metadata sync fails
    }

    // Revalidate the settings page
    revalidatePath('/settings/profile');
    
    return {
      success: true,
      message: 'Profile updated successfully!',
    };
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return {
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const file = formData.get('avatar') as File;
  
  if (!file) {
    return {
      error: 'No file provided',
    };
  }

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return {
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      error: 'File too large. Maximum size is 2MB.',
    };
  }

  try {
    // Upload to Supabase storage
    const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile with new avatar URL directly in database
    const updatedUser = await updateUserProfile(user.id, {
      avatar: publicUrl,
    });

    if (!updatedUser) {
      throw new Error('Failed to update profile with avatar');
    }

    // Revalidate the settings page
    revalidatePath('/settings/profile');
    
    return {
      success: true,
      message: 'Avatar updated successfully!',
      avatarUrl: publicUrl,
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to upload avatar',
    };
  }
} 