"use client";

import React from "react";
import { NotionEditor as TiptapNotionEditor } from "@/src/client/tiptap/components/tiptap-templates/notion-like/notion-like-editor";

type Props = {
  content?: string;
  onUpdate?: (content: string) => void;
  // Legacy props for backward compatibility
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  aiToken?: string | null;
  onBlur?: () => void;
  autoFocus?: boolean;
};

export default function NotionEditor({
  content,
  onUpdate,
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  aiToken,
  onBlur,
  autoFocus,
}: Props) {
  // Support both new API (content/onUpdate) and legacy API (value/onChange)
  const actualContent = content ?? value;
  const actualOnUpdate = onUpdate ?? onChange;

  return (
    <div className={className}>
      <TiptapNotionEditor
        content={actualContent}
        onUpdate={actualOnUpdate}
        placeholder={placeholder}
        aiToken={aiToken}
        onBlur={onBlur}
        autoFocus={autoFocus}
      />
    </div>
  );
}
