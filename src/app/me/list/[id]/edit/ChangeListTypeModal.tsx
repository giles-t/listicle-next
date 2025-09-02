"use client";

import React, { useEffect, useState } from "react";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { RadioCardGroup } from "@/ui/components/RadioCardGroup";
import { Button } from "@/ui/components/Button";
import { FeatherList, FeatherListOrdered, FeatherListStart } from "@subframe/core";

export type ListType = "unordered" | "ordered" | "reversed";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: ListType;
  onConfirm: (value: ListType) => void;
};

export default function ChangeListTypeModal({ open, onOpenChange, initialValue, onConfirm }: Props) {
  const [value, setValue] = useState<ListType>(initialValue);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full flex-col items-start gap-6 bg-default-background px-6 py-6">
        <span className="text-heading-3 font-heading-3 text-default-font">Change list type</span>
        <div className="flex w-full flex-col items-start gap-4">
          <RadioCardGroup className="h-auto w-full flex-none" value={value} onValueChange={(v: ListType) => setValue(v)}>
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
              <RadioCardGroup.RadioCard hideRadio={true} value="unordered">
                <div className="flex grow shrink-0 basis-0 items-center gap-4">
                  <IconWithBackground variant="neutral" size="medium" icon={<FeatherList />} square={true} />
                  <div className="flex flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">Bullet list</span>
                    <span className="text-caption font-caption text-subtext-color">List has bullet points</span>
                  </div>
                </div>
              </RadioCardGroup.RadioCard>
              <RadioCardGroup.RadioCard hideRadio={true} value="ordered">
                <div className="flex grow shrink-0 basis-0 items-center gap-4">
                  <IconWithBackground variant="neutral" size="medium" icon={<FeatherListOrdered />} square={true} />
                  <div className="flex grow shrink-0 basis-0 flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">Ordered list</span>
                    <span className="text-caption font-caption text-subtext-color">List is ordered 1, 2, 3, 4, 5</span>
                  </div>
                </div>
              </RadioCardGroup.RadioCard>
              <RadioCardGroup.RadioCard hideRadio={true} value="reversed">
                <div className="flex grow shrink-0 basis-0 items-center gap-4">
                  <IconWithBackground variant="neutral" size="medium" icon={<FeatherListStart />} square={true} />
                  <div className="flex grow shrink-0 basis-0 flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">Reverse ordered list</span>
                    <span className="text-caption font-caption text-subtext-color">List is ordered 5, 4, 3, 2, 1</span>
                  </div>
                </div>
              </RadioCardGroup.RadioCard>
            </div>
          </RadioCardGroup>
        </div>
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="neutral-tertiary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(value)}>Confirm</Button>
        </div>
      </div>
    </DialogLayout>
  );
}


