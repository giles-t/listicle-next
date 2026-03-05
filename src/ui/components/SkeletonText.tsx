"use client";

import React from "react";
import { cn } from "../utils";

interface SkeletonTextRootProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "label" | "subheader" | "section-header" | "header"; className?: string;
}

const SkeletonTextRoot = React.forwardRef<HTMLDivElement, SkeletonTextRootProps>(
  function SkeletonTextRoot({ size = "default", className, ...otherProps }, ref) {
    return (
      <div
        className={cn("h-4 w-full animate-pulse rounded-md bg-neutral-200", {
          "h-3": size === "label",
          "h-5": size === "subheader",
          "h-6": size === "section-header",
          "h-8": size === "header",
        }, className)}
        ref={ref} {...otherProps}
      />
    );
  }
);

export const SkeletonText = SkeletonTextRoot;
