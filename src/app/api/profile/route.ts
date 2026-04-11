import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { checkRateLimit, RATE_LIMITS } from '@/src/server/rate-limit';
import { updateUserProfile } from '@/src/server/db/queries/profiles';
import { db } from '@/src/server/db';
import { profiles } from '@/src/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { profileUpdateSchema } from '@/shared/validation/user';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limited = await checkRateLimit(request, user.id);
    if (limited) return limited;

    // Get user profile from database
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch {
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

    const limited = await checkRateLimit(request, user.id);
    if (limited) return limited;

    const body = await request.json();

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
    const metadataUpdates: Record<string, string> = {};
    if (updateData.username) metadataUpdates.username = updateData.username;
    if (updateData.name) metadataUpdates.name = updateData.name;
    if (updateData.avatar !== undefined) metadataUpdates.avatar = updateData.avatar;

    if (Object.keys(metadataUpdates).length > 0) {
      try {
        await supabase.auth.updateUser({
          data: metadataUpdates
        });
      } catch {
        // Don't fail the request if metadata sync fails
      }
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 