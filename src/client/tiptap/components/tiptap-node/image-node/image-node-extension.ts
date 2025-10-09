import { ReactNodeViewRenderer } from "@tiptap/react"
import type { ImageOptions } from "@tiptap/extension-image"
import { Image as TiptapImage } from "@tiptap/extension-image"
import { ImageNodeView } from "./image-node-view"

export const Image = TiptapImage.extend<ImageOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-align": {
        default: null,
      },
      caption: {
        default: null,
        parseHTML: element => element.getAttribute('data-caption'),
        renderHTML: attributes => {
          if (!attributes.caption) {
            return {}
          }
          return {
            'data-caption': attributes.caption,
          }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes, node }) {
    const caption = node.attrs.caption;
    const { 'data-caption': _, ...otherAttrs } = HTMLAttributes;
    
    // If no caption, use default image rendering
    if (!caption) {
      return ['img', otherAttrs];
    }
    
    // If caption exists, wrap in a figure element with figcaption
    return [
      'figure',
      {
        class: 'tiptap-image',
        'data-align': otherAttrs['data-align'],
        'data-width': otherAttrs.width,
      },
      [
        'div',
        { class: 'tiptap-image-container', style: otherAttrs.width ? `width: ${otherAttrs.width}px` : '' },
        [
          'div',
          { class: 'tiptap-image-content' },
          ['img', { ...otherAttrs, class: 'tiptap-image-img' }]
        ],
        [
          'div',
          { class: 'tiptap-image-caption' },
          [
            'div',
            { class: 'tiptap-image-caption-text' },
            caption
          ]
        ]
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

export default Image
