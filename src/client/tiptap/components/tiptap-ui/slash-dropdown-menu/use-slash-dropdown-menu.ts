"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- Icons ---
import { CodeBlockIcon } from "@/src/client/tiptap/components/tiptap-icons/code-block-icon"
import { HeadingOneIcon } from "@/src/client/tiptap/components/tiptap-icons/heading-one-icon"
import { HeadingTwoIcon } from "@/src/client/tiptap/components/tiptap-icons/heading-two-icon"
import { HeadingThreeIcon } from "@/src/client/tiptap/components/tiptap-icons/heading-three-icon"
import { ImageIcon } from "@/src/client/tiptap/components/tiptap-icons/image-icon"
import { ListIcon } from "@/src/client/tiptap/components/tiptap-icons/list-icon"
import { ListOrderedIcon } from "@/src/client/tiptap/components/tiptap-icons/list-ordered-icon"
import { BlockquoteIcon } from "@/src/client/tiptap/components/tiptap-icons/blockquote-icon"
import { ListTodoIcon } from "@/src/client/tiptap/components/tiptap-icons/list-todo-icon"
import { AiSparklesIcon } from "@/src/client/tiptap/components/tiptap-icons/ai-sparkles-icon"
import { MinusIcon } from "@/src/client/tiptap/components/tiptap-icons/minus-icon"
import { TypeIcon } from "@/src/client/tiptap/components/tiptap-icons/type-icon"
import { AtSignIcon } from "@/src/client/tiptap/components/tiptap-icons/at-sign-icon"
import { SmilePlusIcon } from "@/src/client/tiptap/components/tiptap-icons/smile-plus-icon"
import { LinkIcon } from "@/src/client/tiptap/components/tiptap-icons/link-icon"
import { TrashIcon } from "@/src/client/tiptap/components/tiptap-icons/trash-icon"

// --- Lib ---
import {
  isExtensionAvailable,
  isNodeInSchema,
} from "@/src/client/tiptap/lib/tiptap-utils"
import {
  findSelectionPosition,
  hasContentAbove,
} from "@/src/client/tiptap/lib/tiptap-advanced-utils"

// --- Tiptap UI ---
import type { SuggestionItem } from "@/src/client/tiptap/components/tiptap-ui-utils/suggestion-menu"
import { addEmojiTrigger } from "@/src/client/tiptap/components/tiptap-ui/emoji-trigger-button"
import { addMentionTrigger } from "@/src/client/tiptap/components/tiptap-ui/mention-trigger-button"
import { AI_EXTENSIONS } from "@/src/client/tiptap/components/tiptap-ui/ai-ask-button/use-ai-ask"
import { deleteNode, canDeleteNode } from "@/src/client/tiptap/components/tiptap-ui/delete-node-button/use-delete-node"

export interface SlashMenuConfig {
  enabledItems?: SlashMenuItemType[]
  customItems?: SuggestionItem[]
  itemGroups?: {
    [key in SlashMenuItemType]?: string
  }
  showGroups?: boolean
}

