# Minimal List Item Editor

A clean, minimalistic Tiptap editor designed specifically for editing list items. Built with simplicity and performance in mind.

## Features

- **Slash Commands**: Type `/` to access all formatting options
- **Floating Menu**: Select text to see formatting options
- **AI Integration**: Built-in AI text enhancement and image generation
- **Custom Nodes**: Support for embeds, image uploads, and AI-generated images
- **Clean Design**: Matches your existing Tailwind design system

## Usage

```tsx
import { MinimalEditor } from '@/src/client/components/editor'

function ListItemEditor() {
  const [content, setContent] = useState('<p>Hello world!</p>')

  return (
    <MinimalEditor
      content={content}
      placeholder="Describe this list item..."
      onUpdate={setContent}
      aiToken={aiToken}
      autoFocus
    />
  )
}
```

## Props

- `content?: string` - Initial HTML content
- `placeholder?: string` - Placeholder text (default: "Start writing...")
- `onUpdate?: (content: string) => void` - Called when content changes
- `aiToken?: string | null` - AI token for enhanced features
- `className?: string` - Additional CSS classes
- `autoFocus?: boolean` - Auto-focus on mount

## Slash Commands

Type `/` to access:

### Basic
- **Text** - Plain text paragraph
- **Heading 2** - Large heading
- **Heading 3** - Medium heading

### Lists  
- **Bullet List** - Unordered list
- **Numbered List** - Ordered list

### Blocks
- **Quote** - Blockquote
- **Code Block** - Code with syntax highlighting
- **Divider** - Horizontal rule

### Media
- **Image** - Upload image
- **Embed** - Embed URL content
- **AI Image** - Generate image with AI

## Floating Menu

Select any text to access:
- AI Enhancement
- Bold, Italic, Strikethrough
- Code formatting
- Links
- Highlighting

## Architecture

- `MinimalEditor.tsx` - Main editor component
- `hooks/use-editor-config.ts` - Editor configuration and extensions
- `components/FloatingMenu.tsx` - Text selection toolbar
- `components/SlashMenu.tsx` - Slash command interface
- `components/SlashCommand.tsx` - Slash command logic
- `styles.css` - Editor-specific styles

## Custom Nodes

The editor includes all custom nodes from your existing implementation:
- Image upload with drag & drop
- Embed input/display for URLs
- AI image generation
- Enhanced text formatting

## Styling

Follows your existing design system:
- Plus Jakarta Sans font
- Neutral color palette
- Brand blue accents (rgb(37, 99, 235))
- Consistent spacing and borders
