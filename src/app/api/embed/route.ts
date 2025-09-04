import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const IFRAMELY_API_KEY = process.env.IFRAMELY_API_KEY
    if (!IFRAMELY_API_KEY) {
      const error = new Error('Iframely API key not configured')
      Sentry.captureException(error, {
        tags: { feature: 'embed', error_type: 'configuration' },
        extra: { url },
      })
      return NextResponse.json({ error: 'Embed service not configured' }, { status: 500 })
    }

    const iframelyUrl = new URL('https://iframe.ly/api/iframely')
    iframelyUrl.searchParams.set('url', url)
    iframelyUrl.searchParams.set('api_key', IFRAMELY_API_KEY)
    iframelyUrl.searchParams.set('iframe', '1')
    iframelyUrl.searchParams.set('omit_script', '1') // React compatibility  [oai_citation:11‡Iframely](https://iframely.com/docs/omit-script?utm_source=chatgpt.com)

    const response = await fetch(iframelyUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    let data: any
    try {
      data = await response.json()
    } catch {
      const error = new Error(`Failed to parse Iframely response: ${response.status}`)
      Sentry.captureException(error, {
        tags: { feature: 'embed', error_type: 'parse_error', status_code: response.status },
        extra: { url, iframely_url: iframelyUrl.toString() },
      })
      return NextResponse.json({ error: 'Invalid response from embed service' }, { status: 502 })
    }

    // Iframely may return 200 with error payload; handle it explicitly
    if (data.status && data.status !== 200) {
      const status = parseInt(data.status)
      let userMessage = data.error || 'Failed to fetch embed data'
      let shouldCache = true

      switch (status) {
        case 404:
          userMessage = 'The URL is no longer available or cannot be found'
          break
        case 410:
          userMessage = 'The URL was previously available but is now gone'
          break
        case 401:
        case 403:
          userMessage = 'The URL is private or access is restricted'
          break
        case 415:
          userMessage = 'This type of content cannot be embedded'
          break
        case 418:
          userMessage = 'The URL took too long to respond. Please try again later'
          shouldCache = false
          break
        case 417:
          if (data[':error']) {
            userMessage = 'Could not connect to the URL. Please check if it’s accessible'
          } else if (data[':status']) {
            userMessage = `The URL returned an error (${data[':status']})`
          } else {
            userMessage = 'The URL could not be processed for embedding'
          }
          break
        default:
          // keep defaults
          break
      }

      Sentry.captureException(new Error(`Iframely error ${status}: ${data.error}`), {
        tags: { feature: 'embed', error_type: 'iframely_error', iframely_status: status, should_cache: shouldCache },
        extra: {
          url,
          iframely_response: data,
          iframely_url: iframelyUrl.toString(),
          connection_error: data[':error'],
          http_status: data[':status'],
        },
      })

      return NextResponse.json(
        { error: userMessage, iframelyStatus: status, shouldCache },
        { status: status >= 500 ? 502 : 400 },
      )
    }

    if (!response.ok) {
      Sentry.captureException(new Error(`Iframely HTTP error: ${response.status}`), {
        tags: { feature: 'embed', error_type: 'iframely_http_error', status_code: response.status },
        extra: { url, response_data: data, iframely_url: iframelyUrl.toString() },
      })
      return NextResponse.json({ error: 'Embed service temporarily unavailable' }, { status: 502 })
    }

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
        width:
          data.links?.player?.[0]?.width ??
          data.links?.app?.[0]?.width ??
          data.links?.reader?.[0]?.width ??
          null,
        height:
          data.links?.player?.[0]?.height ??
          data.links?.app?.[0]?.height ??
          data.links?.reader?.[0]?.height ??
          null,
      },
    })
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'embed', error_type: 'unexpected' },
      extra: { url: request.url, method: request.method },
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
