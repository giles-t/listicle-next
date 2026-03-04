"use client"

import { useEditor } from "@tiptap/react"

// Tiptap Core Extensions
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { TextAlign } from "@tiptap/extension-text-align"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { AiCustom } from "@/src/client/tiptap/extensions/ai-custom"
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

export interface UseEditorConfigProps {
  content?: string
  placeholder?: string
  onUpdate?: (content: string) => void
  onBlur?: () => void
  aiToken?: string | null
}

export function useEditorConfig({
  content = "",
  placeholder = "Start writing...",
  onUpdate,
  onBlur,
  aiToken
}: UseEditorConfigProps) {
  // Parse content - could be JSON or HTML
  const parseContent = (contentString: string) => {
    if (!contentString) return "";
    
    try {
      // Try to parse as JSON first
      return JSON.parse(contentString);
    } catch {
      // If not JSON, treat as HTML
      return contentString;
    }
  };

  return useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: parseContent(content),
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        // Store content as JSON for better structure and security
        const jsonContent = editor.getJSON()
        onUpdate(JSON.stringify(jsonContent))
      }
    },
    onBlur: () => {
      if (onBlur) onBlur()
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
      AiCustom,
    ],
  })
}
