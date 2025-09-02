/**
 * Dynamic sitemap generation for SEO
 */

import { NextResponse } from 'next/server';

// This would typically fetch from your database
// For now, we'll use placeholder data
interface SitemapUrl {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export async function GET() {
  try {
    const urls = await generateSitemapUrls();
    const sitemap = generateSitemapXML(urls);
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

async function generateSitemapUrls(): Promise<SitemapUrl[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const urls: SitemapUrl[] = [];
  
  // Static pages
  urls.push(
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly',
      priority: 0.8,
    }
  );

  // TODO: Add dynamic content URLs
  // This should fetch from your database
  
  // Example user profiles
  // const users = await fetchPublicUsers();
  // for (const user of users) {
  //   urls.push({
  //     url: `${baseUrl}/@${user.username}`,
  //     lastModified: user.updatedAt,
  //     changeFrequency: 'weekly',
  //     priority: 0.7,
  //   });
  // }

  // Example lists
  // const lists = await fetchPublicLists();
  // for (const list of lists) {
  //   urls.push({
  //     url: `${baseUrl}/@${list.author.username}/${list.slug}`,
  //     lastModified: list.updatedAt,
  //     changeFrequency: 'weekly',
  //     priority: 0.8,
  //   });
  // }

  // Example publications
  // const publications = await fetchPublications();
  // for (const publication of publications) {
  //   urls.push({
  //     url: `${baseUrl}/pub/${publication.slug}`,
  //     lastModified: publication.updatedAt,
  //     changeFrequency: 'weekly',
  //     priority: 0.6,
  //   });
  // }

  return urls;
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlElements = urls
    .map(
      (url) => `
  <url>
    <loc>${escapeXml(url.url)}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
} 