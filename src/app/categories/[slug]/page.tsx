import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryListsClient } from './CategoryListsClient';
import { getCategoryBySlug, getListsByCategorySlug, isFollowingCategory } from '@/server/db/queries/categories';
import { createClient } from '@/server/supabase';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found | Listicle',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://listicle.com';

  return {
    title: `${category.name} Lists | Listicle`,
    description: category.description || `Discover curated lists about ${category.name.toLowerCase()} on Listicle.`,
    keywords: [category.name.toLowerCase(), 'listicle', 'curated lists', category.slug],
    openGraph: {
      title: `${category.name} Lists | Listicle`,
      description: category.description || `Discover curated lists about ${category.name.toLowerCase()}.`,
      type: 'website',
      url: `${baseUrl}/categories/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} Lists | Listicle`,
      description: category.description || `Discover curated lists about ${category.name.toLowerCase()}.`,
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
