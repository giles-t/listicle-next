"use client";

import React from "react";
import { cn } from "../utils";

interface SkeletonCircleRootProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "small" | "x-small"; className?: string;
}

const SkeletonCircleRoot = React.forwardRef<HTMLDivElement, SkeletonCircleRootProps>(
  function SkeletonCircleRoot({ size = "default", className, ...otherProps }, ref) {
    return (
      <div
        className={cn("h-9 w-9 animate-pulse rounded-full bg-neutral-200", { "h-7 w-7": size === "small", "h-5 w-5": size === "x-small" }, className)}
        ref={ref} {...otherProps}
      />
    );
  }
);

export const SkeletonCircle = SkeletonCircleRoot;
