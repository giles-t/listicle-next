"use client";

import React, { useState, useEffect, useRef } from "react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Placeholder, Selection } from "@tiptap/extensions";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Mathematics } from "@tiptap/extension-mathematics";
import { UniqueID } from "@tiptap/extension-unique-id";
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";
import { HorizontalRule } from "@/src/client/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { Image } from "@/src/client/tiptap/components/tiptap-node/image-node/image-node-extension";
import { EmbedDisplayNode } from "@/src/client/tiptap/components/tiptap-node/embed-display-node/embed-display-node-extension";
import { ImageUploadNode } from "@/src/client/tiptap/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { AiImageNode } from "@/src/client/tiptap/components/tiptap-node/ai-image-node/ai-image-node-extension";

// Import image node styles for caption display
import "@/src/client/tiptap/components/tiptap-node/image-node/image-node-view.scss";

// Declare Iframely global
declare global {
  interface Window {
    iframely?: { load: (container?: HTMLElement) => void }
  }
}

// Extensions configuration for static rendering (matches main editor)
const displayExtensions = [
  StarterKit.configure({
    horizontalRule: false,
    dropcursor: {
      width: 2,
    },
    heading: {
      levels: [3, 4], // Only allow H3 and H4
    },
  }),
  HorizontalRule,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Placeholder.configure({
    placeholder: "Content...",
    emptyNodeClass: "is-empty",
  }),
  Emoji.configure({
    emojis: gitHubEmojis.filter(
      (emoji) => !emoji.name.includes("regional")
    ),
    forceFallbackImages: true,
  }),
  Mathematics,
  Superscript,
  Subscript,
  Color,
  TextStyle,
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Selection,
  Image,
  ImageUploadNode.configure({
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB
    limit: 3,
    upload: () => Promise.resolve(''), // No upload in display mode
    onError: () => {}, // No error handling needed in display mode
  }),
  EmbedDisplayNode, // Handles embeds securely
  AiImageNode, // For AI-generated images
  Typography,
  UniqueID.configure({
    types: [
      "paragraph",
      "bulletList",
      "orderedList",
      "taskList",
      "heading",
      "blockquote",
      "codeBlock",
      "embedInput",
      "embedDisplay",
      "aiImage",
    ],
  }),
];

// Custom embed component for static renderer
function StaticEmbedComponent({ node }: { node: any }) {
  const embedRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = embedRef.current;
    if (!container || !node.attrs?.html) return;
    
    // Set the HTML content from the node attributes
    container.innerHTML = node.attrs.html;
    
    // Load iframely if available
    if (window.iframely) {
      window.iframely.load(container);
    }
  }, [node.attrs?.html]);

  // Fallback if no embed HTML available
  if (!node.attrs?.html) {
    const { url, title, site, thumbnail } = node.attrs || {};
    
    if (!url) return null;
    
    return (
      <div className="border border-gray-200 rounded-lg p-3 my-2 bg-gray-50">
        <div className="flex items-start gap-3">
          {thumbnail && (
            <img 
              src={thumbnail} 
              alt={title || 'Embed thumbnail'} 
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2">
              {title || url}
            </h3>
            {site && (
              <p className="text-gray-500 text-xs mt-1">{site}</p>
            )}
          </div>
        </div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 text-xs hover:underline mt-2 inline-block"
        >
          Visit link →
        </a>
      </div>
    );
  }

  return (
    <div 
      ref={embedRef} 
      className="my-2 embed-display-node-content"
      style={{ width: '100%', maxWidth: '100%' }}
    />
  );
}

// Props for the StaticContentRenderer component
interface StaticContentRendererProps {
  content: string;
  className?: string;
  emptyMessage?: string;
  errorMessage?: string;
}

/**
 * Efficient static content renderer using Tiptap's static renderer.
 * Converts JSON content to React elements without creating editor instances.
 * Perfect for displaying content in lists or read-only views.
 */
export function StaticContentRenderer({ 
  content, 
  className = "tiptap ProseMirror max-w-none py-2",
  emptyMessage = "No content",
  errorMessage = "Content could not be displayed"
}: StaticContentRendererProps) {
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!content) {
      setRenderedContent(null);
      return;
    }

    try {
      // Parse content - could be JSON or HTML
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch {
        // If not JSON, create a simple document structure for HTML
        parsedContent = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: content.replace(/<[^>]*>/g, ''), // Strip HTML tags for fallback
                }
              ]
            }
          ]
        };
      }

      // Use Tiptap's static renderer to convert JSON to React elements
      const reactElement = renderToReactElement({
        extensions: displayExtensions,
        content: parsedContent,
        options: {
          // Custom mapping for embed nodes to use our static component
          nodeMapping: {
            embedDisplay: ({ node }) => <StaticEmbedComponent node={node} />,
          },
          // Handle unhandled nodes gracefully
          unhandledNode: ({ node }) => (
            <div className="text-gray-500 text-sm italic">
              [Unsupported content: {node.type?.name || 'unknown'}]
            </div>
          ),
        },
      });

      setRenderedContent(reactElement);
      setError(null);
    } catch (err) {
      console.error('Error rendering content:', err);
      setError(errorMessage);
      setRenderedContent(null);
    }
  }, [content, errorMessage]);

  if (error) {
    return (
      <div className="py-2 text-gray-500 text-sm italic">
        {error}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="py-2 text-gray-500 text-sm italic">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      {renderedContent}
    </div>
  );
}

export default StaticContentRenderer;
