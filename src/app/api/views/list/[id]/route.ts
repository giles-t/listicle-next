import { NextRequest, NextResponse } from 'next/server';
import { trackListView, getVisitorId, getListViewCount } from '@/src/server/db/queries/views';
import { createClient } from '@/src/server/supabase';
import { headers } from 'next/headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/views/list/[id]
 * Track a view for a list
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: listId } = await params;
    
    if (!listId) {
      return NextResponse.json({ error: 'List ID required' }, { status: 400 });
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
    
    // Track the view (fire and forget - don't wait)
    trackListView(listId, visitorId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/views/list/[id]] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/views/list/[id]
 * Get the view count for a list
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: listId } = await params;
    
    if (!listId) {
      return NextResponse.json({ error: 'List ID required' }, { status: 400 });
    }
    
    const count = await getListViewCount(listId);
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('[GET /api/views/list/[id]] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
