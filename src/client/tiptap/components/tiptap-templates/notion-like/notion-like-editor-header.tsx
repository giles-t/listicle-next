"use client"

import { ThemeToggle } from "@/src/client/tiptap/components/tiptap-templates/notion-like/notion-like-editor-theme-toggle"

// --- Tiptap UI ---
import { UndoRedoButton } from "@/src/client/tiptap/components/tiptap-ui/undo-redo-button"

// --- UI Primitives ---
import { Spacer } from "@/src/client/tiptap/components/tiptap-ui-primitive/spacer"
import { Separator } from "@/src/client/tiptap/components/tiptap-ui-primitive/separator"
import { ButtonGroup } from "@/src/client/tiptap/components/tiptap-ui-primitive/button"

// --- Styles ---
import "@/src/client/tiptap/components/tiptap-templates/notion-like/notion-like-editor-header.scss"

export function NotionEditorHeader() {
  return (
    <header className="notion-like-editor-header">
      <Spacer />
      <div className="notion-like-editor-header-actions">
        <ButtonGroup orientation="horizontal">
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ButtonGroup>

        <Separator />

        <ThemeToggle />
      </div>
    </header>
  )
}
