"use client";

import React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "../utils";

interface ContextItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode; icon?: React.ReactNode; className?: string;
}
const ContextItem = React.forwardRef<HTMLDivElement, ContextItemProps>(
  function ContextItem({ children, icon, className, ...otherProps }, ref) {
    return (
      <ContextMenuPrimitive.Item asChild>
        <div className={cn("flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-3 outline-none hover:bg-neutral-100 data-[highlighted]:bg-neutral-100", className)} ref={ref} {...otherProps}>
          {icon ? <span className="text-body font-body text-default-font shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">{icon}</span> : null}
          {children ? <span className="text-body font-body text-default-font">{children}</span> : null}
        </div>
      </ContextMenuPrimitive.Item>
    );
  }
);

interface ContextDividerProps extends React.HTMLAttributes<HTMLDivElement> { className?: string; }
const ContextDivider = React.forwardRef<HTMLDivElement, ContextDividerProps>(
  function ContextDivider({ className, ...otherProps }, ref) {
    return <div className={cn("flex w-full px-1 py-1", className)} ref={ref} {...otherProps}><div className="h-px w-full bg-neutral-200" /></div>;
  }
);

interface ContextMenuRootProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; className?: string; }
const ContextMenuRoot = React.forwardRef<HTMLDivElement, ContextMenuRootProps>(
  function ContextMenuRoot({ children, className, ...otherProps }, ref) {
    return children ? (
      <div className={cn("flex min-w-[192px] flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background px-1 py-1 shadow-lg", className)} ref={ref} {...otherProps}>{children}</div>
    ) : null;
  }
);

export const ContextMenu = Object.assign(ContextMenuRoot, { ContextItem, ContextDivider });
