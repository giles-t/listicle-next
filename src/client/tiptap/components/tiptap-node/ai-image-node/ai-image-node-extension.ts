import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { AiImageNodeView } from './ai-image-node-view'

export interface AiImageNodeOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiImageNode: {
      setAiImageNode: (options?: { prompt?: string; style?: string; modelName?: string; size?: string }) => ReturnType
    }
  }
}

export const AiImageNode = Node.create<AiImageNodeOptions>({
  name: 'aiImage',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',
  
  atom: true, // Prevent editing inside the node

  addAttributes() {
    return {
      prompt: {
        default: '',
        parseHTML: element => element.getAttribute('data-prompt'),
        renderHTML: attributes => ({
          'data-prompt': attributes.prompt,
        }),
      },
      style: {
        default: 'photorealistic',
        parseHTML: element => element.getAttribute('data-style'),
        renderHTML: attributes => ({
          'data-style': attributes.style,
        }),
      },
      modelName: {
        default: 'dall-e-3',
        parseHTML: element => element.getAttribute('data-model-name'),
        renderHTML: attributes => ({
          'data-model-name': attributes.modelName,
        }),
      },
      size: {
        default: '1024x1024',
        parseHTML: element => element.getAttribute('data-size'),
        renderHTML: attributes => ({
          'data-size': attributes.size,
        }),
      },
      isGenerating: {
        default: false,
        parseHTML: element => element.getAttribute('data-is-generating') === 'true',
        renderHTML: attributes => ({
          'data-is-generating': attributes.isGenerating,
        }),
      },
      generatedImageSrc: {
        default: null,
        parseHTML: element => element.getAttribute('data-generated-image-src'),
        renderHTML: attributes => attributes.generatedImageSrc ? {
          'data-generated-image-src': attributes.generatedImageSrc,
        } : {},
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-ai-image]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-ai-image': '' }, this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setAiImageNode: (options = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(AiImageNodeView, {
      contentDOMElementTag: 'div',
    })
  },
})
