import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/src/server/rate-limit';
import { getReactionsWithProfiles } from '@/src/server/db/queries/reactions';

/**
 * GET /api/lists/[id]/reactions/users
 * Get all reactions for a list/item with user profile details
 * 
 * Query params:
 * - itemId: Optional list item ID (if not provided, returns list-level reactions)
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
    const itemId = searchParams.get('itemId');

    const reactions = await getReactionsWithProfiles(listId, itemId);

    return NextResponse.json({
      reactions,
      total: reactions.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}