const texts = {
  // AI
  continue_writing: {
    title: "Continue Writing",
    subtext: "Continue writing from the current position",
    aliases: ["continue", "write", "continue writing", "ai"],
    badge: AiSparklesIcon,
    group: "AI",
  },
  ai_ask_button: {
    title: "Ask AI",
    subtext: "Ask AI to generate content",
    aliases: ["ai", "ask", "generate"],
    badge: AiSparklesIcon,
    group: "AI",
  },

  // Style
  text: {
    title: "Text",
    subtext: "Regular text paragraph",
    aliases: ["p", "paragraph", "text"],
    badge: TypeIcon,
    group: "Style",
  },
  // heading_1: {
  //   title: "Heading 1",
  //   subtext: "Top-level heading",
  //   aliases: ["h", "heading1", "h1"],
  //   badge: HeadingOneIcon,
  //   group: "Style",
  // },
  heading_3: {
    title: "Large Heading",
    subtext: "Main section heading",
    aliases: ["h3", "heading3", "large", "big heading"],
    badge: HeadingThreeIcon,
    group: "Style",
  },
  heading_4: {
    title: "Small Heading",
    subtext: "Subsection heading",
    aliases: ["h4", "heading4", "small", "small heading"],
    badge: HeadingThreeIcon,
    group: "Style",
  },
  bullet_list: {
    title: "Bullet List",
    subtext: "List with unordered items",
    aliases: ["ul", "li", "list", "bulletlist", "bullet list"],
    badge: ListIcon,
    group: "Style",
  },
  ordered_list: {
    title: "Numbered List",
    subtext: "List with ordered items",
    aliases: ["ol", "li", "list", "numberedlist", "numbered list"],
    badge: ListOrderedIcon,
    group: "Style",
  },
  task_list: {
    title: "To-do list",
    subtext: "List with tasks",
    aliases: ["tasklist", "task list", "todo", "checklist"],
    badge: ListTodoIcon,
    group: "Style",
  },
  quote: {
    title: "Blockquote",
    subtext: "Blockquote block",
    aliases: ["quote", "blockquote"],
    badge: BlockquoteIcon,
    group: "Style",
  },
  code_block: {
    title: "Code Block",
    subtext: "Code block with syntax highlighting",
    aliases: ["code", "pre"],
    badge: CodeBlockIcon,
    group: "Style",
  },

  // Insert
  mention: {
    title: "Mention",
    subtext: "Mention a user or item",
    aliases: ["mention", "user", "item", "tag"],
    badge: AtSignIcon,
    group: "Insert",
  },
  emoji: {
    title: "Emoji",
    subtext: "Insert an emoji",
    aliases: ["emoji", "emoticon", "smiley"],
    badge: SmilePlusIcon,
    group: "Insert",
  },
  divider: {
    title: "Separator",
    subtext: "Horizontal line to separate content",
    aliases: ["hr", "horizontalRule", "line", "separator"],
    badge: MinusIcon,
    group: "Insert",
  },
  embed_url: {
    title: "Embed URL",
    subtext: "Embed rich media from a URL",
    aliases: ["embed", "url", "link", "media", "iframe"],
    badge: LinkIcon,
    group: "Insert",
  },
  ai_image: {
    title: "AI Image",
    subtext: "Generate an image with AI",
    aliases: ["ai", "image", "generate", "dall-e", "picture"],
    badge: AiSparklesIcon,
    group: "AI",
  },

  // Upload
  image: {
    title: "Image",
    subtext: "Resizable image with caption",
    aliases: [
      "image",
      "imageUpload",
      "upload",
      "img",
      "picture",
      "media",
      "url",
    ],
    badge: ImageIcon,
    group: "Upload",
  },

  // Actions
  delete_node: {
    title: "Delete",
    subtext: "Delete the current node",
    aliases: ["delete", "remove", "trash"],
    badge: TrashIcon,
    group: "Actions",
  },
}

export type SlashMenuItemType = keyof typeof texts

