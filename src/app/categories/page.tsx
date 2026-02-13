import { Metadata } from 'next';
import { CategoryBrowseClient, type Category } from './CategoryBrowseClient';
import { getAllCategories } from '@/server/db/queries/categories';
import { createClient } from '@/server/supabase';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Browse Categories | Listicle',
  description: 'Explore all categories on Listicle. Discover curated lists about technology, travel, food, lifestyle, business, health, entertainment, education, sports, fashion and more.',
  keywords: ['categories', 'topics', 'listicle', 'curated lists', 'technology', 'travel', 'food', 'lifestyle', 'business', 'health', 'entertainment', 'education', 'sports', 'fashion'],
  openGraph: {
    title: 'Browse Categories | Listicle',
    description: 'Explore all categories on Listicle. Discover curated lists about technology, travel, food, lifestyle, business, health, entertainment, education, sports, fashion and more.',
    type: 'website',
    url: '/categories',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Categories | Listicle',
    description: 'Explore all categories on Listicle. Discover curated lists across all topics.',
  },
  alternates: {
    canonical: '/categories',
  },
};

// JSON-LD Structured Data for Categories page
function generateJsonLd(categories: { name: string; slug: string; description: string | null }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://listicle.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Categories',
    description: 'Browse all categories and discover curated lists on Listicle',
    url: `${baseUrl}/categories`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categories.length,
      itemListElement: categories.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Thing',
          name: cat.name,
          description: cat.description,
          url: `${baseUrl}/categories/${cat.slug}`,
        },
      })),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Categories',
          item: `${baseUrl}/categories`,
        },
      ],
    },
  };
}

export default async function CategoriesPage() {
  // Get current user for follow status
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all categories server-side (filtering/sorting done client-side)
  let categories: Category[] = [];
  
  try {
    const dbCategories = await getAllCategories({
      sortBy: 'sort_order',
      userId: user?.id,
    });
    
    // Map to the client component's expected type
    categories = dbCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      color: cat.color as Category['color'],
      sort_order: cat.sort_order,
      followerCount: cat.followerCount,
      listCount: cat.listCount,
      isFollowing: cat.isFollowing,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
  }

  const jsonLd = generateJsonLd(categories);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <CategoryBrowseClient categories={categories} />
    </>
  );
}
