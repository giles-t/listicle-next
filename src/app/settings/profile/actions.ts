'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { createClient, supabaseAdmin } from '@/server/supabase';
import { updateUserProfile } from '@/server/db/queries/profiles';
import { profileFormSchema, type ProfileFormData } from '@/shared/validation/user';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Extract form data (convert null to empty string for optional fields)
  const rawFormData = {
    username: (formData.get('username') as string) || '',
    displayName: (formData.get('displayName') as string) || '',
    bio: (formData.get('bio') as string) || '',
    location: (formData.get('location') as string) || '',
    website: (formData.get('website') as string) || '',
    twitter: (formData.get('twitter') as string) || '',
    linkedin: (formData.get('linkedin') as string) || '',
    instagram: (formData.get('instagram') as string) || '',
    youtube: (formData.get('youtube') as string) || '',
    github: (formData.get('github') as string) || '',
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

    // Sync critical fields to auth metadata using admin client (avoids session warning)
    try {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
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
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return {
        error: 'Authentication required',
      };
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

    console.log('Processing avatar upload:', {
      fileSize: file.size,
      fileType: file.type,
      userId: user.id,
    });

    // Process image with sharp (optimize and resize for avatars)
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const processedBuffer = await sharp(imageBuffer)
      .resize(400, 400, { 
        fit: 'cover', // Crop to square
        position: 'center',
        withoutEnlargement: true 
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `avatars/${user.id}/${timestamp}-${randomSuffix}.webp`;

    // Upload to Vercel Blob Storage
    const blob = await put(fileName, processedBuffer, {
      access: 'public',
      contentType: 'image/webp',
    });

    console.log('Avatar uploaded successfully to Vercel Blob:', blob.url);

    // Update profile with new avatar URL
    const updatedUser = await updateUserProfile(user.id, {
      avatar: blob.url,
    });

    if (!updatedUser) {
      console.error('Failed to update profile with avatar URL');
      return {
        error: 'Failed to update profile with avatar',
      };
    }

    // Sync avatar to auth metadata using admin client (avoids session warning)
    try {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          avatar: blob.url,
        }
      });
      console.log('Synced avatar to auth.users metadata');
    } catch (metadataError) {
      console.error('Failed to sync avatar metadata (non-critical):', metadataError);
      // Don't fail the request if metadata sync fails
    }

    // Revalidate the settings page
    revalidatePath('/settings/profile');
    
    return {
      success: true,
      message: 'Avatar updated successfully!',
      avatarUrl: blob.url,
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string'
      ? error
      : 'Failed to upload avatar';
    
    return {
      error: errorMessage,
    };
  }
} 