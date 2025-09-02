"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/ui/components/Button";
import { Loader } from "@/ui/components/Loader";
 
import { FeatherCheck, FeatherX, FeatherPlus, toast } from "@subframe/core";

type Props = {
  listId: string;
  onAdded?: (item: { id: string; title: string; content: string; sort_order: number }) => void;
};

export default function NewListItemForm({ listId, onAdded }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // next tick to ensure element is mounted
      if (inputRef.current) {
        inputRef.current.textContent = newItemTitle;
      }
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    const title = newItemTitle.trim();
    if (!title) {
      toast.error("Title is required");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.error || "Failed to add item");
      }
      const data = (await res.json()) as { item: { id: string; title: string; content: string; sort_order: number } };
      setNewItemTitle("");
      toast.success("Item added");
      setIsOpen(false);
      onAdded?.(data.item);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {!isOpen ? (
        <div className="flex w-full flex-col items-center justify-center gap-2 px-1 py-1">
          <Button
            className="h-12 w-auto flex-none rounded-full"
            variant="neutral-secondary"
            icon={<FeatherPlus />}
            onClick={() => setIsOpen(true)}
          >
            New Item
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <form ref={formRef} className="flex w-full max-w-[768px] flex-col items-start gap-6" onSubmit={handleSubmit}>
            <div className="relative w-full">
              {newItemTitle === "" ? (
                <span className="pointer-events-none absolute left-0 top-0 text-heading-2 font-heading-2 text-neutral-400">
                  New Item Title
                </span>
              ) : null}
              <div
                className="w-full whitespace-pre-wrap p-0 text-heading-2 font-heading-2 text-default-font outline-none"
                contentEditable={!isSubmitting}
                aria-label="New Item Title"
                aria-multiline="true"
                dir="auto"
                role="textbox"
                ref={inputRef}
                onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (!isSubmitting) {
                      formRef.current?.requestSubmit();
                    }
                  }
                }}
                onInput={(event: React.FormEvent<HTMLDivElement>) => {
                  const text = event.currentTarget.textContent || "";
                  setNewItemTitle(text);
                }}
                onPaste={(event: React.ClipboardEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  const text = event.clipboardData
                    .getData("text/plain")
                    .replace(/\n+/g, " ");
                  const selection = window.getSelection();
                  if (!selection) return;
                  if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    const node = document.createTextNode(text);
                    range.insertNode(node);
                    range.setStartAfter(node);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    // Sync state so placeholder hides immediately
                    if (inputRef.current) {
                      setNewItemTitle(inputRef.current.textContent || "");
                    }
                  }
                }}
                suppressContentEditableWarning
              />
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  className="h-12 w-auto flex-none rounded-full"
                  variant="brand-tertiary"
                  icon={<FeatherCheck />}
                  type="submit"
                  loading={isSubmitting}
                >
                  Add Item
                </Button>
                <Button
                  className="h-12 w-auto flex-none rounded-full"
                  variant="neutral-tertiary"
                  icon={<FeatherX />}
                  type="button"
                  onClick={() => {
                    setNewItemTitle("");
                    if (inputRef.current) inputRef.current.textContent = "";
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
