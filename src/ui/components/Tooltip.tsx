"use client";

import React from "react";
import { cn } from "../utils";

interface TooltipRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode; className?: string;
}

const TooltipRoot = React.forwardRef<HTMLDivElement, TooltipRootProps>(
  function TooltipRoot({ children, className, ...otherProps }, ref) {
    return (
      <div className={cn("rounded-md bg-neutral-900 px-2 py-1 shadow-md", className)} ref={ref} {...otherProps}>
        {children ? <span className="text-caption font-caption text-white">{children}</span> : null}
      </div>
    );
  }
);

export const Tooltip = TooltipRoot;
