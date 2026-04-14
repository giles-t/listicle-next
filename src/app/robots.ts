import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/shared/utils/url';

/**
 * Site-wide robots.txt.
 *
 * Complements `/sitemap.xml` by advertising the sitemap location to crawlers
 * (the standard auto-discovery mechanism) and blocking crawl budget from being
 * spent on routes that either 401/redirect for unauthenticated users (auth,
 * dashboard, me, settings, create, onboarding, notifications) or serve no
 * indexable content (API endpoints).
 *
 * The allowed paths intentionally include `/`, `/categories*`, `/profile/*`,
 * `/search`, and `/sitemap.xml` — everything else is either handled by a
 * specific Disallow rule below or falls under the top-level Allow.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/create',
          '/dashboard',
          '/me/',
          '/notifications',
          '/onboarding',
          '/settings/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
