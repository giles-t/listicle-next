"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherAlertTriangle } from "@subframe/core";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteCollectionModal({
  open,
  onOpenChange,
  collectionName,
  onConfirm,
  isDeleting,
}: Props) {
  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex w-96 flex-col items-start gap-6 px-6 py-6">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-4">
            <IconWithBackground
              variant="error"
              size="large"
              icon={<FeatherAlertTriangle />}
            />
            <span className="text-heading-3 font-heading-3 text-default-font">
              Delete Collection?
            </span>
          </div>
          <span className="text-body font-body text-subtext-color text-center">
            All bookmarks in &quot;{collectionName}&quot; will be moved to your Uncategorized
            collection. This action cannot be undone.
          </span>
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="neutral-tertiary"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive-primary"
              onClick={onConfirm}
              loading={isDeleting}
            >
              Delete Collection
            </Button>
          </div>
        </div>
      </div>
    </DialogLayout>
  );
}
