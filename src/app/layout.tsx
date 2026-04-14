import "./globals.css";
import "@/src/client/tiptap/styles/_variables.scss";
import "@/src/client/tiptap/styles/_keyframe-animations.scss";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@subframe/core";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { ThemeProvider } from "@/client/components/ThemeProvider";
import { ensureProtocol } from "@/shared/utils/url";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Force dynamic rendering — this app depends on database/auth for all pages
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: "Listicle",
    template: "%s | Listicle",
  },
  description: "Create and share engaging list-based articles. The content platform for listicles.",
  metadataBase: new URL(ensureProtocol(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")),
  openGraph: {
    type: "website",
    siteName: "Listicle",
    title: "Listicle",
    description: "Create and share engaging list-based articles.",
    // Default og:image fallback so pages that inherit this layout's openGraph
    // (the homepage at `/`, `/search`, and any future page that doesn't set
    // its own `openGraph`) produce a real social-preview card. Resolved
    // against `metadataBase` above. Next.js shallow-merges metadata by
    // top-level field, so pages that define their own `openGraph` (the list
    // page, the profile layout, `/categories`, `/categories/[slug]`) replace
    // this object wholesale — those should continue wiring their own
    // `images` entry.
    images: [
      {
        url: "/api/og?type=homepage",
        width: 1200,
        height: 630,
        alt: "Listicle — Create and Discover Beautiful Lists",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Listicle",
    description: "Create and share engaging list-based articles.",
    images: ["/api/og?type=homepage"],
  },
};

// theme-color must come from the `viewport` export — a hand-written <head>
// element in the root layout prevents Next.js 15 from streaming its generated
// metadata tags (og:*, twitter:*, title, description, canonical) into <head>,
// pushing them after </head> where social crawlers never see them.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Toaster richColors />
          <DefaultPageLayout>
            {children}
          </DefaultPageLayout>
        </ThemeProvider>
        <Script src="https://cdn.iframe.ly/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
