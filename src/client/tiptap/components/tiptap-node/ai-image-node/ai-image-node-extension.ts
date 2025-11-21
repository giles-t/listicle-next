import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { AiImageNodeView } from './ai-image-node-view'

export interface AiImageNodeOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiImageNode: {
      setAiImageNode: (options?: { 
        prompt?: string
        modelName?: string
        size?: string
        quality?: string
        background?: string
        moderation?: string
        outputFormat?: string
        outputCompression?: number
      }) => ReturnType
    }
  }
}

export const AiImageNode = Node.create<AiImageNodeOptions>({
  name: 'aiImage',
  group: 'block',
  atom: true, // Prevent editing inside the node

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      prompt: {
        default: '',
        parseHTML: element => element.getAttribute('data-prompt'),
        renderHTML: attributes => ({
          'data-prompt': attributes.prompt,
        }),
      },
      modelName: {
        default: 'gpt-image-1',
        parseHTML: element => element.getAttribute('data-model-name'),
        renderHTML: attributes => ({
          'data-model-name': attributes.modelName,
        }),
      },
      size: {
        default: 'auto',
        parseHTML: element => element.getAttribute('data-size'),
        renderHTML: attributes => ({
          'data-size': attributes.size,
        }),
      },
      quality: {
        default: 'auto',
        parseHTML: element => element.getAttribute('data-quality'),
        renderHTML: attributes => ({
          'data-quality': attributes.quality,
        }),
      },
      background: {
        default: null,
        parseHTML: element => element.getAttribute('data-background'),
        renderHTML: attributes => attributes.background ? {
          'data-background': attributes.background,
        } : {},
      },
      moderation: {
        default: null,
        parseHTML: element => element.getAttribute('data-moderation'),
        renderHTML: attributes => attributes.moderation ? {
          'data-moderation': attributes.moderation,
        } : {},
      },
      outputFormat: {
        default: 'png',
        parseHTML: element => element.getAttribute('data-output-format'),
        renderHTML: attributes => ({
          'data-output-format': attributes.outputFormat,
        }),
      },
      outputCompression: {
        default: null,
        parseHTML: element => {
          const val = element.getAttribute('data-output-compression')
          return val ? parseInt(val) : null
        },
        renderHTML: attributes => attributes.outputCompression ? {
          'data-output-compression': attributes.outputCompression,
        } : {},
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
          'data-generated-image-src': attributes.generatedImageSrc, // Blob storage URL
        } : {},
      },
      error: {
        default: null,
        parseHTML: element => element.getAttribute('data-error'),
        renderHTML: attributes => attributes.error ? {
          'data-error': attributes.error,
        } : {},
      },
      progress: {
        default: 0,
        parseHTML: element => parseInt(element.getAttribute('data-progress') || '0'),
        renderHTML: attributes => ({
          'data-progress': attributes.progress || 0,
        }),
      },
      generationMessage: {
        default: null,
        parseHTML: element => element.getAttribute('data-generation-message'),
        renderHTML: attributes => attributes.generationMessage ? {
          'data-generation-message': attributes.generationMessage,
        } : {},
      },
      revisedPrompt: {
        default: null,
        parseHTML: element => element.getAttribute('data-revised-prompt'),
        renderHTML: attributes => attributes.revisedPrompt ? {
          'data-revised-prompt': attributes.revisedPrompt,
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
