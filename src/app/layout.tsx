import "./globals.css";
import "@/src/client/tiptap/styles/_variables.scss";
import "@/src/client/tiptap/styles/_keyframe-animations.scss";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@subframe/core";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { ThemeProvider } from "@/client/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Listicle",
    template: "%s | Listicle",
  },
  description: "Create and share engaging list-based articles. The content platform for listicles.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Listicle",
    title: "Listicle",
    description: "Create and share engaging list-based articles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Listicle",
    description: "Create and share engaging list-based articles.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
      </head>
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
