"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

// UI Components
import { Button } from '@/src/ui/components/Button'
import { Select } from '@/src/ui/components/Select'
import { TextArea } from '@/src/ui/components/TextArea'
import { Loader } from '@/src/ui/components/Loader'

// Icons
import { FeatherImage } from '@subframe/core'
import { FeatherSparkles } from '@subframe/core'
import { FeatherTrash2 } from '@subframe/core'
import { FeatherCheck } from '@subframe/core'
import { FeatherRefreshCw } from '@subframe/core'

interface AiImageData {
  prompt: string
  style: 'photorealistic' | 'digital_art' | 'comic_book' | 'neon_punk' | 'isometric' | 'line_art' | '3d_model'
  modelName: 'dall-e-2' | 'dall-e-3'
  size: '256x256' | '512x512' | '1024x1024'
  isGenerating: boolean
  generatedImageSrc: string | null
  error: string | null
}

const IMAGE_STYLES = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'digital_art', label: 'Digital Art' },
  { value: 'comic_book', label: 'Comic Book' },
  { value: 'neon_punk', label: 'Neon Punk' },
  { value: 'isometric', label: 'Isometric' },
  { value: 'line_art', label: 'Line Art' },
  { value: '3d_model', label: '3D Model' },
] as const

export function AiImageNodeView({ node, updateAttributes, selected, editor, getPos }: NodeViewProps) {
  const [localPrompt, setLocalPrompt] = useState(node.attrs.prompt || '')
  const [isExpanded, setIsExpanded] = useState(!node.attrs.prompt)
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { prompt, style, modelName, size, isGenerating, generatedImageSrc, error } = node.attrs as AiImageData
  
  // Debug logging for initial state
  console.log('🔍 DEBUG: AiImageNodeView rendered with:', {
    'node.attrs.prompt': node.attrs.prompt,
    'localPrompt': localPrompt,
    'prompt (from attrs)': prompt,
    'isExpanded': isExpanded,
    'showPreview': showPreview,
    'editor': editor,
    'getPos': getPos,
    'node.type.name': node.type.name,
  })
  
  // Check if editor has AI capabilities
  console.log('🔍 DEBUG: Editor capabilities:', {
    'editor exists': !!editor,
    'editor.chain exists': !!editor?.chain,
    'aiImagePrompt exists': typeof editor?.chain?.().aiImagePrompt,
    'editor extensions': editor?.extensionManager?.extensions?.map(ext => ext.name),
  })

  // Focus textarea when component mounts with empty prompt
  useEffect(() => {
    if (!prompt && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // No need to monitor AI storage anymore - we handle everything directly

  const handleGenerateImage = useCallback(async () => {
    console.log('🔍 DEBUG: handleGenerateImage called')
    console.log('🔍 DEBUG: localPrompt:', JSON.stringify(localPrompt))
    
    if (!localPrompt.trim()) {
      console.log('❌ DEBUG: No prompt provided, returning early')
      return
    }

    const trimmedPrompt = localPrompt.trim()
    console.log('✅ DEBUG: Using prompt:', JSON.stringify(trimmedPrompt))

    // Update node attributes to show generating state
    updateAttributes({
      prompt: trimmedPrompt,
      isGenerating: true,
      generatedImageSrc: null,
      error: null,
    })

    try {
      console.log('🚀 DEBUG: Calling our AI image API with:', {
        prompt: trimmedPrompt,
        style,
        modelName,
        size,
      })
      
      // Call our own API endpoint directly
      const response = await fetch('/api/ai-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          style,
          modelName,
          size,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const { imageUrl } = await response.json()
      console.log('✅ DEBUG: AI image generated successfully:', imageUrl)

      // Update node with the generated image
      updateAttributes({
        isGenerating: false,
        generatedImageSrc: imageUrl,
        error: null,
      })

      // Show the preview
      setShowPreview(true)
      setIsExpanded(false)
      
    } catch (error) {
      console.error('❌ DEBUG: Error in handleGenerateImage:', error)
      updateAttributes({
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Image generation failed',
      })
    }
  }, [localPrompt, style, modelName, size, updateAttributes, setShowPreview, setIsExpanded])

  const handlePromptChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    console.log('🔍 DEBUG: TextArea onChange:', {
      'previous localPrompt': localPrompt,
      'new value': newValue,
      'event.target.value': event.target.value,
    })
    setLocalPrompt(newValue)
  }, [localPrompt])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    console.log('🔍 DEBUG: KeyDown event:', {
      'key': e.key,
      'metaKey': e.metaKey,
      'ctrlKey': e.ctrlKey,
      'current localPrompt': localPrompt,
    })
    
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      console.log('🚀 DEBUG: Keyboard shortcut triggered generation')
      handleGenerateImage()
    }
  }, [handleGenerateImage, localPrompt])

  const handleStyleChange = useCallback((value: string) => {
    updateAttributes({ style: value })
  }, [updateAttributes])

  const handleDiscard = useCallback(() => {
    updateAttributes({
      prompt: '',
      generatedImageSrc: null,
      isGenerating: false,
      error: null,
    })
    setLocalPrompt('')
    setShowPreview(false)
    setIsExpanded(true)
  }, [updateAttributes])

  const handleInsert = useCallback(() => {
    if (!generatedImageSrc || !getPos) return
    
    console.log('🔍 DEBUG: Inserting image directly')
    
    // Insert the image directly into the editor
    const { view } = editor
    const { tr } = view.state
    const pos = getPos()
    
    if (typeof pos === 'number') {
      // Replace the AI image node with a regular image node
      tr.replaceWith(pos, pos + node.nodeSize, view.state.schema.nodes.image.create({
        src: generatedImageSrc,
        alt: prompt || 'AI generated image',
      }))
      
      view.dispatch(tr)
    }
  }, [generatedImageSrc, prompt, editor, getPos, node])

  const handleRegenerate = useCallback(() => {
    console.log('🔍 DEBUG: Regenerating image')
    
    // Simply call handleGenerateImage again with the current settings
    setShowPreview(false)
    handleGenerateImage()
  }, [handleGenerateImage, setShowPreview])

  const renderPromptInput = () => {
    console.log('🔍 DEBUG: renderPromptInput called')
    return (
    <div className="flex w-full max-w-[768px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
      <span className="text-heading-3 font-heading-3 text-default-font">
        Prompt
      </span>
      <TextArea className="h-auto w-full flex-none" label="" helpText="">
        <TextArea.Input
          ref={textareaRef}
          placeholder="Describe the image that you want me to generate."
          value={localPrompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
        />
      </TextArea>
      <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <Select
          className="mobile:h-auto mobile:w-full mobile:flex-none"
          variant="outline"
          label=""
          placeholder="Image Style"
          helpText=""
          icon={<FeatherImage />}
          value={style}
          onValueChange={handleStyleChange}
        >
          <Select.Item value="photorealistic">Photorealistic</Select.Item>
          <Select.Item value="digital_art">Digital Art</Select.Item>
          <Select.Item value="comic_book">Comic Book</Select.Item>
          <Select.Item value="neon_punk">Neon Punk</Select.Item>
          <Select.Item value="isometric">Isometric</Select.Item>
          <Select.Item value="line_art">Line Art</Select.Item>
          <Select.Item value="3d_model">3D Model</Select.Item>
        </Select>
        <Button
          className="mobile:h-8 mobile:w-full mobile:flex-none"
          icon={<FeatherSparkles />}
          onClick={(event) => {
            console.log('🔍 DEBUG: Generate button clicked - RAW EVENT')
            console.log('🔍 DEBUG: Event:', event)
            console.log('🔍 DEBUG: Button click - localPrompt:', JSON.stringify(localPrompt))
            console.log('🔍 DEBUG: Button click - localPrompt length:', localPrompt.length)
            console.log('🔍 DEBUG: Button click - localPrompt.trim():', JSON.stringify(localPrompt.trim()))
            console.log('🔍 DEBUG: Button click - disabled state:', !localPrompt.trim() || isGenerating)
            console.log('🔍 DEBUG: Button click - isGenerating:', isGenerating)
            console.log('🔍 DEBUG: Button click - editor:', editor)
            console.log('🔍 DEBUG: Button click - editor.chain:', editor?.chain)
            console.log('🔍 DEBUG: Button click - aiImagePrompt available:', typeof editor?.chain?.().aiImagePrompt)
            
            try {
              handleGenerateImage()
            } catch (error) {
              console.error('❌ DEBUG: Error in button click handler:', error)
            }
          }}
          disabled={!localPrompt.trim() || isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </Button>
      </div>
    </div>
  )
  }

  const renderGeneratingState = () => (
    <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-6 px-6 py-6">
      <div className="flex w-full max-w-[768px] flex-col items-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Generating image...
        </span>
        <Loader size="medium" />
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-body font-body text-subtext-color italic">
            "{prompt}"
          </span>
          <span className="text-caption font-caption text-subtext-color">
            This may take 10-30 seconds
          </span>
        </div>
      </div>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex w-full max-w-[768px] flex-col items-start gap-4 rounded-md border border-solid border-red-200 bg-red-50 px-6 py-6 shadow-sm">
      <div className="flex items-center gap-2">
        <FeatherTrash2 className="w-5 h-5 text-red-600" />
        <span className="text-heading-3 font-heading-3 text-red-800">
          Generation Failed
        </span>
      </div>
      <div className="text-sm text-red-700 bg-white rounded-md p-3 border border-red-200 w-full">
        {error}
      </div>
      <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <div className="text-sm text-red-600">
          Original prompt: "{prompt}"
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive-tertiary"
            icon={<FeatherTrash2 />}
            onClick={handleDiscard}
          >
            Discard
          </Button>
          <Button
            variant="brand-primary"
            icon={<FeatherRefreshCw />}
            onClick={handleRegenerate}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )

  const renderInlinePreview = () => (
    <div className="flex w-full max-w-[768px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
      <span className="text-heading-3 font-heading-3 text-default-font">
        Preview
      </span>
      <img
        className="flex-none rounded-md"
        src={generatedImageSrc || ''}
        alt={prompt}
      />
      <span className="text-heading-3 font-heading-3 text-default-font">
        Prompt
      </span>
      <TextArea className="h-auto w-full flex-none" label="" helpText="">
        <TextArea.Input
          placeholder={prompt}
          value={localPrompt}
          onChange={handlePromptChange}
        />
      </TextArea>
      <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <Select
          className="mobile:h-auto mobile:w-full mobile:flex-none"
          label=""
          placeholder="Image Style"
          helpText=""
          icon={<FeatherImage />}
          value={style}
          onValueChange={handleStyleChange}
        >
          <Select.Item value="photorealistic">Photorealistic</Select.Item>
          <Select.Item value="digital_art">Digital Art</Select.Item>
          <Select.Item value="comic_book">Comic Book</Select.Item>
          <Select.Item value="neon_punk">Neon Punk</Select.Item>
          <Select.Item value="isometric">Isometric</Select.Item>
          <Select.Item value="line_art">Line Art</Select.Item>
          <Select.Item value="3d_model">3D Model</Select.Item>
        </Select>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive-tertiary"
            icon={<FeatherTrash2 />}
            onClick={handleDiscard}
          >
            Discard
          </Button>
          <Button
            variant="neutral-tertiary"
            icon={<FeatherCheck />}
            onClick={handleInsert}
          >
            Insert
          </Button>
          <Button
            icon={<FeatherRefreshCw />}
            onClick={handleRegenerate}
          >
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  )

  const renderGeneratedImage = () => (
    <div 
      className="relative bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
      onClick={() => setShowPreview(true)}
    >
      <img 
        src={generatedImageSrc || ''} 
        alt={prompt}
        className="w-full h-auto block rounded-xl"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
        <span className="text-white text-sm italic">"{prompt}"</span>
      </div>
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2">
        <FeatherImage className="w-4 h-4 text-gray-600" />
      </div>
    </div>
  )

  const renderContent = () => {
    if (error) {
      return renderErrorState()
    }
    
    if (generatedImageSrc && showPreview) {
      return renderInlinePreview()
    }
    
    if (generatedImageSrc) {
      return renderGeneratedImage()
    }
    
    if (isGenerating) {
      return renderGeneratingState()
    }
    
    if (!prompt || isExpanded) {
      return renderPromptInput()
    }

    // Show collapsed state with existing prompt
    return (
      <div 
        className="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-3">
          <FeatherSparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="flex-1 text-sm text-gray-900 italic truncate">"{prompt}"</span>
          <span className="text-xs text-gray-400 flex-shrink-0">Click to edit</span>
        </div>
      </div>
    )
  }

  return (
    <NodeViewWrapper 
      className={`ai-image-node-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle
    >
      <div className="ai-image-node-content">
        {renderContent()}
      </div>
    </NodeViewWrapper>
  )
}
