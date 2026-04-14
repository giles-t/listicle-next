/**
 * Dynamic Open Graph image generation.
 *
 * Returns a 1200x630 PNG (the standard OG image size) rendered from JSX via
 * `next/og`'s `ImageResponse`. Used as the fallback `og:image` for list,
 * profile, publication, and homepage metadata when the underlying entity
 * has no custom cover image (see `generateUserMetadata` etc. in
 * `src/shared/utils/metadata.ts`, which is wired up in
 * `src/app/profile/[username]/layout.tsx`).
 *
 * The previous implementation returned `text/html` with inline CSS — social
 * crawlers (Twitter, Discord, Slack, Facebook) expect an actual image at
 * `og:image` URLs, so every preview card for an avatar-less profile showed
 * no image.
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// Edge runtime is required/recommended for ImageResponse.
export const runtime = 'edge';

type OgType = 'list' | 'profile' | 'publication' | 'homepage';

const KNOWN_TYPES: ReadonlySet<OgType> = new Set([
  'list',
  'profile',
  'publication',
  'homepage',
]);

function isOgType(value: string): value is OgType {
  return (KNOWN_TYPES as ReadonlySet<string>).has(value);
}

/**
 * Derive a (title, subtitle, meta) triple for each metadata caller.
 * Keys match the query params set by `generateOGImageUrl` in
 * `src/shared/utils/metadata.ts`.
 */
function extractCopy(type: OgType, params: URLSearchParams): {
  title: string;
  subtitle?: string;
  meta?: string;
} {
  switch (type) {
    case 'list': {
      const title = params.get('title') || 'Untitled list';
      const author = params.get('author');
      const itemCount = params.get('itemCount');
      const metaParts = [
        author ? `by ${author}` : null,
        itemCount ? `${itemCount} items` : null,
      ].filter((p): p is string => Boolean(p));
      return {
        title,
        meta: metaParts.length > 0 ? metaParts.join(' • ') : undefined,
      };
    }
    case 'profile': {
      const name = params.get('name') || params.get('username') || 'Profile';
      const username = params.get('username');
      const listsCount = params.get('listsCount');
      return {
        title: name,
        subtitle: username ? `@${username}` : undefined,
        meta: listsCount ? `${listsCount} lists` : undefined,
      };
    }
    case 'publication': {
      const name = params.get('name') || 'Publication';
      const listsCount = params.get('listsCount');
      const membersCount = params.get('membersCount');
      const metaParts = [
        listsCount ? `${listsCount} lists` : null,
        membersCount ? `${membersCount} contributors` : null,
      ].filter((p): p is string => Boolean(p));
      return {
        title: name,
        meta: metaParts.length > 0 ? metaParts.join(' • ') : undefined,
      };
    }
    case 'homepage':
    default: {
      return {
        title: params.get('title') || 'Listicle',
        subtitle:
          params.get('subtitle') || 'Create and Discover Beautiful Lists',
      };
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawType = searchParams.get('type') || 'homepage';
    const type: OgType = isOgType(rawType) ? rawType : 'homepage';
    const { title, subtitle, meta } = extractCopy(type, searchParams);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            backgroundImage:
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily:
              'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 48,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              opacity: 0.95,
            }}
          >
            Listicle
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: 1040,
            }}
          >
            <div
              style={{
                fontSize: title.length > 60 ? 56 : 72,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 32,
                  opacity: 0.9,
                  lineHeight: 1.3,
                }}
              >
                {subtitle}
              </div>
            ) : null}
            {meta ? (
              <div
                style={{
                  marginTop: 32,
                  fontSize: 26,
                  opacity: 0.8,
                }}
              >
                {meta}
              </div>
            ) : null}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      },
    );
  } catch (error) {
    console.error('[api/og] Failed to generate OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
