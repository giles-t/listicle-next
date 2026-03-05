"use client";

import React from "react";
import { Dialog } from "../components/Dialog";

interface DialogLayoutRootProps extends React.ComponentProps<typeof Dialog> {
  children?: React.ReactNode;
  className?: string;
}

const DialogLayoutRoot = React.forwardRef<
  React.ElementRef<typeof Dialog>,
  DialogLayoutRootProps
>(function DialogLayoutRoot({ children, className, ...otherProps }, ref) {
  return (
    <Dialog className={className} ref={ref} {...otherProps}>
      <Dialog.Content>
        {children ? (
          <div className="flex w-full grow shrink-0 basis-0 items-start gap-6">
            {children}
          </div>
        ) : null}
      </Dialog.Content>
    </Dialog>
  );
});

export const DialogLayout = DialogLayoutRoot;
