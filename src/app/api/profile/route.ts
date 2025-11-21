import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { updateUserProfile } from '@/src/server/db/queries/profiles';
import { db } from '@/src/server/db';
import { profiles } from '@/src/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { profileUpdateSchema } from '@/shared/validation/user';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Profile API - Auth check:', { 
      userId: user?.id, 
      userEmail: user?.email, 
      authError: authError?.message 
    });

    if (authError || !user) {
      console.log('Profile API - Unauthorized:', { authError, user: !!user });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from database
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    console.log('Profile API - Database query result:', { 
      userProfile: !!userProfile, 
      userId: user.id 
    });

    if (!userProfile) {
      console.log('Profile API - User not found in database for ID:', user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Profile API - Returning user profile');
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Profile API - Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    console.log('Profile API - Request body:', body);
    
    // Validate the request body
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Check if username is being updated and if it's unique (case-insensitive)
    if (updateData.username) {
      const normalizedUsername = updateData.username.toLowerCase();
      const [existingUser] = await db
        .select()
        .from(profiles)
        .where(sql`LOWER(${profiles.username}) = ${normalizedUsername}`)
        .limit(1);

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
      
      // Normalize username to lowercase for storage
      updateData.username = normalizedUsername;
    }

    // Update user profile in database
    const updatedUser = await updateUserProfile(user.id, updateData);

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Sync critical fields back to auth.users metadata for quick access
    const metadataUpdates: Record<string, any> = {};
    if (updateData.username) metadataUpdates.username = updateData.username;
    if (updateData.name) metadataUpdates.name = updateData.name;
    if (updateData.avatar !== undefined) metadataUpdates.avatar = updateData.avatar;

    if (Object.keys(metadataUpdates).length > 0) {
      try {
        await supabase.auth.updateUser({
          data: metadataUpdates
        });
      } catch (metadataError) {
        console.error('Failed to sync metadata:', metadataError);
        // Don't fail the request if metadata sync fails
      }
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 