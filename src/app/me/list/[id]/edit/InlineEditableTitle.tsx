"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/ui/components/Button";
import { FeatherCheck, FeatherX, toast } from "@subframe/core";

interface InlineEditableTitleProps {
  initialValue: string;
  listId: string;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onTitleChange: (newTitle: string) => void;
}

export default function InlineEditableTitle({
  initialValue,
  listId,
  isActive,
  onActivate,
  onDeactivate,
  onTitleChange,
}: InlineEditableTitleProps) {
  const inputRef = useRef<HTMLHeadingElement>(null);
  const draftRef = useRef(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  // Sync if parent changes initialValue externally
  useEffect(() => {
    draftRef.current = initialValue;
  }, [initialValue]);

  // Focus at end when activated
  useEffect(() => {
    if (isActive && inputRef.current) {
      const el = inputRef.current;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [isActive]);

  const handleInput = useCallback(
    (event: React.FormEvent<HTMLHeadingElement>) => {
      draftRef.current = event.currentTarget.textContent || "";
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLHeadingElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    },
    []
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLHeadingElement>) => {
      event.preventDefault();
      const text = event.clipboardData
        .getData("text/plain")
        .replace(/\n+/g, " ");
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(text);
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      draftRef.current = inputRef.current?.textContent || "";
    },
    []
  );

  const handleSave = useCallback(async () => {
    const trimmed = draftRef.current.trim();
    if (!trimmed) {
      toast.error("Title cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to update title");
      onTitleChange(trimmed);
      onDeactivate();
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [listId, onTitleChange, onDeactivate]);

  const handleCancel = useCallback(() => {
    draftRef.current = initialValue;
    onDeactivate();
  }, [initialValue, onDeactivate]);

  const handleClick = useCallback(() => {
    if (!isActive) {
      onActivate();
    }
  }, [isActive, onActivate]);

  if (isActive) {
    return (
      <div className="w-full border-l-2 border-brand-600 pl-4">
        <h1
          ref={inputRef}
          className="w-full whitespace-pre-wrap p-0 m-0 text-heading-1 font-heading-1 text-default-font font-bold outline-hidden cursor-text"
          contentEditable
          role="textbox"
          aria-label="List title"
          dir="auto"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          suppressContentEditableWarning
        >
          {initialValue}
        </h1>
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

  return (
    <div
      className="relative w-full cursor-text"
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
      {initialValue ? (
        <h1 className="text-heading-1 font-heading-1 text-default-font font-bold">
          {initialValue}
        </h1>
      ) : (
        <h1 className="text-heading-1 font-heading-1 font-bold text-neutral-400">
          Untitled list
        </h1>
      )}
    </div>
  );
}
