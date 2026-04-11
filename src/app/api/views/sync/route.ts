import { NextRequest, NextResponse } from 'next/server';
import { syncViewCountsToDatabase } from '@/src/server/db/queries/views';

/**
 * GET /api/views/sync
 * Cron endpoint to sync Redis view counts to the database.
 * Vercel Crons invoke GET requests, so the sync logic lives here.
 * Protected by CRON_SECRET environment variable.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await syncViewCountsToDatabase();

    return NextResponse.json({
      success: true,
      listsUpdated: result.listsUpdated,
      itemsUpdated: result.itemsUpdated,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
