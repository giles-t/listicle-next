"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

import { createPortal } from "react-dom"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"

import { TaskList, TaskItem } from "@tiptap/extension-list"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { Placeholder, Selection } from "@tiptap/extensions"

import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Superscript } from "@tiptap/extension-superscript"
import { Subscript } from "@tiptap/extension-subscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Mathematics } from "@tiptap/extension-mathematics"
import { Ai } from "@tiptap-pro/extension-ai"
import { UniqueID } from "@tiptap/extension-unique-id"
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji"

// --- Hooks ---
import { useUiEditorState } from "@/src/client/tiptap/hooks/use-ui-editor-state"
import { useScrollToHash } from "@/src/client/tiptap/components/tiptap-ui/copy-anchor-link-button/use-scroll-to-hash"

// --- Custom Extensions ---
import { HorizontalRule } from "@/src/client/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { UiState } from "@/src/client/tiptap/components/tiptap-extension/ui-state-extension"
import { Image } from "@/src/client/tiptap/components/tiptap-node/image-node/image-node-extension"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/src/client/tiptap/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { EmbedInputNode } from "@/src/client/tiptap/components/tiptap-node/embed-input-node/embed-input-node-extension"
import { EmbedDisplayNode } from "@/src/client/tiptap/components/tiptap-node/embed-display-node/embed-display-node-extension"
import { AiImageNode } from "@/src/client/tiptap/components/tiptap-node/ai-image-node/ai-image-node-extension"
import "@/src/client/tiptap/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/src/client/tiptap/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/src/client/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/src/client/tiptap/components/tiptap-node/list-node/list-node.scss"
import "@/src/client/tiptap/components/tiptap-node/image-node/image-node.scss"
import "@/src/client/tiptap/components/tiptap-node/ai-image-node/ai-image-node.scss"
import "@/src/client/tiptap/components/tiptap-node/embed-display-node/embed-display-node.scss"
import "@/src/client/tiptap/components/tiptap-node/embed-input-node/embed-input-node.scss"
import "@/src/client/tiptap/components/tiptap-node/heading-node/heading-node.scss"
import "@/src/client/tiptap/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { EmojiDropdownMenu } from "@/src/client/tiptap/components/tiptap-ui/emoji-dropdown-menu"

import { SlashDropdownMenu } from "@/src/client/tiptap/components/tiptap-ui/slash-dropdown-menu"
import { DragContextMenu } from "@/src/client/tiptap/components/tiptap-ui/drag-context-menu"
import { AiMenu } from "@/src/client/tiptap/components/tiptap-ui/ai-menu"

// --- Contexts ---
import { AppProvider } from "@/src/client/tiptap/contexts/app-context"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/src/client/tiptap/lib/tiptap-utils"
import { TIPTAP_AI_APP_ID } from "@/src/client/tiptap/lib/tiptap-collab-utils"

// --- Styles ---
import "@/src/client/tiptap/components/tiptap-templates/notion-like/notion-like-editor.scss"

// --- Content ---
import { NotionEditorHeader } from "@/src/client/tiptap/components/tiptap-templates/notion-like/notion-like-editor-header"
import { MobileToolbar } from "@/src/client/tiptap/components/tiptap-templates/notion-like/notion-like-editor-mobile-toolbar"
import { NotionToolbarFloating } from "@/src/client/tiptap/components/tiptap-templates/notion-like/notion-like-editor-toolbar-floating"

export interface NotionEditorProps {
  placeholder?: string
  content?: string
  onUpdate?: (content: string) => void
  aiToken?: string | null
}

export interface EditorProviderProps {
  placeholder?: string
  aiToken: string | null | undefined
  content?: string
  onUpdate?: (content: string) => void
}

/**
 * Loading spinner component shown while connecting to the notion server
 */
export function LoadingSpinner({ text = "Connecting..." }: { text?: string }) {
  return (
    <div className="spinner-container">
      <div className="spinner-content">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="spinner-loading-text">{text}</div>
      </div>
    </div>
  )
}

/**
 * EditorContent component that renders the actual editor
 */
export function EditorContentArea() {
  const { editor } = React.useContext(EditorContext)!
  const {
    aiGenerationIsLoading,
    aiGenerationIsSelection,
    aiGenerationHasMessage,
    isDragging,
  } = useUiEditorState(editor)



  // Selection based effect to handle AI generation acceptance
  React.useEffect(() => {
    if (!editor) return

    if (
      !aiGenerationIsLoading &&
      aiGenerationIsSelection &&
      aiGenerationHasMessage
    ) {
      editor.chain().focus().aiAccept().run()
      editor.commands.resetUiState()
    }
  }, [
    aiGenerationHasMessage,
    aiGenerationIsLoading,
    aiGenerationIsSelection,
    editor,
  ])

  useScrollToHash()



  if (!editor) {
    return null
  }

  return (
    <EditorContent
      editor={editor}
      role="presentation"
      className="notion-like-editor-content"
      style={{
        cursor: isDragging ? "grabbing" : "auto",
      }}
    >
      <DragContextMenu />
      <AiMenu />
      <EmojiDropdownMenu />

      <SlashDropdownMenu />
      <NotionToolbarFloating />

      {createPortal(<MobileToolbar />, document.body)}
    </EditorContent>
  )
}

