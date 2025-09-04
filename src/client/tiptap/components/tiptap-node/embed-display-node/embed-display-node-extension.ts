import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { EmbedDisplayNodeView } from './embed-display-node-view'

export interface EmbedDisplayOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embedDisplay: {
      setEmbedDisplay: (options: { 
        src: string
        html: string
        title?: string
        description?: string
        author?: string
        site?: string
        thumbnail?: string
        type?: string
        width?: number | null
        height?: number | null
      }) => ReturnType
    }
  }
}

export const EmbedDisplayNode = Node.create<EmbedDisplayOptions>({
  name: 'embedDisplay',
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
      src: {
        default: null,
        parseHTML: el => el.getAttribute('data-src'),
        renderHTML: attrs => attrs.src ? { 'data-src': attrs.src } : {},
      },
      url: {
        default: null,
        parseHTML: el => el.getAttribute('data-url'),
        renderHTML: attrs => attrs.url ? { 'data-url': attrs.url } : {},
      },
      title: {
        default: null,
        parseHTML: el => el.getAttribute('data-title'),
        renderHTML: attrs => attrs.title ? { 'data-title': attrs.title } : {},
      },
      description: {
        default: null,
        parseHTML: el => el.getAttribute('data-description'),
        renderHTML: attrs => attrs.description ? { 'data-description': attrs.description } : {},
      },
      author: {
        default: null,
        parseHTML: el => el.getAttribute('data-author'),
        renderHTML: attrs => attrs.author ? { 'data-author': attrs.author } : {},
      },
      site: {
        default: null,
        parseHTML: el => el.getAttribute('data-site'),
        renderHTML: attrs => attrs.site ? { 'data-site': attrs.site } : {},
      },
      thumbnail: {
        default: null,
        parseHTML: el => el.getAttribute('data-thumbnail'),
        renderHTML: attrs => attrs.thumbnail ? { 'data-thumbnail': attrs.thumbnail } : {},
      },
      html: {
        default: null,
        // Don't render to DOM to avoid churn
      },
      type: {
        default: 'link',
        parseHTML: el => el.getAttribute('data-embed-type') || 'link',
        renderHTML: attrs => ({ 'data-embed-type': attrs.type }),
      },
      width: {
        default: null,
        parseHTML: el => {
          const w = el.getAttribute('data-width')
          return w ? parseInt(w) : null
        },
        renderHTML: attrs => attrs.width ? { 'data-width': String(attrs.width) } : {},
      },
      height: {
        default: null,
        parseHTML: el => {
          const h = el.getAttribute('data-height')
          return h ? parseInt(h) : null
        },
        renderHTML: attrs => attrs.height ? { 'data-height': String(attrs.height) } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-embed-display]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-embed-display': '' }, this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setEmbedDisplay:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { id: crypto.randomUUID(), ...options },
          }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedDisplayNodeView, {
      // Always reuse the NodeView instance to prevent iframe reloads
      update: () => true,

      // Ignore internal DOM mutations from Iframely
      ignoreMutation: () => true,
    })
  },
})
