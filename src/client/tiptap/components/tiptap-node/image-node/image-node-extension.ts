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
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

export default Image
