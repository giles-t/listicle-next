import jwt from 'jsonwebtoken'
import type { User } from '@supabase/supabase-js'

/**
 * Generates a JWT token for Tiptap AI services
 * @param user - The authenticated user object
 * @returns Promise<string | null> - The JWT token or null if generation fails
 */
export async function generateAiToken(user: User): Promise<string | null> {
  try {
    const TIPTAP_AI_SECRET = process.env.TIPTAP_AI_SECRET
    
    if (!TIPTAP_AI_SECRET) {
      console.warn('TIPTAP_AI_SECRET environment variable not set')
      return null
    }

    // Generate JWT token with user-specific payload
    const payload = {
      sub: user.id // Use actual user ID
    }

    const token = jwt.sign(payload, TIPTAP_AI_SECRET)
    return token
  } catch (error) {
    console.error('Error generating AI token:', error)
    return null
  }
}
