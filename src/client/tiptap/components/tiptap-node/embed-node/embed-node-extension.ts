import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { EmbedNodeView } from './embed-node-view'

export interface EmbedOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      /**
       * Insert an embed
       */
      setEmbed: (options: { 
        src: string
      }) => ReturnType
    }
  }
}

export const EmbedNode = Node.create<EmbedOptions>({
  name: 'embed',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('data-src'),
        renderHTML: attributes => ({
          'data-src': attributes.src,
        }),
      },
      url: {
        default: null,
        parseHTML: element => element.getAttribute('data-url'),
        renderHTML: attributes => attributes.url ? {
          'data-url': attributes.url,
        } : {},
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => attributes.title ? {
          'data-title': attributes.title,
        } : {},
      },
      description: {
        default: null,
        parseHTML: element => element.getAttribute('data-description'),
        renderHTML: attributes => attributes.description ? {
          'data-description': attributes.description,
        } : {},
      },
      author: {
        default: null,
        parseHTML: element => element.getAttribute('data-author'),
        renderHTML: attributes => attributes.author ? {
          'data-author': attributes.author,
        } : {},
      },
      site: {
        default: null,
        parseHTML: element => element.getAttribute('data-site'),
        renderHTML: attributes => attributes.site ? {
          'data-site': attributes.site,
        } : {},
      },
      thumbnail: {
        default: null,
        parseHTML: element => element.getAttribute('data-thumbnail'),
        renderHTML: attributes => attributes.thumbnail ? {
          'data-thumbnail': attributes.thumbnail,
        } : {},
      },
      html: {
        default: null,
        parseHTML: element => element.getAttribute('data-html'),
        renderHTML: attributes => attributes.html ? {
          'data-html': attributes.html,
        } : {},
      },
      type: {
        default: 'link',
        parseHTML: element => element.getAttribute('data-type') || 'link',
        renderHTML: attributes => ({
          'data-type': attributes.type,
        }),
      },
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('data-width')
          return width ? parseInt(width) : null
        },
        renderHTML: attributes => attributes.width ? {
          'data-width': attributes.width.toString(),
        } : {},
      },
      height: {
        default: null,
        parseHTML: element => {
          const height = element.getAttribute('data-height')
          return height ? parseInt(height) : null
        },
        renderHTML: attributes => attributes.height ? {
          'data-height': attributes.height.toString(),
        } : {},
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-embed': '' }, this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeView, {
      contentDOMElementTag: 'div',
    })
  },
})
