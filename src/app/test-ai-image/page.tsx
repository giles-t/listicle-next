"use client"

import React, { useState } from 'react'
import { Button } from '@/src/ui/components/Button'
import { TextArea } from '@/src/ui/components/TextArea'
import { Select } from '@/src/ui/components/Select'
import { FeatherSparkles, FeatherImage } from '@subframe/core'

export default function TestAiImagePage() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('photorealistic')
  const [size, setSize] = useState('1024x1024')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setProgress(0)
    setMessage('Starting image generation...')
    setImageUrl(null)
    setError(null)
    setRevisedPrompt(null)

    try {
      const response = await fetch('/api/ai-image?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          size,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader available')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        
        const messages = buffer.split('\n\n')
        buffer = messages.pop() || ''
        
        for (const message of messages) {
          if (message.trim() === '') continue
          
          try {
            const lines = message.trim().split('\n')
            let eventType = ''
            let data = ''
            
            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.substring(7)
              } else if (line.startsWith('data: ')) {
                data = line.substring(6)
              }
            }
            
            if (data) {
              const parsedData = JSON.parse(data)
              console.log(`📡 Streaming ${eventType || 'message'}:`, parsedData)
              
              if (eventType === 'progress') {
                setProgress(parsedData.progress || 0)
                setMessage(parsedData.message || 'Generating...')
              } else if (eventType === 'complete') {
                setIsGenerating(false)
                setImageUrl(parsedData.imageUrl)
                setRevisedPrompt(parsedData.revisedPrompt)
                setProgress(100)
                setMessage('Image generated successfully!')
                break
              } else if (eventType === 'error') {
                setIsGenerating(false)
                setError(parsedData.error || 'Image generation failed')
                setProgress(0)
                setMessage('')
                break
              }
            }
          } catch (parseError) {
            console.error('❌ Error parsing streaming message:', parseError, message)
          }
        }
      }

    } catch (error) {
      console.error('❌ Error with streaming request:', error)
      setIsGenerating(false)
      setError(error instanceof Error ? error.message : 'Image generation failed')
      setProgress(0)
      setMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🎨 AI Image Generation Test
          </h1>
          
          <div className="space-y-6">
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Prompt
              </label>
              <TextArea className="w-full">
                <TextArea.Input
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </TextArea>
            </div>

            {/* Style and Size Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <Select
                  value={style}
                  onValueChange={setStyle}
                  icon={<FeatherImage />}
                >
                  <Select.Item value="photorealistic">Photorealistic</Select.Item>
                  <Select.Item value="digital_art">Digital Art</Select.Item>
                  <Select.Item value="comic_book">Comic Book</Select.Item>
                  <Select.Item value="neon_punk">Neon Punk</Select.Item>
                  <Select.Item value="isometric">Isometric</Select.Item>
                  <Select.Item value="line_art">Line Art</Select.Item>
                  <Select.Item value="3d_model">3D Model</Select.Item>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <Select
                  value={size}
                  onValueChange={setSize}
                >
                  <Select.Item value="1024x1024">Square (1024×1024)</Select.Item>
                  <Select.Item value="1792x1024">Landscape (1792×1024)</Select.Item>
                  <Select.Item value="1024x1792">Portrait (1024×1792)</Select.Item>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateImage}
              disabled={!prompt.trim() || isGenerating}
              icon={<FeatherSparkles />}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>

            {/* Progress */}
            {isGenerating && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-800">{message}</span>
                  <span className="text-sm text-blue-600">{progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium mb-2">Generation Failed</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Generated Image */}
            {imageUrl && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Image</h3>
                
                <div className="mb-4">
                  <img 
                    src={imageUrl} 
                    alt={prompt}
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>

                {revisedPrompt && revisedPrompt !== prompt && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      OpenAI's Enhanced Prompt:
                    </h4>
                    <p className="text-sm text-gray-600 italic bg-blue-50 border border-blue-200 rounded p-3">
                      "{revisedPrompt}"
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Your Original Prompt:
                  </h4>
                  <p className="text-sm text-gray-600 italic">
                    "{prompt}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
