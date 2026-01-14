import { NextRequest, NextResponse } from 'next/server';
import { syncViewCountsToDatabase } from '@/src/server/db/queries/views';

/**
 * POST /api/views/sync
 * Cron endpoint to sync Redis view counts to the database
 * Protected by CRON_SECRET environment variable
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has the correct secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // In development, allow without auth
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    console.log('[views/sync] Starting view count sync...');
    
    const result = await syncViewCountsToDatabase();
    
    console.log(`[views/sync] Completed: ${result.listsUpdated} lists, ${result.itemsUpdated} items updated`);
    
    if (result.errors.length > 0) {
      console.warn('[views/sync] Errors:', result.errors);
    }
    
    return NextResponse.json({
      success: true,
      listsUpdated: result.listsUpdated,
      itemsUpdated: result.itemsUpdated,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error('[POST /api/views/sync] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/views/sync
 * Health check for the sync endpoint (useful for Vercel Cron)
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: '/api/views/sync',
    method: 'POST to trigger sync',
  });
}
