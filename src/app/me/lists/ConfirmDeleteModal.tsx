"use client";

import React, { useState } from "react";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherTrash } from "@subframe/core";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Button } from "@/ui/components/Button";

type ConfirmDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDeleteModal({ open, onOpenChange, onConfirm }: ConfirmDeleteModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex w-96 flex-col items-start gap-6 px-6 py-6">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-4">
            <IconWithBackground variant="error" size="large" icon={<FeatherTrash />} />
            <span className="text-heading-3 font-heading-3 text-default-font">Delete list?</span>
          </div>
          <span className="text-body font-body text-subtext-color">
            This action cannot be undone. The list and all its contents will be permanently deleted.
          </span>
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="neutral-tertiary"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive-primary"
              onClick={handleConfirm}
              loading={submitting}
            >
              Delete list
            </Button>
          </div>
        </div>
      </div>
    </DialogLayout>
  );
}


