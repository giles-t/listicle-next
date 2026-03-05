"use client";

import React from "react";
import { Eye, Heart, List as ListIcon, MessageCircle, MoreHorizontal } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../utils";
import { IconButton } from "./IconButton";

interface BookmarkCardComponentRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  image?: string; collectionBadge?: React.ReactNode; title?: React.ReactNode; description?: React.ReactNode;
  viewCount?: React.ReactNode; likeCount?: React.ReactNode; commentCount?: React.ReactNode;
  authorAvatar?: React.ReactNode; authorName?: React.ReactNode; timestamp?: React.ReactNode;
  menuActions?: React.ReactNode; showPlaceholderIcon?: boolean; category?: React.ReactNode; className?: string;
}

const BookmarkCardComponentRoot = React.forwardRef<HTMLDivElement, BookmarkCardComponentRootProps>(
  function BookmarkCardComponentRoot(
    { image, collectionBadge, title, description, viewCount, likeCount, commentCount, authorAvatar, authorName, timestamp, menuActions, showPlaceholderIcon = false, category, className, ...otherProps },
    ref
  ) {
    return (
      <div className={cn("group flex cursor-pointer flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-default-background hover:shadow-md", className)} ref={ref} {...otherProps}>
        <div className="flex h-48 w-full flex-none items-center justify-center bg-neutral-50 relative">
          <div className={cn("hidden items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", { flex: showPlaceholderIcon })}>
            <ListIcon className="h-8 w-8 text-neutral-400" />
          </div>
          {image ? <img className="grow shrink-0 basis-0 self-stretch object-cover" src={image} /> : null}
          <div className="flex items-start absolute top-3 right-3">
            {collectionBadge ? <div className="flex items-start">{collectionBadge}</div> : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-3 px-4 py-4">
          <div className="flex w-full flex-wrap items-center gap-2">
            {category ? <span className="text-caption-bold font-caption-bold text-brand-600">{category}</span> : null}
          </div>
          <div className="flex w-full flex-col items-start gap-1">
            {title ? <span className="line-clamp-1 text-heading-2 font-heading-2 text-default-font">{title}</span> : null}
            {description ? <span className="line-clamp-2 w-full text-body font-body text-subtext-color">{description}</span> : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1"><Eye className="h-3 w-3 text-subtext-color" />{viewCount ? <span className="text-caption font-caption text-subtext-color">{viewCount}</span> : null}</div>
            <div className="flex items-center gap-1"><Heart className="h-3 w-3 text-subtext-color" />{likeCount ? <span className="text-caption font-caption text-subtext-color">{likeCount}</span> : null}</div>
            <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3 text-subtext-color" />{commentCount ? <span className="text-caption font-caption text-subtext-color">{commentCount}</span> : null}</div>
          </div>
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              {authorAvatar ? <div className="flex items-center gap-2">{authorAvatar}</div> : null}
              {authorName ? <span className="text-caption font-caption text-subtext-color">{authorName}</span> : null}
            </div>
            <div className="flex items-center gap-2">
              {timestamp ? <span className="text-caption font-caption text-subtext-color">{timestamp}</span> : null}
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <IconButton variant="neutral-tertiary" size="small" icon={<MoreHorizontal />} />
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content side="bottom" align="end" sideOffset={4} asChild>
                    {menuActions ? <div className="flex items-start justify-between">{menuActions}</div> : null}
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export const BookmarkCardComponent = BookmarkCardComponentRoot;
