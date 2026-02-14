"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import RichTextEditor from "@/client/components/NotionEditor";
import { StaticContentRenderer } from "@/client/components/StaticContentRenderer";
import { Button } from "@/ui/components/Button";
import { FeatherCheck, FeatherX, toast } from "@subframe/core";

interface InlineEditableDescriptionProps {
  initialValue: string | null;
  listId: string;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDescriptionChange: (newDescription: string | null) => void;
}

/**
 * Check if tiptap JSON content has meaningful text or media
 */
function contentHasText(raw: string | null): boolean {
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

export default function InlineEditableDescription({
  initialValue,
  listId,
  isActive,
  onActivate,
  onDeactivate,
  onDescriptionChange,
}: InlineEditableDescriptionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef(initialValue || "");
  const [isSaving, setIsSaving] = useState(false);

  // Keep content ref current when parent changes
  useEffect(() => {
    contentRef.current = initialValue || "";
  }, [initialValue]);

  const handleEditorUpdate = useCallback(
    (content: string) => {
      contentRef.current = content;
    },
    []
  );

  const handleSave = useCallback(async () => {
    const value = contentRef.current;
    const newDescription = value.trim() || null;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description: newDescription }),
      });
      if (!res.ok) throw new Error("Failed to update description");
      onDescriptionChange(newDescription);
      onDeactivate();
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [listId, onDescriptionChange, onDeactivate]);

  const handleCancel = useCallback(() => {
    contentRef.current = initialValue || "";
    onDeactivate();
  }, [initialValue, onDeactivate]);

  const handleClick = useCallback(() => {
    if (!isActive) {
      onActivate();
    }
  }, [isActive, onActivate]);

  const hasContent = contentHasText(initialValue);

  if (isActive) {
    return (
      <div ref={wrapperRef} className="w-full border-l-2 border-brand-600 pl-4">
        <RichTextEditor
          content={initialValue || ""}
          placeholder="Add a description..."
          onUpdate={handleEditorUpdate}
          autoFocus
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
        <p className="text-neutral-400 text-body font-body">Add a description...</p>
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
        content={initialValue || ""}
        emptyMessage=""
      />
    </div>
  );
}
