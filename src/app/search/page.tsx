import { Suspense } from "react";
import { SearchClient } from "./SearchClient";
import { getAllCategories } from "@/server/db/queries/categories";

export const metadata = {
  title: "Search - Listicle",
  description: "Search for lists, topics, and creators on Listicle",
};

function SearchLoading() {
  return (
    <div className="container max-w-none flex h-full w-full flex-col items-start gap-8 bg-default-background py-8">
      <div className="flex w-full flex-col items-start gap-6">
        {/* Header skeleton */}
        <div className="flex w-full flex-col items-start gap-2">
          <div className="h-10 w-64 animate-pulse rounded bg-neutral-100" />
          <div className="h-5 w-96 animate-pulse rounded bg-neutral-100" />
        </div>

        {/* Search bar skeleton */}
        <div className="flex w-full flex-col items-start gap-4">
          <div className="h-12 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-10 w-48 animate-pulse rounded bg-neutral-100" />
        </div>

        {/* Empty state skeleton */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-6 py-12">
          <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-100" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-72 animate-pulse rounded bg-neutral-100" />
            <div className="h-5 w-96 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-44 animate-pulse rounded bg-neutral-100" />
            <div className="h-10 w-44 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function SearchPageContent() {
  // Fetch categories for the filter dropdown
  const categories = await getAllCategories({ sortBy: "name" });

  const simplifiedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  return <SearchClient categories={simplifiedCategories} />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}
