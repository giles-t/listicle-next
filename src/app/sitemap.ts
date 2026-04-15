import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/shared/utils/url';

/**
 * Site-wide sitemap.xml.
 *
 * Previously implemented as a Route Handler at `src/app/sitemap.xml/route.ts`.
 * Empirical testing against the staging deployment
 * (`dpl_4BjhojZr7gm4pFd5rkQp14MMjefF`, HEAD `4cdc541`) showed:
 *
 *     GET https://listicle-next.vercel.app/robots.txt   -> 200 (x-vercel-cache: PRERENDER)
 *     GET https://listicle-next.vercel.app/sitemap.xml  -> 401 (Vercel SSO auth page)
 *
 * Same deployment, same host — the only difference is how each endpoint was
 * generated. `robots.ts` uses the Next.js file-based `MetadataRoute.Robots`
 * convention, which compiles to a pure static asset that Vercel's edge
 * serves from the prerender cache before the Deployment Protection layer
 * runs. `sitemap.xml/route.ts` was a Route Handler, so even though Next.js
 * marks it as `○ (Static)` in the build output, it's still routed through
 * a Node function endpoint that Deployment Protection intercepts on preview
 * aliases like `listicle-next.vercel.app`.
 *
 * Net effect: `robots.txt` (readable by crawlers) advertises a sitemap URL
 * that returns 401 for the same crawlers — sitemap auto-discovery is broken
 * and no new URLs get indexed on staging. Fix is to migrate to the
 * `MetadataRoute.Sitemap` file convention so `/sitemap.xml` ships as a
 * prerendered static asset, matching how `robots.txt` already works.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];
}
