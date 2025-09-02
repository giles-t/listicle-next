"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Button } from '@/src/ui/components/Button'
import { TextField } from '@/src/ui/components/TextField'
import { Loader } from '@/src/ui/components/Loader'
import { FeatherLink } from '@subframe/core'

interface EmbedData {
  url: string
  title: string
  description: string
  author: string
  site: string
  thumbnail: string
  html: string
  type: string
  width: number | null
  height: number | null
}

export function EmbedNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputUrl, setInputUrl] = useState('')

  const contentRef = useRef<HTMLDivElement>(null)
  const hasRenderedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { src, url, title, description, author, site, thumbnail, html, type, width, height } = node.attrs

  // Memoize embed data to prevent unnecessary re-renders
  const embedData = useMemo<EmbedData | null>(() => {
    if (!src) return null
    
    return {
      url: url || src,
      title: title || '',
      description: description || '',
      author: author || '',
      site: site || '',
      thumbnail: thumbnail || '',
      html: html || '',
      type: type || 'link',
      width,
      height,
    }
  }, [src, url, title, description, author, site, thumbnail, html, type, width, height])

  const handleUrlSubmit = useCallback(async () => {
    if (!inputUrl.trim()) return
    
    const trimmedUrl = inputUrl.trim()
    updateAttributes({ src: trimmedUrl })
    
    // The useEffect will trigger fetchEmbedData when src changes
  }, [inputUrl, updateAttributes])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleUrlSubmit()
    }
  }, [handleUrlSubmit])

  const fetchEmbedData = useCallback(async (embedUrl: string) => {
    if (isLoading) return // Prevent multiple simultaneous requests
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: embedUrl }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle specific error cases with better messages
        const errorMessage = result.error || 'Failed to fetch embed data'
        throw new Error(errorMessage)
      }

      if (result.success && result.data) {
        const data = result.data
        
        // Only update attributes once with all data
        updateAttributes({
          url: data.url,
          title: data.title,
          description: data.description,
          author: data.author,
          site: data.site,
          thumbnail: data.thumbnail,
          html: data.html,
          type: data.type,
          width: data.width,
          height: data.height,
        })
      } else {
        throw new Error(result.error || 'Invalid response from embed service')
      }
    } catch (err) {
      console.error('Error fetching embed data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load embed')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, updateAttributes])

  // Only fetch data if we don't have it yet
  useEffect(() => {
    if (src && !embedData?.html && !embedData?.title && !isLoading && !error) {
      fetchEmbedData(src)
    }
  }, [src, embedData?.html, embedData?.title, isLoading, error, fetchEmbedData])

  // Render HTML content only once to prevent flickering
  useEffect(() => {
    if (embedData?.html && contentRef.current && !hasRenderedRef.current) {
      contentRef.current.innerHTML = embedData.html
      hasRenderedRef.current = true
    }
  }, [embedData?.html])

  // Reset rendered flag when src changes
  useEffect(() => {
    hasRenderedRef.current = false
  }, [src])

  // Focus input when component mounts with empty src
  useEffect(() => {
    if ((!src || src === '') && inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const renderEmbed = () => {
    // Show input field if no src is provided
    if (!src || src === '') {
      return (
        <div className="flex w-full max-w-[768px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
          <span className="text-heading-3 font-heading-3 text-default-font">
            Embed URL
          </span>
            <span className="text-body font-body text-subtext-color">
              Paste a link to embed content from YouTube, Twitter, and more
            </span>
            <TextField
              className="h-auto w-full flex-none"
              label=""
              helpText=""
              icon={<FeatherLink />}
            >
              <TextField.Input
                ref={inputRef}
                placeholder="https://www.youtube.com/watch?v=..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </TextField>
            <div className="flex w-full flex-col items-end justify-between mobile:flex-col mobile:flex-nowrap mobile:gap-4">
              <Button
                className="mobile:h-8 mobile:w-full mobile:flex-none"
                onClick={handleUrlSubmit}
                disabled={!inputUrl.trim()}
              >
                Embed
              </Button>
            </div>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="flex w-full max-w-[768px] flex-col items-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
          <span className="text-heading-3 font-heading-3 text-default-font">
            Loading embed...
          </span>
          <Loader size="medium" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex w-full max-w-[768px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
          <span className="text-heading-3 font-heading-3 text-default-font">
            Failed to load embed
          </span>
          <span className="text-body font-body text-subtext-color">
            {error}
          </span>
          <div className="flex w-full flex-col items-end justify-between mobile:flex-col mobile:flex-nowrap mobile:gap-4">
            <Button
              className="mobile:h-8 mobile:w-full mobile:flex-none"
              onClick={() => fetchEmbedData(src)}
            >
              Retry
            </Button>
          </div>
        </div>
      )
    }

    if (!embedData) {
      return (
        <div className="flex w-full max-w-[768px] flex-col items-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
          <span className="text-heading-3 font-heading-3 text-default-font">
            No embed data available
          </span>
        </div>
      )
    }

    // If we have HTML content, render it in a stable container
    if (embedData.html) {
      return (
        <div 
          ref={contentRef}
          className="embed-html-container"
          style={{
            width: embedData.width ? `${embedData.width}px` : '100%',
            height: embedData.height ? `${embedData.height}px` : 'auto',
            overflow: 'hidden',
            borderRadius: '8px',
          }}
        />
      )
    }

    // Otherwise, render a link card
    return (
      <div className="embed-card">
        {embedData.thumbnail && (
          <div className="embed-thumbnail">
            <img src={embedData.thumbnail} alt={embedData.title} />
          </div>
        )}
        <div className="embed-content">
          <h3 className="embed-title">
            <a href={embedData.url} target="_blank" rel="noopener noreferrer">
              {embedData.title || embedData.url}
            </a>
          </h3>
          {embedData.description && (
            <p className="embed-description">{embedData.description}</p>
          )}
          <div className="embed-meta">
            {embedData.author && <span className="embed-author">{embedData.author}</span>}
            {embedData.site && <span className="embed-site">{embedData.site}</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <NodeViewWrapper 
      className={`embed-node-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle
    >
      <div className="embed-node-content" data-embed-type={embedData?.type || 'link'}>
        {renderEmbed()}
      </div>
    </NodeViewWrapper>
  )
}
