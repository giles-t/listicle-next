"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { FullscreenDialog } from "@/ui/components/FullscreenDialog";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherX } from "@subframe/core";
import RichTextEditor from "@/client/components/NotionEditor";

type ListItem = {
  id: string;
  title: string;
  content: string;
  sort_order: number;
};

type Props = {
  item: ListItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (itemId: string, content: string) => void;
  lastEditedBy?: string;
};

export default function ListItemEditDialog({ 
  item, 
  isOpen, 
  onOpenChange, 
  onSave,
  lastEditedBy = "Unknown User"
}: Props) {
  const [content, setContent] = React.useState("");

  // Update content when item changes
  React.useEffect(() => {
    if (item) {
      setContent(item.content || "");
    }
  }, [item]);

  const handleSave = () => {
    if (item) {
      onSave(item.id, content);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (item) {
      setContent(item.content || ""); // Reset to original content
    }
    onOpenChange(false);
  };

  if (!item) {
    return null;
  }

  return (
    <FullscreenDialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
    >
      {/* Header */}
      <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-4 py-4">
        <span className="text-heading-2 font-heading-2 text-default-font">
          {item.title}
        </span>
        <IconButton
          icon={<FeatherX />}
          onClick={handleCancel}
        />
      </div>
      
      {/* Content Area */}
      <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-center gap-12 py-12 overflow-auto">
        <div className="flex w-full max-w-[768px] grow shrink-0 basis-0 flex-col items-start gap-6">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write details…"
            className="w-full"
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex w-full items-center justify-between border-t border-solid border-neutral-border px-4 py-4">
        <span className="text-body font-body text-subtext-color">
          Last edited by {lastEditedBy}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="neutral-secondary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </FullscreenDialog>
  );
}
