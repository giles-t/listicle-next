"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { Dialog } from "@/ui/components/Dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  initialSubtitle: string | null;
  onConfirm: (title: string, subtitle: string | null) => void;
  loading?: boolean;
};

export default function ChangeListTitleModal({ 
  open, 
  onOpenChange, 
  initialTitle, 
  initialSubtitle, 
  onConfirm, 
  loading = false 
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle || "");

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setSubtitle(initialSubtitle || "");
    }
  }, [open, initialTitle, initialSubtitle]);

  const handleSave = () => {
    // Trim and convert empty subtitle to null
    const trimmedTitle = title.trim();
    const trimmedSubtitle = subtitle.trim();
    
    if (!trimmedTitle) {
      return; // Don't allow empty titles
    }
    
    onConfirm(trimmedTitle, trimmedSubtitle || null);
  };

  const hasChanges = title.trim() !== initialTitle || (subtitle.trim() || null) !== initialSubtitle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content onInteractOutside={(event) => event.preventDefault()}>
        <div className="flex h-full w-full flex-col items-start gap-6 px-6 py-6">
        <div className="flex w-full flex-col items-start gap-1">
          <span className="text-heading-3 font-heading-3 text-default-font">
            Change title and subtitle
          </span>
          <span className="text-body font-body text-subtext-color">
            Update the main heading and description for your listicle
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-6">
          <TextField
            className="h-auto w-full flex-none"
            label="Title"
            helpText="The main heading for your listicle"
            error={!title.trim()}
          >
            <TextField.Input
              placeholder="Enter a catchy title"
              value={title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
              disabled={loading}
            />
          </TextField>
          <TextField
            className="h-auto w-full flex-none"
            label="Subtitle"
            helpText="A brief description that appears under the title (optional)"
          >
            <TextField.Input
              placeholder="Add a descriptive subtitle"
              value={subtitle}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSubtitle(event.target.value)}
              disabled={loading}
            />
          </TextField>
        </div>
        <div className="flex w-full items-center justify-end gap-2">
          <Button
            variant="neutral-tertiary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            loading={loading}
            disabled={loading || !title.trim() || !hasChanges}
          >
            Save Changes
          </Button>
        </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
