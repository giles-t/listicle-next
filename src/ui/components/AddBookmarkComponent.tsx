"use client";
/*
 * Documentation:
 * Add Bookmark Component — https://app.subframe.com/7b590a12c74e/library?component=Add+Bookmark+Component_b19bfa0d-56df-4889-8002-056df2a04693
 */

import React from "react";
import { FeatherBookmark } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface AddBookmarkComponentRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large";
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const AddBookmarkComponentRoot = React.forwardRef<
  HTMLDivElement,
  AddBookmarkComponentRootProps
>(function AddBookmarkComponentRoot(
  {
    size = "medium",
    active = false,
    disabled = false,
    loading = false,
    className,
    ...otherProps
  }: AddBookmarkComponentRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/b19bfa0d flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-all hover:bg-neutral-100 active:bg-transparent active:[&_path]:fill-current active:path active:transition-all",
        {
          "transition-all opacity-40 hover:bg-transparent active:path active:[&_path]:fill-current active:path active:transition-all":
            disabled,
          "[&_path]:fill-current path transition-all active:path active:[&_path]:fill-current active:path active:transition-all":
            active,
          "h-10 w-10 active:path active:[&_path]:fill-current active:path active:transition-all":
            size === "large",
          "h-6 w-6 active:path active:[&_path]:fill-current active:path active:transition-all":
            size === "small",
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <FeatherBookmark
        className={SubframeUtils.twClassNames(
          "text-body font-body text-subtext-color transition-colors",
          {
            hidden: loading,
            "text-brand-600": active,
            "text-heading-3 font-heading-3": size === "large",
            "text-caption font-caption": size === "small",
          }
        )}
      />
      <SubframeCore.Loader
        className={SubframeUtils.twClassNames(
          "hidden text-body font-body text-default-font",
          {
            "inline-block": loading,
            "text-brand-600": active,
            "text-heading-3 font-heading-3": size === "large",
            "text-caption font-caption": size === "small",
          }
        )}
      />
    </div>
  );
});

export const AddBookmarkComponent = AddBookmarkComponentRoot;
