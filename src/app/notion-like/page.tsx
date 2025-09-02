import NotionPageClient from './NotionPageClient'
import { generateAiToken } from '@/src/server/ai-token'
import { createClient } from '@/src/server/supabase'

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const actualSlug = slug || "notion"
  
  // Authenticate the user
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Generate AI token if user is authenticated
  let aiToken: string | null = null
  if (user && !authError) {
    aiToken = await generateAiToken(user)
  } else {
    console.warn('User not authenticated, AI features will be disabled')
  }
  
  return (
    <NotionPageClient 
      slug={actualSlug}
      aiToken={aiToken}
    />
  )
}
