import "./globals.css";
import "@/src/client/tiptap/styles/_variables.scss";
import "@/src/client/tiptap/styles/_keyframe-animations.scss";
import type { Metadata } from "next";
import { Toaster } from "@subframe/core";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";

export const metadata: Metadata = {
  title: "Subframe Next.js Starter",
  description: "Your starter kit for integrating Subframe into Next.js",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <script async src="//cdn.iframe.ly/embed.js"></script>
      </head>
      <body>
        <Toaster richColors />
        <DefaultPageLayout>
          {children}
        </DefaultPageLayout>
      </body>
    </html>
  );
}
