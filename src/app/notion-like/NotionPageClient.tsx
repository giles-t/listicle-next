"use client"

import NotionEditor from "@/src/client/components/NotionEditor"

interface NotionPageClientProps {
  slug: string
  aiToken: string | null
}

export default function NotionPageClient({ slug, aiToken }: NotionPageClientProps) {
  return (
    <NotionEditor 
      className="w-full max-w-4xl mx-auto p-4"
      placeholder={`Start writing in ${slug}...`}
      aiToken={aiToken}
      onUpdate={(content) => {
        console.log(`Content updated for ${slug}:`, content)
        // You could save to localStorage, database, etc.
      }}
    />
  )
}
