import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/shared/utils/url';

/**
 * Site-wide robots.txt.
 *
 * On production, advertises the sitemap and restricts crawl budget from being
 * spent on routes that either 401/redirect for unauthenticated users (auth,
 * dashboard, me, settings, create, onboarding, notifications) or serve no
 * indexable content (API endpoints).
 *
 * On non-production Vercel deployments (preview/staging), returns a
 * `Disallow: /` rule and omits the sitemap directive. Rationale:
 *
 * Vercel's Deployment Protection gates preview aliases (e.g.
 * `listicle-next.vercel.app`) behind SSO, and its bypass allowlist is
 * hardcoded to `/robots.txt` only. Empirical testing on the latest
 * staging deployment (`dpl_917RnyxTJWSwN68SkxLagwsd6cFa`, HEAD `f2ff0c8`,
 * the commit that claimed to fix this) confirmed the allowlist is
 * path-based, not build-output-based:
 *
 *     GET https://listicle-next.vercel.app/robots.txt      -> 200
 *     GET https://listicle-next.vercel.app/sitemap.xml     -> 401
 *     GET https://listicle-next.vercel.app/favicon.ico     -> 401
 *     GET https://listicle-next.vercel.app/                -> 401
 *
 * The prior commit chain (da1c6b8 → fa4ba2e → f2ff0c8) tried to equalise
 * `sitemap.xml` with `robots.txt` by migrating the Route Handler at
 * `src/app/sitemap.xml/route.ts` to the file-based `MetadataRoute.Sitemap`
 * convention at `src/app/sitemap.ts`, on the theory that Vercel's edge
 * served the MetadataRoute output from prerender cache ahead of the
 * protection layer. That theory is contradicted by `/favicon.ico` (a pure
 * static asset that is *also* gated) and by `/sitemap.xml` still returning
 * 401 post-fix. Vercel's bypass allowlist is a literal `/robots.txt` check;
 * no code-shape change inside the Next.js app can make `/sitemap.xml`
 * bypass it.
 *
 * Net effect before this fix: crawlers fetch a 200 `/robots.txt` containing
 * `Sitemap: https://listicle-next.vercel.app/sitemap.xml`, follow it,
 * receive an HTML auth page at HTTP 401, and log the sitemap as
 * unreachable. Google Search Console's sitemap report then records a
 * permanent "Couldn't fetch" error against the property, harming domain
 * trust even after a real production deployment exists.
 *
 * Fix: treat staging exactly as it is at serve time — publicly
 * unreachable — and stop advertising a sitemap that always 401s. The full
 * rules (and sitemap advertisement) come back automatically on the
 * production deployment where `VERCEL_ENV === 'production'`. Local `npm
 * run dev` has `VERCEL_ENV` unset and falls through to the production
 * branch too, so developer-facing behaviour is unchanged.
 */
export default function robots(): MetadataRoute.Robots {
  const isNonProductionVercelDeploy =
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'development';

  if (isNonProductionVercelDeploy) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

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