const getItemImplementations = () => {
  return {
    // AI
    continue_writing: {
      check: (editor: Editor) => {
        const { hasContent } = hasContentAbove(editor)
        const extensionsReady = isExtensionAvailable(editor, [
          "ai",
          "aiAdvanced",
        ])
        return extensionsReady && hasContent
      },
      action: ({ editor }: { editor: Editor }) => {
        const editorChain = editor.chain().focus()

        const nodeSelectionPosition = findSelectionPosition({ editor })

        if (nodeSelectionPosition !== null) {
          editorChain.setNodeSelection(nodeSelectionPosition)
        }

        editorChain.run()

        editor.chain().focus().aiGenerationShow().run()

        requestAnimationFrame(() => {
          const { hasContent, content } = hasContentAbove(editor)

          const snippet =
            content.length > 500 ? `...${content.slice(-500)}` : content

          const prompt = hasContent
            ? `Context: ${snippet}\n\nContinue writing from where the text above ends. Write ONLY ONE SENTENCE. DONT REPEAT THE TEXT.`
            : "Start writing a new paragraph. Write ONLY ONE SENTENCE."

          editor
            .chain()
            .focus()
            .aiTextPrompt({
              stream: true,
              format: "rich-text",
              text: prompt,
            })
            .run()
        })
      },
    },
    ai_ask_button: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["ai", "aiAdvanced"]),
      action: ({ editor }: { editor: Editor }) => {
        const editorChain = editor.chain().focus()

        const nodeSelectionPosition = findSelectionPosition({ editor })

        if (nodeSelectionPosition !== null) {
          editorChain.setNodeSelection(nodeSelectionPosition)
        }

        editorChain.run()

        editor.chain().focus().aiGenerationShow().run()
      },
    },

    // Style
    text: {
      check: (editor: Editor) => isNodeInSchema("paragraph", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setParagraph().run()
      },
    },
    // heading_1: {
    //   check: (editor: Editor) => isNodeInSchema("heading", editor),
    //   action: ({ editor }: { editor: Editor }) => {
    //     editor.chain().focus().toggleHeading({ level: 1 }).run()
    //   },
    // },
    heading_3: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 3 }).run()
      },
    },
    heading_4: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 4 }).run()
      },
    },
    bullet_list: {
      check: (editor: Editor) => isNodeInSchema("bulletList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBulletList().run()
      },
    },
    ordered_list: {
      check: (editor: Editor) => isNodeInSchema("orderedList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleOrderedList().run()
      },
    },
    task_list: {
      check: (editor: Editor) => isNodeInSchema("taskList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleTaskList().run()
      },
    },
    quote: {
      check: (editor: Editor) => isNodeInSchema("blockquote", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBlockquote().run()
      },
    },
    code_block: {
      check: (editor: Editor) => isNodeInSchema("codeBlock", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleNode("codeBlock", "paragraph").run()
      },
    },

    // Insert
    mention: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["mention", "mentionAdvanced"]),
      action: ({ editor }: { editor: Editor }) => addMentionTrigger(editor),
    },
    emoji: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["emoji", "emojiPicker"]),
      action: ({ editor }: { editor: Editor }) => addEmojiTrigger(editor),
    },
    divider: {
      check: (editor: Editor) => isNodeInSchema("horizontalRule", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setHorizontalRule().run()
      },
    },
    embed_url: {
      check: (editor: Editor) => isNodeInSchema("embedInput", editor),
      action: ({ editor }: { editor: Editor }) => {
        // Insert embed input node
        editor.chain().focus().setEmbedInput().run()
      },
    },
    ai_image: {
      check: (editor: Editor) => {
        const hasAiImageNode = isNodeInSchema("aiImage", editor)
        const hasAiExtensions = isExtensionAvailable(editor, AI_EXTENSIONS)
        return hasAiImageNode && hasAiExtensions
      },
      action: ({ editor }: { editor: Editor }) => {
        // Insert AI image node with empty prompt
        editor.chain().focus().setAiImageNode({ prompt: '' }).run()
      },
    },

    // Upload
    image: {
      check: (editor: Editor) => isNodeInSchema("image", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "imageUpload",
          })
          .run()
      },
    },

    // Actions
    delete_node: {
      check: (editor: Editor) => canDeleteNode(editor),
      action: ({ editor }: { editor: Editor }) => {
        deleteNode(editor)
      },
    },
  }
}

function organizeItemsByGroups(
  items: SuggestionItem[],
  showGroups: boolean
): SuggestionItem[] {
  if (!showGroups) {
    return items.map((item) => ({ ...item, group: "" }))
  }

  const groups: { [groupLabel: string]: SuggestionItem[] } = {}

  // Group items
  items.forEach((item) => {
    const groupLabel = item.group || ""
    if (!groups[groupLabel]) {
      groups[groupLabel] = []
    }
    groups[groupLabel].push(item)
  })

  // Flatten groups in order (this maintains the visual order for keyboard navigation)
  const organizedItems: SuggestionItem[] = []
  Object.entries(groups).forEach(([, groupItems]) => {
    organizedItems.push(...groupItems)
  })

  return organizedItems
}

/**
 * Custom hook for slash dropdown menu functionality
 */
export function useSlashDropdownMenu(config?: SlashMenuConfig) {
  const getSlashMenuItems = React.useCallback(
    (editor: Editor) => {
      const items: SuggestionItem[] = []

      const enabledItems =
        config?.enabledItems || (Object.keys(texts) as SlashMenuItemType[])
      const showGroups = config?.showGroups !== false

      const itemImplementations = getItemImplementations()

      enabledItems.forEach((itemType) => {
        const itemImpl = itemImplementations[itemType]
        const itemText = texts[itemType]

        if (itemImpl && itemText && itemImpl.check(editor)) {
          const item: SuggestionItem = {
            onSelect: ({ editor }) => itemImpl.action({ editor }),
            ...itemText,
          }

          if (config?.itemGroups?.[itemType]) {
            item.group = config.itemGroups[itemType]
          } else if (!showGroups) {
            item.group = ""
          }

          items.push(item)
        }
      })

      if (config?.customItems) {
        items.push(...config.customItems)
      }

      // Reorganize items by groups to ensure keyboard navigation works correctly
      return organizeItemsByGroups(items, showGroups)
    },
    [config]
  )

  return {
    getSlashMenuItems,
    config,
  }
}
