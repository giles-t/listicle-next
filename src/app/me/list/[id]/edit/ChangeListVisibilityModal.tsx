"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { RadioCardGroup } from "@/ui/components/RadioCardGroup";
import { Dialog } from "@/ui/components/Dialog";
import { FeatherGlobe } from "@subframe/core";
import { FeatherLock } from "@subframe/core";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIsVisible: boolean;
  onConfirm: (isVisible: boolean) => void;
  loading?: boolean;
};

function ChangeListVisibilityModal({ open, onOpenChange, initialIsVisible, onConfirm, loading = false }: Props) {
  const [selectedVisibility, setSelectedVisibility] = useState<string>(initialIsVisible ? "visible" : "hidden");

  // Reset selected visibility when modal opens
  useEffect(() => {
    if (open) {
      setSelectedVisibility(initialIsVisible ? "visible" : "hidden");
    }
  }, [open, initialIsVisible]);

  const handleConfirm = () => {
    const isVisible = selectedVisibility === "visible";
    onConfirm(isVisible);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content onInteractOutside={(event) => event.preventDefault()}>
        <div className="flex h-full w-144 flex-col items-start bg-default-background mobile:h-full mobile:w-full">
        <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-6 py-6">
          <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
            Manage list visibility
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
          <RadioCardGroup className="h-auto w-full flex-none" value={selectedVisibility} onValueChange={setSelectedVisibility}>
            <div className="flex w-full flex-col items-start gap-4">
              <RadioCardGroup.RadioCard value="visible">
                <div className="flex grow shrink-0 basis-0 items-center gap-4">
                  <IconWithBackground
                    size="medium"
                    icon={<FeatherGlobe />}
                    square={true}
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Visible
                    </span>
                    <span className="text-caption font-caption text-subtext-color">
                      Anyone can view this list on your profile and the main page
                    </span>
                  </div>
                </div>
              </RadioCardGroup.RadioCard>
              <RadioCardGroup.RadioCard value="hidden">
                <div className="flex grow shrink-0 basis-0 items-center gap-4">
                  <IconWithBackground
                    variant="neutral"
                    size="medium"
                    icon={<FeatherLock />}
                    square={true}
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Hidden
                    </span>
                    <span className="text-caption font-caption text-subtext-color">
                      Only people with the direct link can view this list
                    </span>
                  </div>
                </div>
              </RadioCardGroup.RadioCard>
            </div>
          </RadioCardGroup>
        </div>
        <div className="flex w-full items-center justify-end gap-2 border-t border-solid border-neutral-border px-6 py-6">
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
            disabled={loading}
          >
            Save changes
          </Button>
        </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

export default ChangeListVisibilityModal;
