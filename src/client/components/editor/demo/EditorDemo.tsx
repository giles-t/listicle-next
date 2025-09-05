"use client"

import * as React from "react"
import { MinimalEditor } from "../MinimalEditor"

export function EditorDemo() {
  const [content, setContent] = React.useState(`
    <h2>Welcome to the Minimal Editor!</h2>
    <p>This is a clean, focused editor for list items. Here's what you can do:</p>
    <ul>
      <li>Type <code>/</code> to open the slash command menu</li>
      <li>Select text to see formatting options</li>
      <li>Add images, embeds, and AI-generated content</li>
    </ul>
    <p>Try selecting this text to see the floating menu in action.</p>
    <blockquote>
      <p>"Simplicity is the ultimate sophistication" - Leonardo da Vinci</p>
    </blockquote>
  `)

  const [aiToken] = React.useState<string | null>("demo-token")

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-heading-1 font-heading-1 text-default-font">
          Minimal List Item Editor Demo
        </h1>
        <p className="text-body text-subtext-color">
          A clean, minimalistic editor designed for list items with slash commands and AI integration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-3">
          <h2 className="text-heading-2 font-heading-2 text-default-font">
            Editor
          </h2>
          <div className="border border-neutral-border rounded-lg bg-white shadow-sm">
            <MinimalEditor
              content={content}
              placeholder="Start writing your list item..."
              onUpdate={setContent}
              aiToken={aiToken}
              className="min-h-[300px]"
            />
          </div>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <h2 className="text-heading-2 font-heading-2 text-default-font">
            HTML Output
          </h2>
          <div className="border border-neutral-border rounded-lg bg-neutral-50 p-4">
            <pre className="text-monospace-body font-monospace-body text-sm whitespace-pre-wrap overflow-auto max-h-[300px]">
              {content}
            </pre>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="bg-brand-50 border border-brand-200 rounded-lg p-6">
        <h3 className="text-heading-3 font-heading-3 text-brand-700 mb-4">
          ✨ Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-body-bold font-body-bold text-default-font mb-2">
              Slash Commands
            </h4>
            <ul className="text-body font-body text-subtext-color space-y-1">
              <li>• Type <code className="bg-white px-1 rounded">/</code> for quick access</li>
              <li>• Headings, lists, quotes</li>
              <li>• Images and embeds</li>
              <li>• AI-generated content</li>
            </ul>
          </div>
          <div>
            <h4 className="text-body-bold font-body-bold text-default-font mb-2">
              Text Selection
            </h4>
            <ul className="text-body font-body text-subtext-color space-y-1">
              <li>• AI text enhancement</li>
              <li>• Bold, italic, strikethrough</li>
              <li>• Links and highlighting</li>
              <li>• Code formatting</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="space-y-3">
        <h3 className="text-heading-3 font-heading-3 text-default-font">
          Usage Example
        </h3>
        <div className="bg-neutral-50 border border-neutral-border rounded-lg p-4">
          <pre className="text-monospace-body font-monospace-body text-sm overflow-auto">
{`import { MinimalEditor } from '@/src/client/components/editor'

function ListItemEditor() {
  const [content, setContent] = useState('')

  return (
    <MinimalEditor
      content={content}
      placeholder="Describe this list item..."
      onUpdate={setContent}
      aiToken={aiToken}
      autoFocus
    />
  )
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
