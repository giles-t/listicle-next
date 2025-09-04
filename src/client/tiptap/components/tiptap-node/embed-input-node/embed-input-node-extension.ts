import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { EmbedInputNodeView } from './embed-input-node-view'

export interface EmbedInputOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embedInput: {
      setEmbedInput: () => ReturnType
    }
  }
}

export const EmbedInputNode = Node.create<EmbedInputOptions>({
  name: 'embedInput',
  group: 'block',
  atom: true,
  draggable: false,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: el => el.getAttribute('data-id'),
        renderHTML: attrs => (attrs.id ? { 'data-id': attrs.id } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-embed-input]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-embed-input': '' }, this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setEmbedInput:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { id: crypto.randomUUID() },
          }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedInputNodeView, {
      // Always reuse the NodeView instance
      update: () => true,
      
      // Don't let editor handle events from inputs/buttons
      // stopEvent: ({ event }: any) => {
      //   const t = event.target as HTMLElement | null
      //   if (!t) return false
      //   if (t.closest('input, textarea, select, button, label, [data-embed-interactive]')) return true
      //   return false
      // },

      ignoreMutation: () => true,
    })
  },
})
