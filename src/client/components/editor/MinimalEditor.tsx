"use client"

import * as React from "react"
import { EditorContent } from "@tiptap/react"
import { useEditorConfig } from "./hooks/use-editor-config"
import { FloatingMenu } from "./components/FloatingMenu"
import type { MinimalEditorProps } from "./types"

// Import existing Tiptap UI components for slash menu and floating menu
import { SlashDropdownMenu } from "@/src/client/tiptap/components/tiptap-ui/slash-dropdown-menu"
import { FloatingElement } from "@/src/client/tiptap/components/tiptap-ui-utils/floating-element"
import { useFloatingToolbarVisibility } from "@/src/client/tiptap/hooks/use-floating-toolbar-visibility"
import { isSelectionValid } from "@/src/client/tiptap/lib/tiptap-collab-utils"

// Import existing styles that we need
import "./styles.css"
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

export function MinimalEditor({
  content,
  placeholder = "Start writing...",
  onUpdate,
  aiToken,
  className,
  autoFocus = false,
}: MinimalEditorProps) {
  const editor = useEditorConfig({
    content,
    placeholder,
    onUpdate,
    aiToken,
  })

  React.useEffect(() => {
    if (editor && autoFocus) {
      editor.commands.focus()
    }
  }, [editor, autoFocus])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    )
  }

  const { shouldShow } = useFloatingToolbarVisibility({
    editor,
    isSelectionValid,
  })

  return (
    <div className={`relative ${className || ""}`}>
      <EditorContent 
        editor={editor} 
        className={
          `minimal-editor-content prose prose-sm max-w-none text-default-font font-body focus-within:outline-none ` +
          `[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-relaxed ` +
          `[&_.ProseMirror_.is-empty:first-child:before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-empty:first-child:before]:text-neutral-400 ` +
          `[&_.ProseMirror_.is-empty:first-child:before]:float-left [&_.ProseMirror_.is-empty:first-child:before]:h-0 [&_.ProseMirror_.is-empty:first-child:before]:pointer-events-none ` +
          `[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ul,&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_ul,&_.ProseMirror_ol]:my-2 [&_.ProseMirror_li]:my-1 ` +
          `[&_.ProseMirror_h2]:text-heading-2 [&_.ProseMirror_h2]:font-heading-2 [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-3 ` +
          `[&_.ProseMirror_h3]:text-heading-3 [&_.ProseMirror_h3]:font-heading-3 [&_.ProseMirror_h3]:mt-5 [&_.ProseMirror_h3]:mb-2 ` +
          `[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-neutral-200 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:my-4 ` +
          `[&_.ProseMirror_blockquote]:text-neutral-600 [&_.ProseMirror_blockquote]:italic ` +
          `[&_.ProseMirror_code]:bg-neutral-100 [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded ` +
          `[&_.ProseMirror_code]:text-monospace-body [&_.ProseMirror_code]:font-monospace-body ` +
          `[&_.ProseMirror_pre]:bg-neutral-50 [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-neutral-200 [&_.ProseMirror_pre]:rounded-md ` +
          `[&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:text-monospace-body [&_.ProseMirror_pre]:font-monospace-body ` +
          `[&_.ProseMirror_a]:text-brand-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_a:hover]:text-brand-700 ` +
          `[&_.ProseMirror_hr]:border-none [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-neutral-200 [&_.ProseMirror_hr]:my-6`
        }
      />
      
      {/* Slash Command Menu - using existing SlashDropdownMenu */}
      <SlashDropdownMenu />

      {/* Floating Menu for text selection - using existing FloatingElement */}
      <FloatingElement shouldShow={shouldShow}>
        <FloatingMenu editor={editor} />
      </FloatingElement>
    </div>
  )
}
