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
  modelName: 'gpt-image-1'
  size: '1024x1024' | '1536x1024' | '1024x1536' | 'auto'
  quality?: 'high' | 'medium' | 'low' | 'auto'
  isGenerating: boolean
  generatedImageSrc: string | null // Blob storage URL
  error: string | null
  progress?: number
  generationMessage?: string
  revisedPrompt?: string
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

const IMAGE_SIZES = [
  { value: 'auto', label: 'Auto (Best for content)' },
  { value: '1024x1024', label: 'Square (1024×1024)' },
  { value: '1536x1024', label: 'Landscape (1536×1024)' },
  { value: '1024x1536', label: 'Portrait (1024×1536)' },
] as const

export function AiImageNodeView({ node, updateAttributes, selected, editor, getPos }: NodeViewProps) {
  const [localPrompt, setLocalPrompt] = useState(node.attrs.prompt || '')
  const [isExpanded, setIsExpanded] = useState(!node.attrs.prompt)
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { 
    prompt, 
    modelName, 
    size,
    quality,
    isGenerating, 
    generatedImageSrc, 
    error,
    progress,
    generationMessage,
    revisedPrompt
  } = node.attrs as AiImageData
  
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
      progress: 50,
      generationMessage: 'Generating image with gpt-image-1...',
    })

    try {
      console.log('🚀 DEBUG: Calling AI image API with:', {
        prompt: trimmedPrompt,
        size,
        quality: quality || 'auto',
      })
      
      const response = await fetch('/api/ai-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          size,
          quality: quality || 'auto',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const { imageUrl, revisedPrompt: apiRevisedPrompt } = await response.json()
      console.log('✅ DEBUG: AI image generated successfully')

      // Update node with the blob storage URL
      updateAttributes({
        isGenerating: false,
        generatedImageSrc: imageUrl, // Blob storage URL
        revisedPrompt: apiRevisedPrompt,
        progress: 100,
        generationMessage: 'Image generated successfully!',
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
        progress: 0,
        generationMessage: null,
      })
    }
  }, [localPrompt, size, quality, updateAttributes, setShowPreview, setIsExpanded])

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

  const handleSizeChange = useCallback((value: string) => {
    updateAttributes({ size: value })
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

  const handleInsert = useCallback(async () => {
    if (!generatedImageSrc || !getPos) return
    
    console.log('🔍 DEBUG: Inserting image into editor')
    
    const { view } = editor
    const { tr } = view.state
    const pos = getPos()
    
    if (typeof pos === 'number') {
      // Insert the image (already stored in blob storage)
      tr.replaceWith(pos, pos + node.nodeSize, view.state.schema.nodes.image.create({
        src: generatedImageSrc,
        alt: prompt || 'AI generated image',
      }))
      
      view.dispatch(tr)
      
      console.log('✅ DEBUG: Image inserted into editor')
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
    <div className="flex w-full max-w-[768px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
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
      <div className="flex w-full items-center justify-between gap-4 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <div className="flex gap-4 mobile:w-full mobile:flex-col">
          <Select
            className="mobile:h-auto mobile:w-full mobile:flex-none"
            variant="outline-solid"
            label=""
            placeholder="Image Size"
            helpText=""
            value={size || 'auto'}
            onValueChange={handleSizeChange}
          >
            <Select.Item value="auto">Auto (Best for content)</Select.Item>
            <Select.Item value="1024x1024">Square (1024×1024)</Select.Item>
            <Select.Item value="1536x1024">Landscape (1536×1024)</Select.Item>
            <Select.Item value="1024x1536">Portrait (1024×1536)</Select.Item>
          </Select>
        </div>
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
    <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-6">
      <div className="flex w-full max-w-[768px] flex-col items-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Generating image...
        </span>
        
        {/* Progress bar */}
        {typeof progress === 'number' && progress > 0 && (
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-subtext-color">
                {generationMessage || 'Generating...'}
              </span>
              <span className="text-sm text-subtext-color">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <Loader size="medium" />
        
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-body font-body text-subtext-color italic">
            "{prompt}"
          </span>
          <span className="text-caption font-caption text-subtext-color">
            {generationMessage || 'This may take 10-30 seconds'}
          </span>
        </div>
      </div>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex w-full max-w-[768px] flex-col items-start gap-4 rounded-md border border-solid border-red-200 bg-red-50 px-6 py-6">
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
    <div className="flex w-full max-w-[768px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
      <span className="text-heading-3 font-heading-3 text-default-font">
        Preview
      </span>
      <img
        className="flex-none rounded-md"
        src={generatedImageSrc || ''}
        alt={revisedPrompt || prompt}
      />
      
      {/* Show revised prompt if available */}
      {revisedPrompt && revisedPrompt !== prompt && (
        <div className="w-full">
          <span className="text-heading-3 font-heading-3 text-default-font">
            OpenAI's Enhanced Prompt
          </span>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <span className="text-sm text-blue-800 italic">
              "{revisedPrompt}"
            </span>
          </div>
        </div>
      )}
      
      <span className="text-heading-3 font-heading-3 text-default-font">
        Your Prompt
      </span>
      <TextArea className="h-auto w-full flex-none" label="" helpText="">
        <TextArea.Input
          placeholder={prompt}
          value={localPrompt}
          onChange={handlePromptChange}
        />
      </TextArea>
      <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <div className="flex gap-4 mobile:w-full mobile:flex-col">
          <Select
            className="mobile:h-auto mobile:w-full mobile:flex-none"
            label=""
            placeholder="Image Size"
            helpText=""
            value={size || 'auto'}
            onValueChange={handleSizeChange}
          >
            <Select.Item value="auto">Auto (Best for content)</Select.Item>
            <Select.Item value="1024x1024">Square (1024×1024)</Select.Item>
            <Select.Item value="1536x1024">Landscape (1536×1024)</Select.Item>
            <Select.Item value="1024x1536">Portrait (1024×1536)</Select.Item>
          </Select>
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
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4 rounded-b-xl">
        <span className="text-white text-sm italic">"{prompt}"</span>
      </div>
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs rounded-full p-2">
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
          <FeatherSparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="flex-1 text-sm text-gray-900 italic truncate">"{prompt}"</span>
          <span className="text-xs text-gray-400 shrink-0">Click to edit</span>
        </div>
      </div>
    )
  }

  return (
    <NodeViewWrapper 
      className={`ai-image-node-wrapper my-10 ${selected ? 'ProseMirror-selectednode' : ''}`}
    >
      <div className="ai-image-node-content">
        {renderContent()}
      </div>
    </NodeViewWrapper>
  )
}
