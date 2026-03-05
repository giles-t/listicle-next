"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../utils";

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  { children, className, ...otherProps }: ContentProps,
  ref
) {
  return children ? (
    <DialogPrimitive.Content asChild {...otherProps}>
      <div
        className={cn(
          "flex h-full min-w-[320px] flex-col items-start gap-2 border-l border-solid border-neutral-border bg-default-background animate-in slide-in-from-right duration-300",
          className
        )}
        ref={ref}
      >
        {children}
      </div>
    </DialogPrimitive.Content>
  ) : null;
});

interface DrawerRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const DrawerRoot = React.forwardRef<HTMLDivElement, DrawerRootProps>(
  function DrawerRoot(
    { children, open, onOpenChange, className, ...otherProps }: DrawerRootProps,
    ref
  ) {
    return children ? (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay asChild>
            <div
              className={cn(
                "fixed inset-0 z-50 flex h-full w-full flex-col items-end justify-center gap-2 bg-[#00000066] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                className
              )}
              ref={ref}
              {...otherProps}
            >
              {children}
            </div>
          </DialogPrimitive.Overlay>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    ) : null;
  }
);

export const Drawer = Object.assign(DrawerRoot, {
  Content,
});
