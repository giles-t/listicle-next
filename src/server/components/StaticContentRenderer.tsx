import React from "react";
import Image from "next/image";
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
import { Image as TiptapImage } from "@tiptap/extension-image";
import { LazyEmbed } from "./LazyEmbed";
// Note: We create server-safe extensions without React node views to avoid client-side hooks

// Import tiptap editor content styles for proper typography and layout
import "@/src/client/tiptap/components/tiptap-templates/notion-like/notion-like-editor.scss";
// Import node-specific styles to match editor display
import "@/src/client/tiptap/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/src/client/tiptap/components/tiptap-node/list-node/list-node.scss";
import "@/src/client/tiptap/components/tiptap-node/heading-node/heading-node.scss";
import "@/src/client/tiptap/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/src/client/tiptap/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/src/client/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/src/client/tiptap/components/tiptap-node/image-node/image-node.scss";
import "@/src/client/tiptap/components/tiptap-node/image-node/image-node-view.scss";
import "@/src/client/tiptap/components/tiptap-node/ai-image-node/ai-image-node.scss";
import "@/src/client/tiptap/components/tiptap-node/embed-display-node/embed-display-node.scss";

import { Node } from '@tiptap/core';

// Create custom Image extension that supports captions but without React node view
const ImageWithCaption = TiptapImage.extend({
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
});

// Create server-safe EmbedDisplayNode extension (without React node view)
const EmbedDisplayNode = Node.create({
  name: 'embedDisplay',
  group: 'block',
  atom: true,
  draggable: false,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      src: {
        default: null,
      },
      url: {
        default: null,
      },
      title: {
        default: null,
      },
      description: {
        default: null,
      },
      author: {
        default: null,
      },
      site: {
        default: null,
      },
      thumbnail: {
        default: null,
      },
      html: {
        default: null,
      },
      type: {
        default: 'link',
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    // Render a simple div that will be replaced by our custom node mapping
    return ['div', { class: 'embed-display-node', ...HTMLAttributes }];
  },
});

// Create server-safe AiImageNode extension (without React node view)
const AiImageNode = Node.create({
  name: 'aiImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      prompt: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'ai-image-node', ...HTMLAttributes }];
  },
});

// Create server-safe ImageUploadNode extension (without React node view)
const ImageUploadNode = Node.create({
  name: 'imageUpload',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      caption: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'image-upload-node', ...HTMLAttributes }];
  },
});

// Create server-safe EmbedInputNode extension (without React node view)
// This is typically only used in the editor UI, but we define it for completeness
const EmbedInputNode = Node.create({
  name: 'embedInput',
  group: 'block',
  atom: true,
  draggable: false,

  addAttributes() {
    return {
      id: {
        default: null,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'embed-input-node', ...HTMLAttributes }];
  },
});

// Extensions configuration for server-side static rendering
// Uses base Tiptap extensions without custom React node views
const displayExtensions = [
  StarterKit.configure({
    // horizontalRule is included by default in StarterKit
    dropcursor: {
      width: 2,
    },
    heading: {
      levels: [3, 4], // Only allow H3 and H4
    },
  }),
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
  ImageWithCaption, // Image extension with caption support, no React node view
  EmbedDisplayNode, // Embed extension without React node view
  EmbedInputNode, // Embed input extension without React node view (editor UI only)
  AiImageNode, // AI image extension without React node view
  ImageUploadNode, // Image upload extension without React node view
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
      "imageUpload",
    ],
  }),
];

// Server-side components for custom nodes (no hooks, pure rendering)

