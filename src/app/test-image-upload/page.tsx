"use client"

import React from 'react'
import { EditorProvider, EditorContentArea } from '@/src/client/tiptap/components/tiptap-templates/notion-like/notion-like-editor'

export default function TestImageUploadPage() {
  const [content, setContent] = React.useState('')

  const handleUpdate = (newContent: string) => {
    setContent(newContent)
    console.log('Editor content updated:', newContent)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Image Upload Test
            </h1>
            <p className="text-gray-600">
              Test the Tiptap image upload functionality with Vercel Blob storage.
              Try dragging and dropping images or clicking to select files.
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden min-h-[400px] p-4">
            <EditorProvider
              content={content}
              onUpdate={handleUpdate}
              placeholder="Start typing here... You can also drag and drop images or use the image upload node!"
              aiToken={null}
            />
          </div>

          {content && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Editor Content (JSON):
              </h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
                {JSON.stringify(JSON.parse(content || '{}'), null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How to test:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Type "/" to open the slash command menu and select "Image Upload"</li>
              <li>• Drag and drop image files directly into the editor</li>
              <li>• Click on the image upload area to select files</li>
              <li>• Supported formats: JPEG, PNG, WebP, GIF (max 5MB)</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">🚀 New Features:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Images automatically compressed and converted to WebP</li>
              <li>• Two sizes: Main image (1200px) + tiny thumbnail (50px)</li>
              <li>• Progressive loading with blurred thumbnail placeholder</li>
              <li>• Fast, smooth loading experience</li>
              <li>• Optimized for performance and user experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
