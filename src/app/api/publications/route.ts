import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { db } from '@/src/server/db';
import { publications, publicationMembers } from '@/src/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all publications where the user is a member
    const userPublications = await db
      .select({
        id: publications.id,
        name: publications.name,
        slug: publications.slug,
        description: publications.description,
        logo_url: publications.logo_url,
        website_url: publications.website_url,
        created_at: publications.created_at,
        updated_at: publications.updated_at,
        role: publicationMembers.role,
      })
      .from(publications)
      .innerJoin(publicationMembers, eq(publications.id, publicationMembers.publication_id))
      .where(eq(publicationMembers.user_id, user.id))
      .orderBy(publications.name);

    return NextResponse.json(userPublications);

  } catch (error) {
    console.error('Error fetching publications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
