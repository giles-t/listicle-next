"use client"

import React, { useState } from 'react'
import type { Editor } from '@tiptap/react'

// UI Components
import { Button } from '@/src/ui/components/Button'
import { TextField } from '@/src/ui/components/TextField'
import { Select } from '@/src/ui/components/Select'
import { DialogLayout } from '@/src/ui/layouts/DialogLayout'

interface AiImageGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (options: AiImageOptions) => void
}

export interface AiImageOptions {
  prompt: string
  style: 'photorealistic' | 'digital_art' | 'comic_book' | 'neon_punk' | 'isometric' | 'line_art' | '3d_model'
  modelName: 'dall-e-2' | 'dall-e-3'
  size: '256x256' | '512x512' | '1024x1024'
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

const MODEL_OPTIONS = [
  { value: 'dall-e-3', label: 'DALL-E 3 (Recommended)' },
  { value: 'dall-e-2', label: 'DALL-E 2' },
] as const

const SIZE_OPTIONS = [
  { value: '1024x1024', label: '1024×1024 (Square)' },
  { value: '512x512', label: '512×512 (Small Square)' },
  { value: '256x256', label: '256×256 (Tiny)' },
] as const

export function AiImageGenerationModal({ isOpen, onClose, onGenerate }: AiImageGenerationModalProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<AiImageOptions['style']>('photorealistic')
  const [modelName, setModelName] = useState<AiImageOptions['modelName']>('dall-e-3')
  const [size, setSize] = useState<AiImageOptions['size']>('1024x1024')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      await onGenerate({
        prompt: prompt.trim(),
        style,
        modelName,
        size,
      })
      onClose()
      setPrompt('')
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <DialogLayout open={isOpen} onOpenChange={onClose}>
      <div className="flex h-full w-full flex-col items-start gap-6 bg-default-background px-6 py-12">
        <div className="flex w-full max-w-md flex-col items-start justify-center gap-6 mx-auto">
          <div className="flex flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Generate AI Image
            </span>
            <span className="text-body font-body text-subtext-color">
              Describe the image you want to generate using AI
            </span>
          </div>

          <div className="flex w-full flex-col gap-4">
            <TextField
              className="w-full"
              label="Image Description"
            >
              <TextField.Input
                placeholder="A photorealistic sunset over mountains..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </TextField>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Style"
                placeholder="Select style"
                value={style}
                onValueChange={(value) => setStyle(value as AiImageOptions['style'])}
              >
                {IMAGE_STYLES.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select>

              <Select
                label="Size"
                placeholder="Select size"
                value={size}
                onValueChange={(value) => setSize(value as AiImageOptions['size'])}
              >
                {SIZE_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select>
            </div>

            <Select
              label="Model"
              placeholder="Select model"
              value={modelName}
              onValueChange={(value) => setModelName(value as AiImageOptions['modelName'])}
            >
              {MODEL_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Button
              className="h-10 w-full"
              variant="brand-primary"
              size="large"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
            <Button
              className="h-10 w-full"
              variant="neutral-secondary"
              size="large"
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancel
            </Button>
          </div>

          {isGenerating && (
            <div className="text-center">
              <span className="text-caption font-caption text-subtext-color">
                This may take 10-30 seconds depending on the model...
              </span>
            </div>
          )}
        </div>
      </div>
    </DialogLayout>
  )
}

// Hook to manage the AI image generation modal
export function useAiImageGeneration(editor: Editor | null) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const generateImage = async (options: AiImageOptions) => {
    if (!editor) return

    try {
      // Use the aiImagePrompt command from Tiptap Content AI
      await editor.chain().focus().aiImagePrompt({
        text: options.prompt,
        style: options.style,
        modelName: options.modelName,
        size: options.size,
      } as any).run()
    } catch (error) {
      console.error('Failed to generate image:', error)
      throw error
    }
  }

  return {
    isModalOpen,
    openModal,
    closeModal,
    generateImage,
  }
}
