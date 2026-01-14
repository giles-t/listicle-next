import { NextRequest, NextResponse } from 'next/server';
import { trackItemViews, getVisitorId, getItemViewCounts } from '@/src/server/db/queries/views';
import { createClient } from '@/src/server/supabase';
import { headers } from 'next/headers';

/**
 * POST /api/views/items
 * Batch track views for multiple list items
 * Body: { listId: string, itemIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listId, itemIds } = body;
    
    if (!listId || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'listId and itemIds array required' }, 
        { status: 400 }
      );
    }
    
    // Limit batch size to prevent abuse
    if (itemIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 items per request' }, 
        { status: 400 }
      );
    }
    
    // Get user ID if authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get client IP from headers
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || null;
    
    // Generate visitor ID
    const visitorId = getVisitorId(user?.id || null, ip);
    
    // Track the views (fire and forget - don't wait)
    trackItemViews(itemIds, visitorId);
    
    return NextResponse.json({ success: true, tracked: itemIds.length });
  } catch (error) {
    console.error('[POST /api/views/items] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/views/items
 * Get view counts for multiple items
 * Query: ?ids=id1,id2,id3
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json({ error: 'ids query parameter required' }, { status: 400 });
    }
    
    const itemIds = idsParam.split(',').filter(Boolean);
    
    if (itemIds.length === 0) {
      return NextResponse.json({ counts: {} });
    }
    
    // Limit batch size
    if (itemIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 items per request' }, 
        { status: 400 }
      );
    }
    
    const counts = await getItemViewCounts(itemIds);
    
    return NextResponse.json({ counts });
  } catch (error) {
    console.error('[GET /api/views/items] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
