import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/src/server/supabase'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to create SSE response
function createSSEResponse() {
  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController<Uint8Array>

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl
    },
  })

  const sendEvent = (data: any, event?: string) => {
    const message = `${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`
    controller.enqueue(encoder.encode(message))
  }

  const close = () => {
    controller.close()
  }

  return { stream, sendEvent, close }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const isStream = url.searchParams.get('stream') === 'true'

  if (isStream) {
    return handleStreamingRequest(request)
  } else {
    return handleRegularRequest(request)
  }
}

async function handleStreamingRequest(request: NextRequest) {
  const { stream, sendEvent, close } = createSSEResponse()

  // Start the async generation process
  generateImageWithStreaming(request, sendEvent, close)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

async function generateImageWithStreaming(
  request: NextRequest,
  sendEvent: (data: any, event?: string) => void,
  close: () => void
) {
  let requestData: any = {}
  
  try {
    // Authenticate the user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      sendEvent({ error: 'Authentication required', status: 401 }, 'error')
      close()
      return
    }

    // Parse request body
    const body = await request.text()
    try {
      requestData = JSON.parse(body)
    } catch (e) {
      sendEvent({ error: 'Invalid JSON in request body', status: 400 }, 'error')
      close()
      return
    }
    
    const { prompt, style, modelName, size } = requestData

    if (!prompt || typeof prompt !== 'string') {
      sendEvent({ error: 'Prompt is required', status: 400 }, 'error')
      close()
      return
    }

    console.log('🎨 Generating AI image with streaming:', { prompt, style, modelName, size, userId: user.id })

    // Send initial status
    sendEvent({ 
      status: 'started', 
      message: 'Starting image generation...',
      prompt,
      estimatedTime: '10-30 seconds'
    }, 'progress')

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

    // Send processing status
    sendEvent({ 
      status: 'processing', 
      message: 'Sending request to OpenAI...',
      progress: 25
    }, 'progress')

    // Use the latest DALL-E 3 model with enhanced parameters
    const response = await openai.images.generate({
      model: 'dall-e-3', // Always use DALL-E 3 for best quality
      prompt: prompt,
      n: 1,
      size: (size || '1024x1024') as '1024x1024' | '1792x1024' | '1024x1792',
      style: styleMap[style] || 'natural',
      quality: 'hd', // Use HD quality for better results
    })

    // Send generation complete status
    sendEvent({ 
      status: 'generating', 
      message: 'Image generation in progress...',
      progress: 75
    }, 'progress')

    const imageUrl = response.data?.[0]?.url
    const revisedPrompt = response.data?.[0]?.revised_prompt

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI')
    }

    console.log('✅ AI image generated successfully:', imageUrl)

    // Send completion status
    sendEvent({ 
      status: 'completed', 
      message: 'Image generated successfully!',
      progress: 100,
      imageUrl,
      revisedPrompt,
      originalPrompt: prompt
    }, 'complete')

    close()

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

    sendEvent({ 
      error: errorMessage, 
      status: statusCode,
      originalPrompt: requestData?.prompt || 'Unknown prompt'
    }, 'error')
    close()
  }
}

async function handleRegularRequest(request: NextRequest) {
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

    // Use the latest DALL-E 3 model with enhanced parameters
    const response = await openai.images.generate({
      model: 'dall-e-3', // Always use DALL-E 3 for best quality
      prompt: prompt,
      n: 1,
      size: (size || '1024x1024') as '1024x1024' | '1792x1024' | '1024x1792',
      style: styleMap[style] || 'natural',
      quality: 'hd', // Use HD quality for better results
    })

    const imageUrl = response.data?.[0]?.url
    const revisedPrompt = response.data?.[0]?.revised_prompt

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI')
    }

    console.log('✅ AI image generated successfully:', imageUrl)

    // Return the image URL and additional metadata
    return NextResponse.json({ 
      imageUrl,
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
