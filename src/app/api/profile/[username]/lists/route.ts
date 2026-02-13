import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername, getUserLists, SortOption } from "@/server/db/queries/profiles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "10", 10);
    const sort = (searchParams.get("sort") || "recent") as SortOption;

    // Validate sort option
    if (!["recent", "popular", "oldest"].includes(sort)) {
      return NextResponse.json(
        { error: "Invalid sort option" },
        { status: 400 }
      );
    }

    // Get user first
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get paginated lists
    const result = await getUserLists(user.id, { page, perPage, sort });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user lists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
