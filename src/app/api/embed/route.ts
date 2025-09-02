import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const IFRAMELY_API_KEY = process.env.IFRAMELY_API_KEY
    
    if (!IFRAMELY_API_KEY) {
      const error = new Error('Iframely API key not configured')
      Sentry.captureException(error, {
        tags: {
          feature: 'embed',
          error_type: 'configuration'
        },
        extra: {
          url: url
        }
      })
      console.error('Embed API: Iframely API key not configured')
      return NextResponse.json(
        { error: 'Embed service not configured' },
        { status: 500 }
      )
    }

    // Call Iframely API - correct endpoint
    const iframelyUrl = new URL('https://iframe.ly/api/iframely')
    iframelyUrl.searchParams.set('url', url)
    iframelyUrl.searchParams.set('api_key', IFRAMELY_API_KEY)
    iframelyUrl.searchParams.set('iframe', '1')
    iframelyUrl.searchParams.set('omit_script', '1')

    const response = await fetch(iframelyUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    let data
    try {
      data = await response.json()
    } catch (parseError) {
      const error = new Error(`Failed to parse Iframely response: ${response.status}`)
      Sentry.captureException(error, {
        tags: { feature: 'embed', error_type: 'parse_error', status_code: response.status },
        extra: { url: url, iframely_url: iframelyUrl.toString() }
      })
      console.error('Embed API: Failed to parse Iframely response')
      return NextResponse.json(
        { error: 'Invalid response from embed service' },
        { status: 502 }
      )
    }

    // Handle Iframely error responses (they return 200 but include status/error in body)
    if (data.status && data.status !== 200) {
      const iframelyStatus = parseInt(data.status)
      let userMessage = 'Failed to fetch embed data'
      let shouldCache = false

      // Handle specific Iframely error codes based on their documentation
      switch (iframelyStatus) {
        case 404:
          userMessage = 'The URL is no longer available or cannot be found'
          shouldCache = true // Cache 404s as per Iframely docs
          break
        case 410:
          userMessage = 'The URL was previously available but is now gone'
          shouldCache = true // Cache 410s as per Iframely docs
          break
        case 401:
        case 403:
          userMessage = 'The URL is private or access is restricted'
          shouldCache = true // Cache auth errors as per Iframely docs
          break
        case 415:
          userMessage = 'This type of content cannot be embedded'
          shouldCache = true // Cache unsupported media types
          break
        case 418:
          userMessage = 'The URL took too long to respond. Please try again later'
          shouldCache = false // Don't cache timeouts
          break
        case 417:
          // Check if it's a connection issue or other problem
          if (data[':error']) {
            userMessage = 'Could not connect to the URL. Please check if it\'s accessible'
          } else if (data[':status']) {
            userMessage = `The URL returned an error (${data[':status']})`
          } else {
            userMessage = 'The URL could not be processed for embedding'
          }
          shouldCache = true // Cache 417s as per Iframely docs
          break
        default:
          userMessage = data.error || 'Failed to fetch embed data'
          shouldCache = true
      }

      const error = new Error(`Iframely error ${iframelyStatus}: ${data.error}`)
      Sentry.captureException(error, {
        tags: { 
          feature: 'embed', 
          error_type: 'iframely_error', 
          iframely_status: iframelyStatus,
          should_cache: shouldCache 
        },
        extra: { 
          url: url, 
          iframely_response: data, 
          iframely_url: iframelyUrl.toString(),
          connection_error: data[':error'],
          http_status: data[':status']
        }
      })
      
      console.error(`Embed API: Iframely error ${iframelyStatus}:`, data.error)
      
      return NextResponse.json(
        { 
          error: userMessage,
          iframelyStatus: iframelyStatus,
          shouldCache: shouldCache
        },
        { status: iframelyStatus >= 500 ? 502 : 400 }
      )
    }

    // Handle HTTP errors from Iframely API itself (not URL errors)
    if (!response.ok) {
      const error = new Error(`Iframely HTTP error: ${response.status}`)
      Sentry.captureException(error, {
        tags: { feature: 'embed', error_type: 'iframely_http_error', status_code: response.status },
        extra: { url: url, response_data: data, iframely_url: iframelyUrl.toString() }
      })
      console.error('Embed API: Iframely HTTP error:', response.status, data)
      return NextResponse.json(
        { error: 'Embed service temporarily unavailable' },
        { status: 502 }
      )
    }

    // Return the embed data
    return NextResponse.json({
      success: true,
      data: {
        url: data.url,
        title: data.meta?.title || '',
        description: data.meta?.description || '',
        author: data.meta?.author || '',
        site: data.meta?.site || '',
        thumbnail: data.links?.thumbnail?.[0]?.href || '',
        html: data.html || '',
        type: data.type || 'link',
        width: data.links?.player?.[0]?.width || null,
        height: data.links?.player?.[0]?.height || null,
      }
    })
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        feature: 'embed',
        error_type: 'unexpected'
      },
      extra: {
        url: request.url,
        method: request.method
      }
    })
    console.error('Embed API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
