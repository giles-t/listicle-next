"use client";

import React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronRight } from "lucide-react";
import { cn } from "../utils";

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode; icon?: React.ReactNode; selected?: boolean; className?: string;
}
const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  function Item({ label, icon, selected = false, className, ...otherProps }, ref) {
    return (
      <div className={cn("flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-3 hover:bg-neutral-100", { "bg-brand-50": selected }, className)} ref={ref} {...otherProps}>
        {icon ? <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em] text-subtext-color">{icon}</span> : null}
        {label ? <span className={cn("text-body font-body text-default-font", { "text-brand-700 font-medium": selected })}>{label}</span> : null}
      </div>
    );
  }
);

interface FolderProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode; icon?: React.ReactNode; children?: React.ReactNode; className?: string;
}
const Folder = React.forwardRef<HTMLDivElement, FolderProps>(
  function Folder({ label, icon, children, className, ...otherProps }, ref) {
    return (
      <CollapsiblePrimitive.Root asChild>
        <div className={cn("flex w-full flex-col", className)} ref={ref} {...otherProps}>
          <CollapsiblePrimitive.Trigger asChild>
            <div className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-3 hover:bg-neutral-100">
              <ChevronRight className="h-3 w-3 text-subtext-color transition-transform data-[state=open]:rotate-90" />
              {icon ? <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em] text-subtext-color">{icon}</span> : null}
              {label ? <span className="text-body font-body text-default-font">{label}</span> : null}
            </div>
          </CollapsiblePrimitive.Trigger>
          <CollapsiblePrimitive.Content>
            <div className="pl-4">{children}</div>
          </CollapsiblePrimitive.Content>
        </div>
      </CollapsiblePrimitive.Root>
    );
  }
);

interface TreeViewRootProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; className?: string; }
const TreeViewRoot = React.forwardRef<HTMLDivElement, TreeViewRootProps>(
  function TreeViewRoot({ children, className, ...otherProps }, ref) {
    return <div className={cn("flex w-full flex-col", className)} ref={ref} {...otherProps}>{children}</div>;
  }
);

export const TreeView = Object.assign(TreeViewRoot, { Folder, Item });
