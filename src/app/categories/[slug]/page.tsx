import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryListsClient } from './CategoryListsClient';
import { getCategoryBySlug, getListsByCategorySlug, isFollowingCategory } from '@/server/db/queries/categories';
import { createClient } from '@/server/supabase';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  // Call notFound() here so the 404 status propagates before the layout
  // commits. Returning "Category Not Found" metadata without throwing would
  // let Next.js 15.5 render the not-found.tsx UI with a 200 status, which
  // crawlers classify as a soft-404.
  if (!category) {
    notFound();
  }

  const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://listicle.com';
  const baseUrl = raw.startsWith('http') ? raw : `https://${raw}`;

  // Fall back to the generated /api/og PNG so social crawlers always have an
  // image for the preview card — category pages don't have their own cover
  // image, so without this every share produced an imageless preview.
  const ogImage = `/api/og?type=homepage&title=${encodeURIComponent(
    category.name,
  )}&subtitle=${encodeURIComponent(`Curated lists about ${category.name.toLowerCase()}`)}`;

  return {
    title: `${category.name} Lists | Listicle`,
    description: category.description || `Discover curated lists about ${category.name.toLowerCase()} on Listicle.`,
    keywords: [category.name.toLowerCase(), 'listicle', 'curated lists', category.slug],
    openGraph: {
      title: `${category.name} Lists | Listicle`,
      description: category.description || `Discover curated lists about ${category.name.toLowerCase()}.`,
      type: 'website',
      url: `${baseUrl}/categories/${slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${category.name} lists on Listicle`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} Lists | Listicle`,
      description: category.description || `Discover curated lists about ${category.name.toLowerCase()}.`,
      images: [ogImage],
    },
    alternates: {
      canonical: `/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Get current user for follow status
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch category and initial lists
  const [category, initialLists] = await Promise.all([
    getCategoryBySlug(slug),
    getListsByCategorySlug(slug, { sortBy: 'trending', limit: 12 }),
  ]);

  if (!category) {
    notFound();
  }

  // Check if user is following this category
  let isFollowing = false;
  if (user) {
    isFollowing = await isFollowingCategory(user.id, category.id);
  }

  return (
    <CategoryListsClient
      category={{
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        followerCount: category.followerCount,
        listCount: category.listCount,
        isFollowing,
      }}
      initialLists={initialLists}
    />
  );
}
