"use client"

import * as React from "react"
import { Editor } from "@tiptap/react"
import { Extension } from "@tiptap/core"
import { PluginKey } from "@tiptap/pm/state"
import Suggestion from "@tiptap/suggestion"
import { SlashMenu, useSlashMenuItems, type SlashMenuItem } from "./SlashMenu"
import { createRoot } from "react-dom/client"

export const SlashCommand = Extension.create({
  name: 'slash-command',
  
  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: false,
        allowedPrefixes: [' '],
        startOfLine: false,
        decorationTag: 'span',
        decorationClass: 'slash-command',
        pluginKey: new PluginKey('slash-command'),
        command: ({ editor, range, props }: { editor: Editor, range: any, props: SlashMenuItem }) => {
          // Delete the slash and execute command
          editor.chain()
            .deleteRange(range)
            .run()
          
          props.command(editor)
        },
        items: ({ query, editor }: { query: string, editor: Editor }) => {
          const items = getSlashMenuItems(editor)
          
          if (!query) {
            return items
          }
          
          return items.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
          )
        },
        render: () => {
          let component: any
          let popup: HTMLElement
          let root: any
          
          return {
            onStart: (props: any) => {
              component = new SlashCommandList({
                items: props.items,
                command: props.command,
                editor: props.editor,
              })
              
              popup = document.createElement('div')
              popup.className = 'slash-command-popup'
              document.body.appendChild(popup)
              
              root = createRoot(popup)
              root.render(component.render())
            },
            
            onUpdate(props: any) {
              component.updateProps(props)
              root.render(component.render())
            },
            
            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup.remove()
                return true
              }
              
              return component.onKeyDown(props)
            },
            
            onExit() {
              if (popup) {
                popup.remove()
              }
            },
          }
        },
      },
    }
  },
  
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

function getSlashMenuItems(editor: Editor): SlashMenuItem[] {
  return [
    // Text
    {
      title: "Text",
      description: "Start writing with plain text",
      icon: () => <span className="text-sm font-medium">T</span>,
      command: (editor) => editor.chain().focus().setParagraph().run(),
      group: "Basic"
    },
    {
      title: "Heading 2",
      description: "Big section heading",
      icon: () => <span className="text-sm font-bold">H2</span>,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      group: "Basic"
    },
    {
      title: "Heading 3",
      description: "Medium section heading",
      icon: () => <span className="text-sm font-bold">H3</span>,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      group: "Basic"
    },
    
    // Lists
    {
      title: "Bullet List",
      description: "Create a simple bullet list",
      icon: () => <span className="text-sm">•</span>,
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
      group: "Lists"
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      icon: () => <span className="text-sm">1.</span>,
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
      group: "Lists"
    },
    
    // Blocks
    {
      title: "Quote",
      description: "Capture a quote",
      icon: () => <span className="text-sm">"</span>,
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
      group: "Blocks"
    },
    {
      title: "Code Block",
      description: "Create a code block",
      icon: () => <span className="text-sm font-mono">{'{}'}</span>,
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      group: "Blocks"
    },
    {
      title: "Divider",
      description: "Visually divide blocks",
      icon: () => <span className="text-sm">—</span>,
      command: (editor) => editor.chain().focus().setHorizontalRule().run(),
      group: "Blocks"
    },
    
    // Media
    {
      title: "Image",
      description: "Upload an image",
      icon: () => <span className="text-sm">🖼️</span>,
      command: (editor) => editor.chain().focus().insertContent({ type: "imageUpload" }).run(),
      group: "Media"
    },
    {
      title: "Embed",
      description: "Embed a URL",
      icon: () => <span className="text-sm">🔗</span>,
      command: (editor) => editor.chain().focus().setEmbedInput().run(),
      group: "Media"
    },
    {
      title: "AI Image",
      description: "Generate an image with AI",
      icon: () => <span className="text-sm">✨</span>,
      command: (editor) => editor.chain().focus().setAiImageNode({ prompt: '' }).run(),
      group: "AI"
    },
  ]
}

class SlashCommandList {
  items: SlashMenuItem[]
  selectedIndex: number
  command: (item: SlashMenuItem) => void
  editor: Editor

  constructor({ items, command, editor }: { items: SlashMenuItem[], command: (item: SlashMenuItem) => void, editor: Editor }) {
    this.items = items
    this.selectedIndex = 0
    this.command = command
    this.editor = editor
  }

  updateProps({ items }: { items: SlashMenuItem[] }) {
    this.items = items
    this.selectedIndex = 0
  }

  onKeyDown({ event }: { event: KeyboardEvent }) {
    if (event.key === 'ArrowUp') {
      this.upHandler()
      return true
    }

    if (event.key === 'ArrowDown') {
      this.downHandler()
      return true
    }

    if (event.key === 'Enter') {
      this.enterHandler()
      return true
    }

    return false
  }

  upHandler() {
    this.selectedIndex = ((this.selectedIndex - 1) + this.items.length) % this.items.length
  }

  downHandler() {
    this.selectedIndex = (this.selectedIndex + 1) % this.items.length
  }

  enterHandler() {
    this.selectItem(this.selectedIndex)
  }

  selectItem(index: number) {
    const item = this.items[index]
    if (item) {
      this.command(item)
    }
  }

  render() {
    return (
      <SlashMenu
        items={this.items}
        selectedIndex={this.selectedIndex}
        onSelect={(item) => this.command(item)}
        className="fixed z-50"
      />
    )
  }
}
