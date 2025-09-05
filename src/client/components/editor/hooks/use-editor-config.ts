"use client"

import { useEditor } from "@tiptap/react"

// Tiptap Core Extensions
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { TextAlign } from "@tiptap/extension-text-align"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { Ai } from "@tiptap-pro/extension-ai"
import { UniqueID } from "@tiptap/extension-unique-id"

// Custom nodes from existing implementation - we'll import these
import { HorizontalRule } from "@/src/client/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { Image } from "@/src/client/tiptap/components/tiptap-node/image-node/image-node-extension"
import { ImageUploadNode } from "@/src/client/tiptap/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { EmbedInputNode } from "@/src/client/tiptap/components/tiptap-node/embed-input-node/embed-input-node-extension"
import { EmbedDisplayNode } from "@/src/client/tiptap/components/tiptap-node/embed-display-node/embed-display-node-extension"
import { AiImageNode } from "@/src/client/tiptap/components/tiptap-node/ai-image-node/ai-image-node-extension"
import { UiState } from "@/src/client/tiptap/components/tiptap-extension/ui-state-extension"

// Utils
import { handleImageUpload, MAX_FILE_SIZE } from "@/src/client/tiptap/lib/tiptap-utils"
import { TIPTAP_AI_APP_ID } from "@/src/client/tiptap/lib/tiptap-collab-utils"

export interface UseEditorConfigProps {
  content?: string
  placeholder?: string
  onUpdate?: (content: string) => void
  aiToken?: string | null
}

export function useEditorConfig({
  content = "",
  placeholder = "Start writing...",
  onUpdate,
  aiToken
}: UseEditorConfigProps) {
  return useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: "minimal-list-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        dropcursor: {
          width: 2,
          color: "rgb(37, 99, 235)", // brand-600
        },
        heading: {
          levels: [2, 3], // Only allow H2 and H3 for list items
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ 
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"]
      }),
      Placeholder.configure({
        placeholder,
        emptyNodeClass: "is-empty",
      }),
      Typography,
      Highlight.configure({ 
        multicolor: false, // Keep it simple
        HTMLAttributes: {
          class: 'bg-yellow-100',
        },
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextStyle,
      // Custom nodes
      Image,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      EmbedInputNode,
      EmbedDisplayNode,
      AiImageNode,
      UniqueID.configure({
        types: [
          "paragraph",
          "bulletList",
          "orderedList",
          "heading",
          "blockquote",
          "codeBlock",
          "embedInput",
          "embedDisplay",
          "aiImage",
        ],
      }),
      UiState,
      // AI Configuration
      Ai.configure({
        appId: TIPTAP_AI_APP_ID,
        token: aiToken || undefined,
        autocompletion: false,
        showDecorations: true,
        hideDecorationsOnStreamEnd: false,
        // Custom resolver that calls our OpenAI API route
        aiCompletionResolver: async ({ action, text, textOptions }) => {
          try {
            const response = await fetch('/api/ai-text', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt: text,
                tone: textOptions?.tone,
                format: textOptions?.format || 'rich-text',
                stream: false,
                model: 'gpt-4o-mini',
                maxTokens: 1000,
                temperature: 0.7,
              }),
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
              throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const data = await response.json()
            return data.content
          } catch (error) {
            console.error('❌ Custom AI resolver error:', error)
            throw error
          }
        },
        // Streaming resolver
        aiStreamResolver: async ({ action, text, textOptions }) => {
          try {
            const response = await fetch('/api/ai-text', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt: text,
                tone: textOptions?.tone,
                format: textOptions?.format || 'rich-text',
                stream: true,
                model: 'gpt-4o-mini',
                maxTokens: 1000,
                temperature: 0.7,
              }),
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
              throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            return response.body
          } catch (error) {
            console.error('❌ Custom AI stream resolver error:', error)
            throw error
          }
        },
        onError: (error) => {
          console.error('🔍 AI Error:', error)
        },
      }),
    ],
  })
}
