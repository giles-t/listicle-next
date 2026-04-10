import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/server/supabase';
import { checkRateLimit, RATE_LIMITS } from '@/src/server/rate-limit';
import { getAllListReactionsAggregate, getUserListReactionsAll } from '@/src/server/db/queries/reactions';

/**
 * GET /api/lists/[id]/reactions/all
 * Get aggregate reaction counts (cached in Redis)
 * Optionally include user reactions on initial load
 * 
 * Query params:
 * - includeUser=true: Include user reactions (only on initial page load)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const limited = await checkRateLimit(request, null);
    if (limited) return limited;

    const { id: listId } = await context.params;
    const { searchParams } = new URL(request.url);
    const includeUser = searchParams.get('includeUser') === 'true';

    // Always get aggregate data (cached in Redis)
    const aggregate = await getAllListReactionsAggregate(listId);

    // Only get user reactions on initial load
    let userReactions = null;
    if (includeUser) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userReactions = await getUserListReactionsAll(listId, user.id);
      }
    }

    return NextResponse.json({
      aggregate,
      userReactions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

