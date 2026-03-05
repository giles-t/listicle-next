import "./globals.css";
import "@/src/client/tiptap/styles/_variables.scss";
import "@/src/client/tiptap/styles/_keyframe-animations.scss";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";

export const metadata: Metadata = {
  title: "Listicle",
  description: "Create and share beautiful list-based articles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <script async src="//cdn.iframe.ly/embed.js"></script>
      </head>
      <body>
        <Toaster richColors position="bottom-right" />
        <DefaultPageLayout>
          {children}
        </DefaultPageLayout>
      </body>
    </html>
  );
}
