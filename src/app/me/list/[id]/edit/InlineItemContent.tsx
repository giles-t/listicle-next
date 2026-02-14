"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import RichTextEditor from "@/client/components/NotionEditor";
import { StaticContentRenderer } from "@/client/components/StaticContentRenderer";
import { Button } from "@/ui/components/Button";
import { FeatherCheck, FeatherX, toast } from "@subframe/core";

type ListItem = {
  id: string;
  title: string;
  content: string;
  sort_order: number;
};

interface InlineItemContentProps {
  item: ListItem;
  listId: string;
  isActive: boolean;
  onActivate: (itemId: string) => void;
  onDeactivate: () => void;
  onContentChange: (itemId: string, newContent: string) => void;
}

/**
 * Check if tiptap JSON content has meaningful text or media
 */
function contentHasText(raw: string | undefined): boolean {
  if (!raw?.trim()) return false;
  try {
    const doc = JSON.parse(raw);
    const hasText = (node: any): boolean => {
      if (node.type === "text" && node.text?.trim()) return true;
      if (node.type === "image" || node.type === "embedDisplay" || node.type === "aiImage") return true;
      return node.content?.some(hasText) ?? false;
    };
    return hasText(doc);
  } catch {
    return true;
  }
}

export default function InlineItemContent({
  item,
  listId,
  isActive,
  onActivate,
  onDeactivate,
  onContentChange,
}: InlineItemContentProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef(item.content);
  const [isSaving, setIsSaving] = useState(false);

  // Keep content ref current
  useEffect(() => {
    contentRef.current = item.content;
  }, [item.content]);

  const handleEditorUpdate = useCallback(
    (content: string) => {
      contentRef.current = content;
    },
    []
  );

  const handleSave = useCallback(async () => {
    const value = contentRef.current;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: item.id, content: value }),
      });
      if (!res.ok) throw new Error("Failed to update item");
      onContentChange(item.id, value);
      onDeactivate();
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [listId, item.id, onContentChange, onDeactivate]);

  const handleCancel = useCallback(() => {
    // Revert content ref to original
    contentRef.current = item.content;
    onDeactivate();
  }, [item.content, onDeactivate]);

  const handleClick = useCallback(() => {
    if (!isActive) {
      onActivate(item.id);
    }
  }, [isActive, onActivate, item.id]);

  const hasContent = contentHasText(item.content);

  if (isActive) {
    return (
      <div ref={wrapperRef} className="w-full border-l-2 border-brand-600 pl-4">
        <RichTextEditor
          content={item.content}
          onUpdate={handleEditorUpdate}
          autoFocus
          placeholder="Add details..."
          className="w-full"
        />
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="neutral-tertiary"
            size="small"
            icon={<FeatherX />}
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="small"
            icon={<FeatherCheck />}
            onClick={handleSave}
            loading={isSaving}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div
        className="w-full cursor-text py-2"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <p className="text-neutral-400 text-body font-body">Add details...</p>
      </div>
    );
  }

  return (
    <div
      className="w-full cursor-text min-h-[2rem]"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <StaticContentRenderer
        content={item.content}
        emptyMessage=""
      />
    </div>
  );
}
