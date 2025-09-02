import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { db } from '@/src/server/db';
import { users } from '@/src/server/db/schema';
import { eq } from 'drizzle-orm';
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
      .from(users)
      .where(eq(users.id, user.id))
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

    // Check if username is being updated and if it's unique
    if (updateData.username) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, updateData.username))
        .limit(1);

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 