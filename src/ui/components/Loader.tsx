"use client";

import React from "react";
import { cn } from "../utils";

interface LoaderRootProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large";
  className?: string;
}

const LoaderRoot = React.forwardRef<HTMLDivElement, LoaderRootProps>(
  function LoaderRoot({ size = "medium", className, ...otherProps }: LoaderRootProps, ref) {
    return (
      <div
        className={cn(
          "inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent",
          {
            "h-6 w-6 border-[3px]": size === "large",
            "h-3 w-3": size === "small",
          },
          className
        )}
        ref={ref}
        role="status"
        aria-label="Loading"
        {...otherProps}
      />
    );
  }
);

export const Loader = LoaderRoot;
