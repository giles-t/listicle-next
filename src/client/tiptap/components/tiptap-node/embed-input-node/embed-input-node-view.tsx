'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Button } from '@/src/ui/components/Button'
import { TextField } from '@/src/ui/components/TextField'
import { Loader } from '@/src/ui/components/Loader'
import { FeatherLink } from '@subframe/core'

export function EmbedInputNodeView({ node, updateAttributes, deleteNode, editor, selected }: NodeViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputUrl, setInputUrl] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const requestedFor = useRef<Set<string>>(new Set())

  const fetchEmbedData = useCallback(async (embedUrl: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const resp = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: embedUrl }),
      })
      const result = await resp.json()
      if (!resp.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to fetch embed data')
      }
      const data = result.data
      
      // Replace this input node with a display node
      const pos = editor.view.posAtDOM(editor.view.dom.querySelector(`[data-id="${node.attrs.id}"]`) || editor.view.dom, 0)
      editor.chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .insertContentAt(pos, {
          type: 'embedDisplay',
          attrs: {
            id: crypto.randomUUID(),
            src: data.url,
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
          },
        })
        .run()
      
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load embed')
      requestedFor.current.delete(embedUrl)
    } finally {
      setIsLoading(false)
    }
  }, [editor, node.attrs.id])

  const handleUrlSubmit = useCallback(() => {
    const trimmed = inputUrl.trim()
    if (!trimmed || isLoading) return
    
    if (!requestedFor.current.has(trimmed)) {
      requestedFor.current.add(trimmed)
      void fetchEmbedData(trimmed)
    }
  }, [inputUrl, isLoading, fetchEmbedData])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleUrlSubmit()
      }
    },
    [handleUrlSubmit],
  )

  const handleTryAgain = useCallback(() => {
    setError(null)
    setInputUrl('')
  }, [])

  // Focus input when created
  useEffect(() => {
    if (inputRef.current && !isLoading && !error) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isLoading, error])

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex w-full max-w-[768px] flex-col items-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
          <span className="text-heading-3 font-heading-3 text-default-font">Loading embed…</span>
          <Loader size="medium" />
        </div>
      )
    }

    if (error) {
      return (
        <div
          className="flex w-full max-w-[768px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6"
          data-embed-interactive
        >
          <span className="text-heading-3 font-heading-3 text-default-font">Failed to load embed</span>
          <span className="text-body font-body text-subtext-color">{error}</span>
          <div className="flex w-full flex-col items-end">
            <Button onClick={handleTryAgain}>Try Again</Button>
          </div>
        </div>
      )
    }

    return (
      <div
        className="flex w-full max-w-[768px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6"
        data-embed-interactive
      >
        <span className="text-heading-3 font-heading-3 text-default-font">Embed URL</span>
        <span className="text-body font-body text-subtext-color">
          Paste a link to embed content from YouTube, X/Twitter, Instagram, etc.
        </span>
        <TextField className="h-auto w-full flex-none" label="" helpText="" icon={<FeatherLink />}>
          <TextField.Input
            ref={inputRef}
            placeholder="https://www.youtube.com/watch?v=..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </TextField>
        <div className="flex w-full flex-col items-end">
          <Button onClick={handleUrlSubmit} disabled={!inputUrl.trim() || isLoading}>
            Embed
          </Button>
        </div>
      </div>
    )
  }

  return (
    <NodeViewWrapper
      className={`embed-input-node-wrapper my-10 ${selected ? 'ProseMirror-selectednode' : ''}`}
      contentEditable={false}
    >
      <div className="embed-input-node-content">
        {renderContent()}
      </div>
    </NodeViewWrapper>
  )
}
