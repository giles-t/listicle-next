import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/src/server/supabase'
import { put } from '@vercel/blob'
import sharp from 'sharp'

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
    const { prompt, size, quality } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('🎨 Generating AI image:', { 
      prompt, 
      size, 
      quality,
      userId: user.id 
    })

    // Build request parameters for gpt-image-1
    const requestParams: any = {
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: (size || 'auto') as '1024x1024' | '1536x1024' | '1024x1536' | 'auto',
      quality: (quality || 'auto') as 'high' | 'medium' | 'low' | 'auto',
    }

    // Use gpt-image-1 model
    const response = await openai.images.generate(requestParams)

    // gpt-image-1 returns base64-encoded images
    const imageB64 = response.data?.[0]?.b64_json
    const revisedPrompt = response.data?.[0]?.revised_prompt

    if (!imageB64) {
      throw new Error('No image data returned from OpenAI')
    }

    console.log('✅ AI image generated successfully (base64)')

    // Immediately upload to blob storage to avoid storing base64 in database
    console.log('📤 Uploading AI-generated image to blob storage...')
    
    const imageBuffer = Buffer.from(imageB64, 'base64')

    // Process image with sharp (optimize and convert to WebP)
    const processedBuffer = await sharp(imageBuffer)
      .resize(2048, 2048, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 90 })
      .toBuffer()

    // Generate unique filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileName = `ai-generated/${user.id}/${timestamp}-${randomSuffix}.webp`

    // Upload to Vercel Blob
    const blob = await put(fileName, processedBuffer, {
      access: 'public',
      contentType: 'image/webp',
    })

    console.log('✅ AI-generated image uploaded to blob storage:', blob.url)

    // Return the blob storage URL instead of data URL
    return NextResponse.json({ 
      imageUrl: blob.url,
      revisedPrompt,
      originalPrompt: prompt
    })

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
