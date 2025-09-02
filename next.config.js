/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages that should be treated as external in server components
  serverExternalPackages: ['drizzle-orm'],

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },

  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'img.youtube.com',
      'pbs.twimg.com',
      'res.cloudinary.com',
      'cdn.example.com', // Replace with your CDN domain
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    // Commented out for development
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  poweredByHeader: false,

  // Security headers - COMMENTED OUT FOR DEVELOPMENT
  /*
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://img.youtube.com https://pbs.twimg.com https://res.cloudinary.com",
              "media-src 'self' blob:",
              "connect-src 'self' https://api.unsplash.com https://*.supabase.co",
              "frame-src 'self' https://www.youtube.com https://platform.twitter.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Other security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache API responses
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=86400',
          },
        ],
      },
    ];
  },
  */

  // Redirects for SEO
  async redirects() {
    return [
      // Redirect old URLs if needed
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  // Rewrites for clean URLs
  async rewrites() {
    return [
      // User profiles: /@username -> /profile/username
      {
        source: '/@:username',
        destination: '/profile/:username',
      },
      // User lists: /@username/list-slug -> /profile/username/list-slug
      {
        source: '/@:username/:slug',
        destination: '/profile/:username/:slug',
      },
      // Publications: /pub/slug -> /publication/slug
      {
        source: '/pub/:slug',
        destination: '/publication/:slug',
      },
      // Publication lists: /pub/slug/list-slug -> /publication/slug/list-slug
      {
        source: '/pub/:slug/:listSlug',
        destination: '/publication/:slug/:listSlug',
      },
    ];
  },

  // Environment variables to expose to the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Output configuration
  output: 'standalone',

  // Trailing slash configuration
  trailingSlash: false,

  // TypeScript configuration
  typescript: {
    // Only run type checking in development
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // ESLint configuration
  eslint: {
    // Only run ESLint in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
