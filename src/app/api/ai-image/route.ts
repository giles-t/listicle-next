import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/src/server/supabase'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const { prompt, style, modelName, size } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('🎨 Generating AI image:', { prompt, style, modelName, size, userId: user.id })

    // Map style to OpenAI style parameter
    const styleMap: Record<string, 'natural' | 'vivid'> = {
      'photorealistic': 'natural',
      'digital_art': 'vivid',
      'comic_book': 'vivid',
      'neon_punk': 'vivid',
      'isometric': 'vivid',
      'line_art': 'natural',
      '3d_model': 'vivid',
    }

    // Generate image with OpenAI
    const response = await openai.images.generate({
      model: modelName || 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: (size || '1024x1024') as '256x256' | '512x512' | '1024x1024',
      style: styleMap[style] || 'natural',
      quality: 'standard',
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI')
    }

    console.log('✅ AI image generated successfully:', imageUrl)

    // Return the image URL
    return NextResponse.json({ imageUrl })

  } catch (error) {
    console.error('❌ AI image generation error:', error)
    
    let errorMessage = 'Image generation failed'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
      
      // Handle specific OpenAI errors
      if (error.message.includes('content_policy_violation')) {
        errorMessage = 'Content violates OpenAI policy'
        statusCode = 400
      } else if (error.message.includes('rate_limit_exceeded')) {
        errorMessage = 'Rate limit exceeded, please try again later'
        statusCode = 429
      } else if (error.message.includes('insufficient_quota')) {
        errorMessage = 'OpenAI quota exceeded'
        statusCode = 402
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
