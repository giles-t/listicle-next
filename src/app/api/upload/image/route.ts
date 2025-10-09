import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { createClient } from '@/src/server/supabase'
import sharp from 'sharp'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Image size configurations
const IMAGE_SIZES = {
  main: { width: 1200, height: 800, quality: 80 },
  thumbnail: { width: 50, height: 50, quality: 40 }
}

interface ProcessedImage {
  buffer: Buffer
  width: number
  height: number
  format: string
}

async function processImage(
  file: File, 
  maxWidth: number, 
  maxHeight: number, 
  quality: number
): Promise<ProcessedImage> {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  // Handle GIFs separately (preserve animation)
  if (file.type === 'image/gif') {
    return {
      buffer,
      width: maxWidth,
      height: maxHeight,
      format: 'gif'
    }
  }
  
  const processed = await sharp(buffer)
    .resize(maxWidth, maxHeight, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .webp({ quality })
    .toBuffer({ resolveWithObject: true })
  
  return {
    buffer: processed.data,
    width: processed.info.width,
    height: processed.info.height,
    format: 'webp'
  }
}

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

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      )
    }

    // Generate base filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const baseName = `editor-images/${user.id}/${timestamp}-${randomSuffix}`

    console.log('📤 Processing and uploading image:', { 
      baseName, 
      fileSize: file.size, 
      fileType: file.type,
      userId: user.id 
    })

    // Process and upload multiple sizes
    const uploadPromises = Object.entries(IMAGE_SIZES).map(async ([sizeName, config]) => {
      const processed = await processImage(file, config.width, config.height, config.quality)
      const fileName = `${baseName}-${sizeName}.${processed.format}`
      
      const blob = await put(fileName, processed.buffer, {
        access: 'public',
      })
      
      return {
        size: sizeName,
        url: blob.url,
        width: processed.width,
        height: processed.height,
        format: processed.format
      }
    })

    const uploadedSizes = await Promise.all(uploadPromises)
    
    // Create sizes object for easy access
    const sizes = uploadedSizes.reduce((acc, upload) => {
      acc[upload.size] = {
        url: upload.url,
        width: upload.width,
        height: upload.height,
        format: upload.format
      }
      return acc
    }, {} as Record<string, any>)

    console.log('✅ All image sizes uploaded successfully')

    return NextResponse.json({
      url: sizes.main.url, // Main image for editor
      thumbnail: sizes.thumbnail.url, // Tiny placeholder
      sizes,
      filename: file.name,
      originalSize: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('❌ Image upload error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload image' 
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
