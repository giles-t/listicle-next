"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../utils";

interface FullscreenDialogRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; className?: string;
}

const FullscreenDialogRoot = React.forwardRef<HTMLDivElement, FullscreenDialogRootProps>(
  function FullscreenDialogRoot({ children, open, onOpenChange, className, ...otherProps }, ref) {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay asChild>
            <div className={cn("fixed inset-0 z-50 bg-default-background", className)} ref={ref} {...otherProps}>
              <DialogPrimitive.Content asChild>
                <div className="h-full w-full">{children}</div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Overlay>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }
);

export const FullscreenDialog = FullscreenDialogRoot;
