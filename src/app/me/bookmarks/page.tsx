import { createClient } from "@/src/server/supabase";
import { getUserBookmarks, getUserBookmarksCount } from "@/server/db/queries/bookmarks";
import { getAllCategories } from "@/server/db/queries/categories";
import { getUserCollections } from "@/server/db/queries/collections";
import BookmarksClient, { type BookmarkData, type Category, type Collection } from "./BookmarksClient";

export const metadata = {
  title: "Bookmarks | Listicle",
  description: "Manage and organize your saved listicles and inspiration.",
};

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should redirect, but render nothing as a safeguard
    return null;
  }

  // Fetch bookmarks, categories, and collections in parallel
  const [bookmarks, totalCount, categoriesData, collectionsData] = await Promise.all([
    getUserBookmarks(user.id, { limit: 50 }),
    getUserBookmarksCount(user.id),
    getAllCategories({ sortBy: 'sort_order' }),
    getUserCollections(user.id),
  ]);

  // Transform bookmarks to match client types (dates to strings)
  const bookmarksForClient: BookmarkData[] = bookmarks.map((bookmark) => ({
    ...bookmark,
    created_at: bookmark.created_at.toISOString(),
    list: {
      ...bookmark.list,
      published_at: bookmark.list.published_at?.toISOString() || null,
    },
  }));

  // Extract unique categories from bookmarks and also include all available categories
  const categories: Category[] = categoriesData.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    color: cat.color,
  }));

  // Transform collections for client
  const collections: Collection[] = collectionsData.map((col) => ({
    id: col.id,
    name: col.name,
    bookmarkCount: col.bookmarkCount,
  }));

  return (
    <BookmarksClient
      initialBookmarks={bookmarksForClient}
      initialCategories={categories}
      initialCollections={collections}
      totalCount={totalCount}
    />
  );
}
