"use client"

import * as React from "react"
import { Editor } from "@tiptap/react"
// Utility function for class names (inline since cn is not available)
const classNames = (...classes: (string | undefined | false)[]): string => 
  classes.filter(Boolean).join(' ')

// Icons from existing implementation
import { BoldIcon } from "@/src/client/tiptap/components/tiptap-icons/bold-icon"
import { ItalicIcon } from "@/src/client/tiptap/components/tiptap-icons/italic-icon"
import { StrikeIcon } from "@/src/client/tiptap/components/tiptap-icons/strike-icon"
import { Code2Icon } from "@/src/client/tiptap/components/tiptap-icons/code2-icon"
import { LinkIcon } from "@/src/client/tiptap/components/tiptap-icons/link-icon"
import { HighlighterIcon } from "@/src/client/tiptap/components/tiptap-icons/highlighter-icon"
import { AiSparklesIcon } from "@/src/client/tiptap/components/tiptap-icons/ai-sparkles-icon"

export interface FloatingMenuProps {
  editor: Editor
  className?: string
}

export function FloatingMenu({ editor, className }: FloatingMenuProps) {
  const [showLinkInput, setShowLinkInput] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState("")
  
  const isActive = (name: string) => editor.isActive(name)
  
  const toggleMark = (mark: string) => {
    editor.chain().focus().toggleMark(mark).run()
  }
  
  const toggleLink = () => {
    if (isActive('link')) {
      editor.chain().focus().unsetLink().run()
      setShowLinkInput(false)
    } else {
      const { href } = editor.getAttributes('link')
      setLinkUrl(href || '')
      setShowLinkInput(true)
    }
  }
  
  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setShowLinkInput(false)
    setLinkUrl("")
  }
  
  const triggerAI = () => {
    // Use the improve/enhance functionality
    editor.chain().focus().aiGenerate({
      action: 'improve',
    }).run()
  }

  if (showLinkInput) {
      return (
    <div className={classNames(
      "bg-white rounded-lg border border-neutral-200 shadow-lg p-2 flex items-center gap-2",
      className
    )}>
      <input
          type="url"
          placeholder="Enter URL..."
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              setLink()
            } else if (e.key === 'Escape') {
              setShowLinkInput(false)
              setLinkUrl("")
            }
          }}
          className="px-2 py-1 text-sm border border-neutral-200 rounded flex-1 min-w-48 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          autoFocus
        />
        <button
          onClick={setLink}
          className="px-3 py-1 bg-brand-600 text-white text-sm rounded hover:bg-brand-700 transition-colors"
        >
          Set
        </button>
        <button
          onClick={() => {
            setShowLinkInput(false)
            setLinkUrl("")
          }}
          className="px-2 py-1 text-neutral-500 text-sm hover:text-neutral-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }
  
  return (
    <div className={classNames(
      "bg-white rounded-lg border border-neutral-200 shadow-lg p-1 flex items-center gap-1",
      className
    )}>
      {/* AI Enhance Button */}
      <button
        onClick={triggerAI}
        className="p-2 rounded hover:bg-brand-50 text-brand-600 transition-colors"
        title="Improve with AI"
      >
        <AiSparklesIcon className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-neutral-200" />
      
      {/* Text formatting */}
      <button
        onClick={() => toggleMark('bold')}
        className={classNames(
          "p-2 rounded transition-colors",
          isActive('bold') 
            ? "bg-neutral-100 text-neutral-900" 
            : "hover:bg-neutral-50 text-neutral-600"
        )}
        title="Bold"
      >
        <BoldIcon className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => toggleMark('italic')}
        className={classNames(
          "p-2 rounded transition-colors",
          isActive('italic') 
            ? "bg-neutral-100 text-neutral-900" 
            : "hover:bg-neutral-50 text-neutral-600"
        )}
        title="Italic"
      >
        <ItalicIcon className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => toggleMark('strike')}
        className={classNames(
          "p-2 rounded transition-colors",
          isActive('strike') 
            ? "bg-neutral-100 text-neutral-900" 
            : "hover:bg-neutral-50 text-neutral-600"
        )}
        title="Strikethrough"
      >
        <StrikeIcon className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => toggleMark('code')}
        className={classNames(
          "p-2 rounded transition-colors",
          isActive('code') 
            ? "bg-neutral-100 text-neutral-900" 
            : "hover:bg-neutral-50 text-neutral-600"
        )}
        title="Code"
      >
        <Code2Icon className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-neutral-200" />
      
      {/* Link and highlight */}
      <button
        onClick={toggleLink}
        className={classNames(
          "p-2 rounded transition-colors",
          isActive('link') 
            ? "bg-neutral-100 text-neutral-900" 
            : "hover:bg-neutral-50 text-neutral-600"
        )}
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => toggleMark('highlight')}
        className={classNames(
          "p-2 rounded transition-colors",
          isActive('highlight') 
            ? "bg-neutral-100 text-neutral-900" 
            : "hover:bg-neutral-50 text-neutral-600"
        )}
        title="Highlight"
      >
        <HighlighterIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