// Factory function to create static embed component with lazy load config
function createStaticEmbedComponent(disableLazyLoad: boolean = false) {
  return function StaticEmbedComponent({ node }: { node: any }) {
    const { html, url, title, site, thumbnail } = node.attrs || {};
    
    // If we have embed HTML, use lazy loading component
    if (html) {
      return <LazyEmbed 
        html={html} 
        url={url} 
        title={title} 
        site={site} 
        thumbnail={thumbnail}
        disableLazyLoad={disableLazyLoad}
      />;
    }

    // Fallback if no embed HTML available - simple link card
    if (!url) return null;
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 my-2 bg-gray-50">
        <div className="flex items-start gap-3">
          {thumbnail && (
            <Image 
              src={thumbnail} 
              alt={title || 'Embed thumbnail'} 
              width={80}
              height={80}
              className="object-cover rounded flex-shrink-0"
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
  };
}

// Static AI image component
function StaticAiImageComponent({ node }: { node: any }) {
  const { src, alt, prompt, width, height } = node.attrs || {};
  
  if (!src) return null;
  
  return (
    <figure className="ai-image-node my-4">
      <div className="ai-image-container">
        <Image 
          src={src} 
          alt={alt || prompt || 'AI generated image'} 
          width={width || 800}
          height={height || 600}
          className="ai-image-img"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
      {prompt && (
        <figcaption className="text-sm text-gray-500 mt-2 italic">
          Generated from: {prompt}
        </figcaption>
      )}
    </figure>
  );
}

// Static image upload component - renders uploaded images
function StaticImageUploadComponent({ node }: { node: any }) {
  const { src, alt, caption, width, height } = node.attrs || {};
  
  if (!src) return null;
  
  if (caption) {
    return (
      <figure className="tiptap-image my-4">
        <div className="tiptap-image-container" style={width ? { width: `${width}px` } : undefined}>
          <div className="tiptap-image-content">
            <Image 
              src={src} 
              alt={alt || caption || ''} 
              width={width || 800}
              height={height || 600}
              className="tiptap-image-img"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </div>
        <div className="tiptap-image-caption">
          <div className="tiptap-image-caption-text">
            {caption}
          </div>
        </div>
      </figure>
    );
  }
  
  return (
    <Image 
      src={src} 
      alt={alt || ''} 
      width={width || 800}
      height={height || 600}
      className="my-4 max-w-full h-auto"
      sizes="(max-width: 768px) 100vw, 768px"
    />
  );
}

// Props for the StaticContentRenderer component
interface StaticContentRendererProps {
  content: string;
  className?: string;
  emptyMessage?: string;
  errorMessage?: string;
  disableLazyLoad?: boolean; // Disable lazy loading for editor/preview contexts
}

/**
 * Server-side static content renderer using Tiptap's static renderer.
 * Converts JSON content to React elements synchronously on the server.
 * Perfect for SEO-optimized display of content in read-only views.
 * 
 * This server component ensures all list item content is rendered in the initial
 * HTML for optimal search engine indexing and Core Web Vitals performance.
 */
export function StaticContentRenderer({ 
  content, 
  className = "tiptap ProseMirror max-w-none",
  emptyMessage = "No content",
  errorMessage = "Content could not be displayed",
  disableLazyLoad = false
}: StaticContentRendererProps) {
  if (!content) {
    return (
      <div className="py-2 text-gray-500 text-sm italic">
        {emptyMessage}
      </div>
    );
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

    // Create embed component with appropriate lazy load setting
    const StaticEmbedComponent = createStaticEmbedComponent(disableLazyLoad);

    // Use Tiptap's static renderer to convert JSON to React elements
    // This works synchronously on the server!
    const reactElement = renderToReactElement({
      extensions: displayExtensions,
      content: parsedContent,
      options: {
        // Custom mapping for nodes that need special server-side rendering
        nodeMapping: {
          embedDisplay: ({ node }) => <StaticEmbedComponent node={node} />,
          aiImage: ({ node }) => <StaticAiImageComponent node={node} />,
          imageUpload: ({ node }) => <StaticImageUploadComponent node={node} />,
        },
        // Handle unhandled nodes gracefully
        unhandledNode: ({ node }) => (
          <div className="text-gray-500 text-sm italic">
            [Unsupported content: {node.type?.name || 'unknown'}]
          </div>
        ),
      },
    });

    return (
      <div className={className}>
        {reactElement}
      </div>
    );
  } catch (err) {
    console.error('Error rendering content:', err);
    return (
      <div className="py-2 text-gray-500 text-sm italic">
        {errorMessage}
      </div>
    );
  }
}

export default StaticContentRenderer;

