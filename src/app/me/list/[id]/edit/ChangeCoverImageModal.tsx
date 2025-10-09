"use client";

import React, { useState } from "react";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Dialog } from "@/ui/components/Dialog";
import { FeatherCheck } from "@subframe/core";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCoverImage?: string;
  availableImages: string[];
  onConfirm: (imageUrl: string) => void;
  loading?: boolean;
};

export default function ChangeCoverImageModal({
  open,
  onOpenChange,
  currentCoverImage,
  availableImages,
  onConfirm,
  loading = false,
}: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onConfirm(selectedImage);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content onInteractOutside={(event) => event.preventDefault()}>
        <div className="flex h-full w-full flex-col items-start overflow-hidden">
          <div className="flex w-full items-start justify-between border-b border-solid border-neutral-border px-6 py-6">
            <span className="text-heading-3 font-heading-3 text-default-font">
              Choose cover image
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-6 px-6 py-6 overflow-y-auto">
            {availableImages.length === 0 ? (
              <div className="flex w-full flex-col items-center justify-center py-12 text-center">
                <span className="text-body font-body text-subtext-color mb-2">
                  No images found in your list items
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  Add some images to your list items to use them as cover images
                </span>
              </div>
            ) : (
              <div className="w-full items-start gap-4 grid grid-cols-3">
                {availableImages.map((imageUrl, index) => {
                const isCurrentCover = currentCoverImage === imageUrl;
                const isSelected = selectedImage === imageUrl;
                
                return (
                  <div 
                    key={index}
                    className="flex grow shrink-0 basis-0 flex-col items-start gap-2 overflow-hidden relative cursor-pointer"
                    onClick={() => handleImageSelect(imageUrl)}
                  >
                    {isCurrentCover && (
                      <Badge className="absolute top-2 left-2 z-10">Current cover</Badge>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 w-8 h-8 bg-brand-600 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                        <FeatherCheck className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <img
                      className={`h-40 w-full flex-none rounded-md object-cover transition-all ${
                        isSelected ? 'ring-4 ring-brand-600 ring-offset-2' : 'hover:opacity-80'
                      }`}
                      src={imageUrl}
                      alt={`Cover option ${index + 1}`}
                    />
                  </div>
                );
              })}
              </div>
            )}
          </div>
          <div className="flex w-full items-center justify-end gap-2 border-t border-solid border-neutral-border px-4 py-4">
            <Button
              variant="neutral-tertiary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              loading={loading}
              disabled={loading || !selectedImage}
            >
              Set as cover
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
