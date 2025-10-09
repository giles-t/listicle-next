"use client"

import React, { useState } from 'react'
import Image from 'next/image'

interface ImageSizes {
  main: { url: string; width: number; height: number; format: string }
  thumbnail: { url: string; width: number; height: number; format: string }
}

interface ResponsiveImageProps {
  src: string
  sizes?: ImageSizes
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  fill?: boolean
}

export function ResponsiveImage({
  src,
  sizes,
  alt,
  className,
  width,
  height,
  priority = false,
  fill = false
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // If sizes are available, use progressive loading
  if (sizes) {
    return (
      <div className={`relative ${className || ''}`}>
        {/* Thumbnail placeholder for progressive loading */}
        {!isLoaded && (
          <div
            className="absolute inset-0 bg-gray-100"
            style={{
              backgroundImage: `url(${sizes.thumbnail.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(2px)',
              transform: 'scale(1.05)' // Slightly larger to hide blur edges
            }}
          />
        )}
        
        {/* Main image */}
        <Image
          src={sizes.main.url}
          alt={alt}
          width={fill ? undefined : (width || sizes.main.width)}
          height={fill ? undefined : (height || sizes.main.height)}
          fill={fill}
          priority={priority}
          className={`transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
        
        {/* Error fallback */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Failed to load image</span>
          </div>
        )}
      </div>
    )
  }

  // Fallback to regular image if no sizes available
  return (
    <div className={`relative ${className || ''}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        className="transition-opacity duration-300"
        onError={() => setHasError(true)}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  )
}
