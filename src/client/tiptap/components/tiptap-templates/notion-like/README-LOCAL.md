# Local-Only Notion Editor

This is a modified version of the Tiptap Notion-like editor template that has been adapted for local document editing without collaboration features.

## Changes Made

### Removed Collaboration Features
- **Collaboration Extensions**: Removed `Collaboration` and `CollaborationCaret` extensions
- **Real-time Sync**: No longer requires Tiptap Cloud or WebSocket connections
- **User Presence**: Removed user avatars and collaboration cursors
- **Document Rooms**: No room-based document sharing

### Simplified API
The editor now uses a simpler, more traditional React component API:

```tsx
<NotionEditor
  placeholder="Start writing..."
  content={initialContent}
  onUpdate={(content) => handleContentUpdate(content)}
/>
```

### Local State Management
- Content is managed via React props (`content` and `onUpdate`)
- No automatic syncing - you control when and how to save
- Perfect for local documents, database storage, or custom sync logic

## Usage Examples

### Basic Usage
```tsx
import { NotionEditor } from './notion-like-editor'

function MyComponent() {
  const [content, setContent] = useState('')

  return (
    <NotionEditor
      placeholder="Start writing..."
      content={content}
      onUpdate={setContent}
    />
  )
}
```

### With Persistence
```tsx
import { NotionEditor } from './notion-like-editor'
import { useEffect, useState } from 'react'

function PersistentEditor() {
  const [content, setContent] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('editor-content')
    if (saved) setContent(saved)
  }, [])

  // Save to localStorage on change
  const handleUpdate = (newContent: string) => {
    setContent(newContent)
    localStorage.setItem('editor-content', newContent)
  }

  return (
    <NotionEditor
      content={content}
      onUpdate={handleUpdate}
      placeholder="Start writing..."
    />
  )
}
```

### With Database Integration
```tsx
import { NotionEditor } from './notion-like-editor'
import { useMutation, useQuery } from 'react-query'

function DatabaseEditor({ documentId }: { documentId: string }) {
  const { data: document } = useQuery(['document', documentId], 
    () => fetchDocument(documentId)
  )
  
  const updateMutation = useMutation(updateDocument)

  const handleUpdate = (content: string) => {
    updateMutation.mutate({ id: documentId, content })
  }

  return (
    <NotionEditor
      content={document?.content || ''}
      onUpdate={handleUpdate}
      placeholder="Start writing your list item..."
    />
  )
}
```

## Features Retained

All the core editing features remain available:
- ✅ **Rich Text Formatting**: Bold, italic, underline, strikethrough, colors
- ✅ **Block Types**: Headings, lists, blockquotes, code blocks
- ✅ **AI Integration**: AI assistance features (requires AI token setup)
- ✅ **Drag & Drop**: Block reordering
- ✅ **Slash Commands**: Quick formatting with `/`
- ✅ **Emoji Support**: Full emoji picker
- ✅ **Image Uploads**: Drag & drop image support
- ✅ **Mobile Support**: Touch-friendly interface
- ✅ **Dark/Light Mode**: Theme switching
- ✅ **Keyboard Shortcuts**: Full keyboard navigation
- ✅ **Undo/Redo**: Complete editing history

## Environment Setup

You still need these environment variables for AI features:
```env
NEXT_PUBLIC_TIPTAP_AI_APP_ID=your_ai_app_id
NEXT_PUBLIC_TIPTAP_AI_TOKEN=your_ai_token
```

You can remove these collaboration-related variables:
```env
# No longer needed
NEXT_PUBLIC_TIPTAP_COLLAB_DOC_PREFIX=
NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID=
NEXT_PUBLIC_TIPTAP_COLLAB_TOKEN=
```

## Migration from Collaboration Version

If you're migrating from the collaboration version:

1. **Update Component Usage**:
   ```tsx
   // Before
   <NotionEditor room="my-room" placeholder="Start writing..." />
   
   // After
   <NotionEditor 
     content={content}
     onUpdate={setContent}
     placeholder="Start writing..." 
   />
   ```

2. **Add State Management**:
   You now need to manage content state yourself instead of relying on the collaborative document.

3. **Remove Environment Variables**:
   Clean up your `.env` file to remove collaboration-related variables.

## File Structure

```
notion-like/
├── notion-like-editor.tsx              # Main editor component
├── LocalNotionEditorExample.tsx        # Usage examples
├── README-LOCAL.md                     # This documentation
├── notion-like-editor-header.tsx       # Simplified header (no collab users)
└── ...                                 # Other unchanged components
```

## Benefits of Local-Only Version

- **Simpler Setup**: No need for Tiptap Cloud account for basic editing
- **Better Performance**: No network overhead for document sync
- **Full Control**: You decide when and how to save content
- **Privacy**: All content stays local until you explicitly save it
- **Offline Ready**: Works completely offline
- **Cost Effective**: No collaboration service fees for single-user scenarios

## When to Use This Version

Perfect for:
- Single-user document editing
- List items in your application
- Blog post editors
- Note-taking applications
- Any scenario where real-time collaboration isn't needed

Consider the full collaboration version for:
- Multi-user document editing
- Real-time team collaboration
- Live document sharing
- Concurrent editing scenarios
