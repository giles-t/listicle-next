import "./globals.css";
import "@/src/client/tiptap/styles/_variables.scss";
import "@/src/client/tiptap/styles/_keyframe-animations.scss";
import type { Metadata } from "next";
import { Toaster } from "@subframe/core";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { ThemeProvider } from "@/client/components/ThemeProvider";

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
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <script async src="//cdn.iframe.ly/embed.js"></script>
      </head>
      <body>
        <ThemeProvider>
          <Toaster richColors />
          <DefaultPageLayout>
            {children}
          </DefaultPageLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
