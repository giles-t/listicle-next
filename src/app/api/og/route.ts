/**
 * Dynamic Open Graph image generation
 * This generates dynamic OG images for better social media sharing
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'homepage';
    
    // For now, return a simple response
    // TODO: Integrate with @vercel/og for dynamic image generation
    // This would require installing @vercel/og package
    
    const imageHtml = generateImageHTML(type, searchParams);
    
    return new NextResponse(imageHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}

function generateImageHTML(type: string, searchParams: URLSearchParams): string {
  const title = searchParams.get('title') || 'Listicle';
  const subtitle = searchParams.get('subtitle') || 'Create and Discover Beautiful Lists';
  const author = searchParams.get('author') || '';
  const itemCount = searchParams.get('itemCount') || '';
  
  // This is a placeholder HTML response
  // In production, you would use @vercel/og to generate actual images
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>OG Image Generator</title>
        <style>
          body {
            margin: 0;
            padding: 40px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 1200px;
            height: 630px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .container {
            text-align: center;
            max-width: 1000px;
          }
          .title {
            font-size: 64px;
            font-weight: bold;
            margin-bottom: 20px;
            line-height: 1.1;
          }
          .subtitle {
            font-size: 32px;
            opacity: 0.9;
            margin-bottom: 30px;
          }
          .meta {
            font-size: 24px;
            opacity: 0.8;
          }
          .logo {
            position: absolute;
            top: 40px;
            left: 40px;
            font-size: 32px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="logo">Listicle</div>
        <div class="container">
          <div class="title">${escapeHtml(title)}</div>
          ${subtitle && `<div class="subtitle">${escapeHtml(subtitle)}</div>`}
          ${author && `<div class="meta">by ${escapeHtml(author)}</div>`}
          ${itemCount && `<div class="meta">${itemCount} items</div>`}
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Example of how to integrate with @vercel/og (when the package is installed):
/*
import { ImageResponse } from '@vercel/og';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Listicle';
    const type = searchParams.get('type') || 'homepage';
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            {title}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    return new NextResponse('Error generating image', { status: 500 });
  }
}
*/ 