/**
 * Component that creates and provides the editor instance
 */
export function EditorProvider(props: EditorProviderProps) {
  const { placeholder = "Start writing...", aiToken, content, onUpdate } = props
  
  // Debug logging
  console.log('EditorProvider aiToken:', aiToken)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: content || "",
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: "notion-like-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        dropcursor: {
          width: 2,
        },
        link: { openOnClick: false },
        heading: {
          levels: [2, 3], // Only allow H2 and H3
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder,
        emptyNodeClass: "is-empty with-slash",
      }),
      Emoji.configure({
        emojis: gitHubEmojis.filter(
          (emoji) => !emoji.name.includes("regional")
        ),
        forceFallbackImages: true,
      }),
      Mathematics,
      Superscript,
      Subscript,
      Color,
      TextStyle,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Selection,
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
          "taskList",
          "heading",
          "blockquote",
          "codeBlock",
          "embedInput",
          "embedDisplay",
          "aiImage",
        ],
      }),
      Typography,
      UiState,
      // Configure Ai extension to use our custom OpenAI route instead of TipTap cloud
      Ai.configure({
        appId: TIPTAP_AI_APP_ID,
        token: aiToken || undefined,
        autocompletion: false,
        showDecorations: true,
        hideDecorationsOnStreamEnd: false,
        // Custom resolver that calls our OpenAI API route
        resolver: async ({ prompt, options }) => {
          try {
            console.log('🤖 Calling custom AI resolver:', { prompt: prompt?.substring(0, 100) + '...', options })
            
            const response = await fetch('/api/ai-text', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt,
                tone: options?.tone,
                format: options?.format || 'rich-text',
                stream: options?.stream || false,
                model: 'gpt-4o-mini',
                maxTokens: 1000,
                temperature: 0.7,
              }),
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
              throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            if (options?.stream) {
              // Handle streaming response - TipTap expects a ReadableStream
              const reader = response.body?.getReader()
              if (!reader) {
                throw new Error('No readable stream available')
              }

              return new ReadableStream({
                start(controller) {
                  function pump(): Promise<void> {
                    return reader.read().then(({ done, value }) => {
                      if (done) {
                        controller.close()
                        return
                      }

                      // Parse the server-sent events format
                      const chunk = new TextDecoder().decode(value)
                      const lines = chunk.split('\n')
                      
                      for (const line of lines) {
                        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                          try {
                            const data = JSON.parse(line.slice(6))
                            if (data.content) {
                              // Encode the content for TipTap
                              controller.enqueue(new TextEncoder().encode(data.content))
                            }
                          } catch (e) {
                            console.warn('Failed to parse streaming chunk:', e)
                          }
                        }
                      }

                      return pump()
                    })
                  }

                  return pump()
                }
              })
            } else {
              // Handle regular response
              const data = await response.json()
              console.log('✅ AI response received:', data.content?.substring(0, 100) + '...')
              return data.content
            }
          } catch (error) {
            console.error('❌ Custom AI resolver error:', error)
            throw error
          }
        },
        onError: (error) => {
          console.error('🔍 DEBUG: AI Error:', error)
        },
      }),
    ],
  })

  if (!editor) {
    return <LoadingSpinner />
  }

  return (
    <div className="notion-like-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <NotionEditorHeader />
        <EditorContentArea />
      </EditorContext.Provider>
    </div>
  )
}

/**
 * Full editor ready to use for local documents
 */
export function NotionEditor({
  placeholder = "Start writing...",
  content,
  onUpdate,
  aiToken,
}: NotionEditorProps) {
  return (
    <AppProvider>
      <NotionEditorContent 
        placeholder={placeholder}
        content={content}
        onUpdate={onUpdate}
        aiToken={aiToken}
      />
    </AppProvider>
  )
}

/**
 * Internal component that handles the editor loading state
 */
export function NotionEditorContent({ 
  placeholder, 
  content, 
  onUpdate,
  aiToken
}: { 
  placeholder?: string
  content?: string
  onUpdate?: (content: string) => void
  aiToken?: string | null
}) {
  return (
    <EditorProvider
      placeholder={placeholder}
      aiToken={aiToken}
      content={content}
      onUpdate={onUpdate}
    />
  )
}
