import React from "react";
import { getTrendingLists } from "@/server/db/queries/lists";
import { getAllCategories } from "@/server/db/queries/categories";
import { FilteredListFeed } from "@/client/components/FilteredListFeed";

export default async function LandingPage() {
  // Fetch trending lists and categories server-side
  const [lists, categoriesWithStats] = await Promise.all([
    getTrendingLists({ limit: 10, sortBy: 'trending' }),
    getAllCategories({ sortBy: 'sort_order' }),
  ]);

  // Transform lists for client component (serialize dates)
  const serializedLists = lists.map((list) => ({
    ...list,
    published_at: list.published_at ? list.published_at.toISOString() : null,
  }));

  // Transform categories for filter component
  const categories = categoriesWithStats.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  return (
    <FilteredListFeed
      initialLists={serializedLists}
      categories={categories}
    />
  );
}
