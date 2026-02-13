"use client"

import * as React from "react"
import { Editor } from "@tiptap/react"
// Utility function for class names (inline since cn is not available)
const classNames = (...classes: (string | undefined | false)[]): string => 
  classes.filter(Boolean).join(' ')

// Icons from your existing implementation
import { BoldIcon } from "@/src/client/tiptap/components/tiptap-icons/bold-icon"
import { HeadingTwoIcon } from "@/src/client/tiptap/components/tiptap-icons/heading-two-icon"
import { HeadingThreeIcon } from "@/src/client/tiptap/components/tiptap-icons/heading-three-icon"
import { ListIcon } from "@/src/client/tiptap/components/tiptap-icons/list-icon"
import { ListOrderedIcon } from "@/src/client/tiptap/components/tiptap-icons/list-ordered-icon"
import { BlockquoteIcon } from "@/src/client/tiptap/components/tiptap-icons/blockquote-icon"
import { CodeBlockIcon } from "@/src/client/tiptap/components/tiptap-icons/code-block-icon"
import { MinusIcon } from "@/src/client/tiptap/components/tiptap-icons/minus-icon"
import { ImageIcon } from "@/src/client/tiptap/components/tiptap-icons/image-icon"
import { ExternalLinkIcon } from "@/src/client/tiptap/components/tiptap-icons/external-link-icon"
import { AiSparklesIcon } from "@/src/client/tiptap/components/tiptap-icons/ai-sparkles-icon"

export interface SlashMenuItem {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  command: (editor: Editor) => void
  group: string
}

export const useSlashMenuItems = (editor: Editor | null): SlashMenuItem[] => {
  return React.useMemo(() => {
    if (!editor) return []

    return [
      // Text
      {
        title: "Heading 2",
        description: "Big section heading",
        icon: HeadingTwoIcon,
        command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        group: "Text"
      },
      {
        title: "Heading 3",
        description: "Medium section heading",
        icon: HeadingThreeIcon,
        command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        group: "Text"
      },
      
      // Lists
      {
        title: "Bullet List",
        description: "Create a simple bullet list",
        icon: ListIcon,
        command: (editor) => editor.chain().focus().toggleBulletList().run(),
        group: "Lists"
      },
      {
        title: "Numbered List",
        description: "Create a numbered list",
        icon: ListOrderedIcon,
        command: (editor) => editor.chain().focus().toggleOrderedList().run(),
        group: "Lists"
      },
      
      // Blocks
      {
        title: "Quote",
        description: "Capture a quote",
        icon: BlockquoteIcon,
        command: (editor) => editor.chain().focus().toggleBlockquote().run(),
        group: "Blocks"
      },
      {
        title: "Code Block",
        description: "Create a code block",
        icon: CodeBlockIcon,
        command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
        group: "Blocks"
      },
      {
        title: "Divider",
        description: "Visually divide blocks",
        icon: MinusIcon,
        command: (editor) => editor.chain().focus().setHorizontalRule().run(),
        group: "Blocks"
      },
      
      // Media
      {
        title: "Image",
        description: "Upload an image",
        icon: ImageIcon,
        command: (editor) => editor.chain().focus().insertContent({ type: "imageUpload" }).run(),
        group: "Media"
      },
      {
        title: "Embed",
        description: "Embed a URL",
        icon: ExternalLinkIcon,
        command: (editor) => editor.chain().focus().setEmbedInput().run(),
        group: "Media"
      },
      {
        title: "AI Image",
        description: "Generate an image with AI",
        icon: AiSparklesIcon,
        command: (editor) => editor.chain().focus().setAiImageNode({ prompt: '' }).run(),
        group: "AI"
      },
    ]
  }, [editor])
}

export interface SlashMenuProps {
  items: SlashMenuItem[]
  selectedIndex: number
  onSelect: (item: SlashMenuItem) => void
  className?: string
}

export function SlashMenu({ items, selectedIndex, onSelect, className }: SlashMenuProps) {
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, SlashMenuItem[]> = {}
    items.forEach(item => {
      if (!groups[item.group]) {
        groups[item.group] = []
      }
      groups[item.group].push(item)
    })
    return groups
  }, [items])

  return (
    <div 
      className={classNames(
        "bg-white rounded-lg border border-neutral-200 shadow-lg p-2 max-h-80 overflow-y-auto min-w-64",
        className
      )}
    >
      {Object.entries(groupedItems).map(([group, groupItems], groupIndex) => {
        const startIndex = Object.values(groupedItems)
          .slice(0, groupIndex)
          .reduce((acc, items) => acc + items.length, 0)

        return (
          <div key={group}>
            {groupIndex > 0 && <div className="border-t border-neutral-100 my-2" />}
            <div className="text-xs font-medium text-neutral-500 px-2 py-1 uppercase tracking-wide">
              {group}
            </div>
            {groupItems.map((item, itemIndex) => {
              const globalIndex = startIndex + itemIndex
              const isSelected = globalIndex === selectedIndex
              const Icon = item.icon
              
              return (
                <button
                  key={item.title}
                  className={classNames(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors",
                    isSelected 
                      ? "bg-brand-50 text-brand-700" 
                      : "hover:bg-neutral-50 text-neutral-700"
                  )}
                  onClick={() => onSelect(item)}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {item.title}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {item.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
