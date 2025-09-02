/**
 * SEO metadata utilities for generating dynamic metadata and Open Graph content
 */

import type { Metadata } from 'next';
import { config } from '../../server/config';

export interface ListMetadata {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  publication?: {
    name: string;
    slug: string;
  };
  publishedAt: string;
  updatedAt: string;
  itemCount: number;
  tags?: string[];
}

export interface UserMetadata {
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  website?: string;
  listsCount: number;
  followersCount?: number;
}

export interface PublicationMetadata {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  listsCount: number;
  membersCount: number;
}

/**
 * Generate metadata for a list page
 * @param list List metadata
 * @returns Next.js Metadata object
 */
export function generateListMetadata(list: ListMetadata): Metadata {
  const title = `${list.title} | Listicle`;
  const description = list.description || `A curated list by ${list.author.name} with ${list.itemCount} items.`;
  const url = `${config.app.url}/@${list.author.username}/${list.id}`;
  const imageUrl = list.coverImage || generateOGImageUrl('list', {
    title: list.title,
    author: list.author.name,
    itemCount: list.itemCount,
  });

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Listicle',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: list.title,
        },
      ],
      type: 'article',
      authors: [list.author.name],
      publishedTime: list.publishedAt,
      modifiedTime: list.updatedAt,
      tags: list.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: `@${list.author.username}`,
    },
    other: {
      'article:author': list.author.name,
      'article:published_time': list.publishedAt,
      'article:modified_time': list.updatedAt,
      'article:section': 'Listicle',
      'article:tag': list.tags?.join(',') || '',
    },
  };
}

/**
 * Generate metadata for a user profile page
 * @param user User metadata
 * @returns Next.js Metadata object
 */
export function generateUserMetadata(user: UserMetadata): Metadata {
  const title = `${user.name} (@${user.username}) | Listicle`;
  const description = user.bio || `Check out ${user.name}'s listicles on Listicle. ${user.listsCount} lists and counting.`;
  const url = `${config.app.url}/@${user.username}`;
  const imageUrl = user.avatar || generateOGImageUrl('profile', {
    name: user.name,
    username: user.username,
    listsCount: user.listsCount,
  });

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Listicle',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${user.name}'s profile`,
        },
      ],
      type: 'profile',
      username: user.username,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: `@${user.username}`,
    },
  };
}

/**
 * Generate metadata for a publication page
 * @param publication Publication metadata
 * @returns Next.js Metadata object
 */
export function generatePublicationMetadata(publication: PublicationMetadata): Metadata {
  const title = `${publication.name} | Listicle`;
  const description = publication.description || `Discover curated listicles from ${publication.name}. ${publication.listsCount} lists from ${publication.membersCount} contributors.`;
  const url = `${config.app.url}/pub/${publication.slug}`;
  const imageUrl = publication.logo || generateOGImageUrl('publication', {
    name: publication.name,
    listsCount: publication.listsCount,
    membersCount: publication.membersCount,
  });

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Listicle',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${publication.name} publication`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Generate default homepage metadata
 * @returns Next.js Metadata object
 */
export function generateHomepageMetadata(): Metadata {
  const title = 'Listicle | Create and Discover Beautiful Lists';
  const description = 'Create engaging listicles, discover curated content, and join a community of creators. Share your knowledge through beautiful, interactive lists.';
  const url = config.app.url;
  const imageUrl = generateOGImageUrl('homepage', {
    title: 'Listicle',
    subtitle: 'Create and Discover Beautiful Lists',
  });

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    keywords: ['listicle', 'lists', 'content creation', 'curation', 'blogging', 'social media'],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Listicle',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Listicle - Create and Discover Beautiful Lists',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@listicleapp',
    },
  };
}

/**
 * Generate Open Graph image URL
 * @param type Type of OG image
 * @param params Parameters for the image
 * @returns OG image URL
 */
export function generateOGImageUrl(
  type: 'list' | 'profile' | 'publication' | 'homepage',
  params: Record<string, any>
): string {
  const baseUrl = `${config.app.url}/api/og`;
  const searchParams = new URLSearchParams({
    type,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ),
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Generate structured data for a list
 * @param list List metadata
 * @returns JSON-LD structured data
 */
export function generateListStructuredData(list: ListMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: list.title,
    description: list.description,
    image: list.coverImage,
    author: {
      '@type': 'Person',
      name: list.author.name,
      url: `${config.app.url}/@${list.author.username}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Listicle',
      url: config.app.url,
    },
    datePublished: list.publishedAt,
    dateModified: list.updatedAt,
    url: `${config.app.url}/@${list.author.username}/${list.id}`,
    mainEntityOfPage: `${config.app.url}/@${list.author.username}/${list.id}`,
    articleSection: 'Listicle',
    keywords: list.tags?.join(', '),
  };
}

/**
 * Generate structured data for a person/user
 * @param user User metadata
 * @returns JSON-LD structured data
 */
export function generatePersonStructuredData(user: UserMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    url: `${config.app.url}/@${user.username}`,
    image: user.avatar,
    description: user.bio,
    sameAs: user.website ? [user.website] : [],
    mainEntityOfPage: `${config.app.url}/@${user.username}`,
  };
}

/**
 * Generate structured data for an organization/publication
 * @param publication Publication metadata
 * @returns JSON-LD structured data
 */
export function generateOrganizationStructuredData(publication: PublicationMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: publication.name,
    url: `${config.app.url}/pub/${publication.slug}`,
    logo: publication.logo,
    description: publication.description,
    sameAs: publication.website ? [publication.website] : [],
    mainEntityOfPage: `${config.app.url}/pub/${publication.slug}`,
  };
}

/**
 * Generate breadcrumb structured data
 * @param items Breadcrumb items
 * @returns JSON-LD structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
} 