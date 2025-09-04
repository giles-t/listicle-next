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
    const { 
      prompt, 
      model = 'gpt-4o-mini', 
      tone,
      format = 'rich-text',
      stream = false,
      maxTokens = 1000,
      temperature = 0.7 
    } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('🤖 Generating AI text:', { 
      prompt: prompt.substring(0, 100) + '...', 
      model, 
      tone,
      format,
      userId: user.id 
    })

    // Prepare system message based on tone and format
    let systemMessage = 'You are a helpful writing assistant.'
    
    if (tone) {
      const toneInstructions = {
        professional: 'Write in a professional, business-appropriate tone.',
        casual: 'Write in a casual, friendly tone.',
        confident: 'Write with confidence and authority.',
        friendly: 'Write in a warm, friendly manner.',
        formal: 'Write in a formal, academic style.',
        humorous: 'Add appropriate humor while maintaining clarity.',
        optimistic: 'Write with a positive, optimistic outlook.',
        respectful: 'Write with respect and consideration.',
        straightforward: 'Be direct and to the point.',
        encouraging: 'Write in an encouraging, supportive manner.'
      }
      
      if (toneInstructions[tone as keyof typeof toneInstructions]) {
        systemMessage += ` ${toneInstructions[tone as keyof typeof toneInstructions]}`
      }
    }

    if (format === 'rich-text') {
      systemMessage += ' Format your response as rich text that can be used in an HTML editor. Use appropriate HTML tags for structure (headings, paragraphs, lists, etc.) when needed.'
    }

    // Generate text with OpenAI
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      stream: stream,
    })

    if (stream) {
      // Handle streaming response
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response as any) {
              const content = chunk.choices?.[0]?.delta?.content || ''
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        }
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Handle regular response
      const content = response.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content returned from OpenAI')
      }

      console.log('✅ AI text generated successfully')

      return NextResponse.json({ content })
    }

  } catch (error) {
    console.error('❌ AI text generation error:', error)
    
    let errorMessage = 'Text generation failed'
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