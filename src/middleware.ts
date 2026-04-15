import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from './server/supabase';

// ────────────────────────────────────────────────────────────────────────────
// Soft-404 fix for dynamic public routes
// ────────────────────────────────────────────────────────────────────────────
// Commit 7c237b0 ("Fix notFound() returning 200 on dynamic profile/list/
// category routes") moved `notFound()` into `generateMetadata`, but runtime
// testing on the current staging deployment (dpl_GeCTsxJ5ThRMzVqFzK13SieUi3Mj,
// HEAD 7c237b0) shows the fix didn't propagate:
//
//   GET /profile/<missing-username>          -> 200 (with NEXT_HTTP_ERROR_FALLBACK;404 in body)
//   GET /profile/<missing-username>/<slug>   -> 200
//   GET /categories/<missing-slug>           -> 200
//   GET /@<missing-username>                 -> 404  (works, via next.config rewrite)
//
// Next.js 15.5's streaming SSR commits the HTTP status to 200 as soon as
// the root layout's shell begins streaming — before the nested dynamic
// segment's `generateMetadata` can throw `notFound()`. The not-found.tsx UI
// renders in the RSC stream but the HTTP status is already committed.
// Search Console treats that as a soft-404: crawl budget wasted and trust
// signal downgraded across the domain.
//
// Fix: do the existence check in middleware, which runs before streaming
// begins, and rewrite missing resources to a non-existent path so Next.js
// responds with its built-in 404 (global app/not-found.tsx + status 404).
// ────────────────────────────────────────────────────────────────────────────

const PROFILE_ROUTE_RE = /^\/profile\/([^/]+?)(?:\/([^/]+?))?\/?$/;
const AT_USERNAME_ROUTE_RE = /^\/@([^/]+?)(?:\/([^/]+?))?\/?$/;
const CATEGORY_ROUTE_RE = /^\/categories\/([^/]+?)\/?$/;

// Internal path middleware rewrites to when a resource doesn't exist.
// It intentionally doesn't match any route under src/app/, so Next.js
// serves app/not-found.tsx with a proper HTTP 404.
const NOT_FOUND_REWRITE_PATH = '/_middleware_404';

function createExistenceClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // Existence check never needs to mutate cookies.
        setAll() {},
      },
    },
  );
}

// Escape LIKE pattern metacharacters so a username containing `_` (allowed
// by the signup regex `/^[a-zA-Z0-9_]+$/`) doesn't act as a single-char
// wildcard and false-positive on neighbouring usernames. `%` and `\` aren't
// reachable through the signup regex but we escape them for defence in
// depth — the existence check is running over a public dynamic route and
// shouldn't trust the pathname shape.
function escapeLikePattern(input: string): string {
  return input.replace(/([\\%_])/g, '\\$1');
}

async function profileAndListExist(
  request: NextRequest,
  username: string,
  listSlug: string | undefined,
): Promise<boolean> {
  const supabase = createExistenceClient(request);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', escapeLikePattern(username))
    .limit(1)
    .maybeSingle();

  // If the existence check itself fails (network, Supabase outage, etc.) we
  // fall through to the page — rendering a soft-404 is a better failure mode
  // than 404'ing every profile load during an incident.
  if (profileError) return true;
  if (!profile) return false;

  if (!listSlug) return true;

  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('user_id', profile.id)
    .eq('slug', listSlug)
    .eq('is_published', true)
    .limit(1)
    .maybeSingle();

  if (listError) return true;
  return !!list;
}

async function categoryExists(
  request: NextRequest,
  slug: string,
): Promise<boolean> {
  const supabase = createExistenceClient(request);

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();

  if (error) return true;
  return !!data;
}

function rewriteToNotFound(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = NOT_FOUND_REWRITE_PATH;
  url.search = '';
  // `NextResponse.rewrite(url)` alone defaults to HTTP 200 — Vercel's edge
  // routing matches the original `/profile/[username]` (or category) function,
  // runs middleware, sees the `x-middleware-rewrite` header, and serves the
  // not-found.tsx body at status 200. That's exactly the soft-404 symptom
  // commit 7c237b0 tried to eliminate. Passing `status: 404` in the response
  // init sets the outer HTTP status explicitly so crawlers see a real 404
  // while the client still receives the rendered app/not-found.tsx UI.
  //
  // `X-Robots-Tag: noindex, nofollow` is set as defence-in-depth alongside
  // the status 404 and the `<meta name="robots" content="noindex">` Next.js
  // emits in the `/_not-found` body. The HTTP header is authoritative for
  // crawlers that check headers before parsing HTML (Bingbot, Slackbot,
  // Twitterbot, Discordbot) and works for RSC/JSON responses where the body
  // meta tag isn't parsed. Matches Google's Search Central recommendation
  // for error pages (https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).
  return NextResponse.rewrite(url, {
    status: 404,
    headers: {
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // `/profile/:username` and `/profile/:username/:slug` (the list page).
  const profileMatch = pathname.match(PROFILE_ROUTE_RE);
  if (profileMatch) {
    const [, rawUsername, rawListSlug] = profileMatch;
    const username = decodeURIComponent(rawUsername);
    const listSlug = rawListSlug ? decodeURIComponent(rawListSlug) : undefined;

    const exists = await profileAndListExist(request, username, listSlug);
    if (!exists) return rewriteToNotFound(request);
    return NextResponse.next();
  }

  // `/@:username` (rewrites to /profile/:username via next.config) and
  // `/@:username/:slug` (list page). Covered for defence-in-depth: the
  // rewrite path *currently* returns 404 correctly on staging, but that
  // behaviour is an artefact of Vercel's routing for rewritten requests,
  // not something we should rely on.
  const atMatch = pathname.match(AT_USERNAME_ROUTE_RE);
  if (atMatch) {
    const [, rawUsername, rawListSlug] = atMatch;
    const username = decodeURIComponent(rawUsername);
    const listSlug = rawListSlug ? decodeURIComponent(rawListSlug) : undefined;

    const exists = await profileAndListExist(request, username, listSlug);
    if (!exists) return rewriteToNotFound(request);
    return NextResponse.next();
  }

  // `/categories/:slug`
  const categoryMatch = pathname.match(CATEGORY_ROUTE_RE);
  if (categoryMatch) {
    const [, rawSlug] = categoryMatch;
    const slug = decodeURIComponent(rawSlug);

    const exists = await categoryExists(request, slug);
    if (!exists) return rewriteToNotFound(request);
    return NextResponse.next();
  }

  // All other matched routes fall through to the existing auth/session
  // refresh logic (unchanged behaviour for /dashboard, /create, /settings,
  // /me, /lists/drafts, /onboarding).
  return await updateSession(request);
}

// Apply the middleware to:
//   1. Protected routes that require authentication (existing behaviour).
//   2. Public dynamic routes where notFound() currently soft-404s.
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard/:path*',
    '/create/:path*',
    '/settings/:path*',
    '/me/:path*',
    '/lists/drafts/:path*',
    // Onboarding route (to handle redirects)
    '/onboarding/:path*',
    // Existence checks for public dynamic routes (fix Next.js 15.5 soft-404).
    // `/@:username` and `/@:username/:slug` are listed explicitly — the
    // path-to-regexp pattern `/@:path*` compiles to require a `/` after `@`
    // and wouldn't match `/@foo` (which is the form users actually hit).
    '/profile/:path*',
    '/@:username',
    '/@:username/:listSlug',
    '/categories/:slug',
  ],
};
