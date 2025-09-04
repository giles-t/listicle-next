'use client'

import React, { useEffect, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

// Iframely global
declare global {
  interface Window {
    iframely?: { load: (container?: HTMLElement) => void }
  }
}

export function EmbedDisplayNodeView({ node, selected }: NodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef<string | null>(null)

  const { html } = node.attrs

  // Load embed content only once per unique HTML to prevent reloads
  useEffect(() => {
    const container = containerRef.current
    
    // Only proceed if we have both container and HTML, and haven't loaded this HTML before
    if (!container || !html || loadedRef.current === html) {
      return
    }
    
    // Mark as loaded before setting innerHTML to prevent race conditions
    loadedRef.current = html
    
    // Set the HTML content
    container.innerHTML = html
    
    // Load iframely if available
    if (window.iframely) {
      window.iframely.load(container)
    }
  }, [html])

  return (
    <NodeViewWrapper
      className={`embed-display-node-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      contentEditable={false}
    >
      <div className="embed-display-node-content">
        <div
          ref={containerRef}
          className="embed-html-container"
          style={{ width: '100%', maxWidth: '100%' }}
          data-embed-interactive
        />
      </div>
    </NodeViewWrapper>
  )
}
