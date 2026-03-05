"use client";

import React from "react";
import { Bookmark } from "lucide-react";
import { cn } from "../utils";

interface AddBookmarkComponentRootProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large"; active?: boolean; disabled?: boolean; loading?: boolean; className?: string;
}

const AddBookmarkComponentRoot = React.forwardRef<HTMLDivElement, AddBookmarkComponentRootProps>(
  function AddBookmarkComponentRoot({ size = "medium", active = false, disabled = false, loading = false, className, ...otherProps }, ref) {
    return (
      <div
        className={cn(
          "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-all hover:bg-neutral-100 active:bg-transparent",
          {
            "opacity-40 hover:bg-transparent": disabled,
            "[&_svg]:fill-current": active,
            "h-10 w-10": size === "large",
            "h-6 w-6": size === "small",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {loading ? (
          <span className={cn("h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-default-font", { "text-brand-600": active, "h-5 w-5": size === "large", "h-3 w-3": size === "small" })} />
        ) : (
          <Bookmark className={cn("h-4 w-4 text-subtext-color transition-colors", { "text-brand-600": active, "h-5 w-5": size === "large", "h-3 w-3": size === "small" })} />
        )}
      </div>
    );
  }
);

export const AddBookmarkComponent = AddBookmarkComponentRoot;
