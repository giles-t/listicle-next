import type { Editor } from "@tiptap/react"

// Editor types and interfaces
export interface MinimalEditorProps {
  content?: string
  placeholder?: string
  onUpdate?: (content: string) => void
  onBlur?: () => void
  aiToken?: string | null
  className?: string
  autoFocus?: boolean
}

export interface EditorContextValue {
  editor: Editor | null
}
