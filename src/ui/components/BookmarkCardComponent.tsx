"use client";
/*
 * Documentation:
 * Bookmark Card Component — https://app.subframe.com/7b590a12c74e/library?component=Bookmark+Card+Component_a308154b-9a4b-4c67-a92b-041124dc94e0
 * Icon Button — https://app.subframe.com/7b590a12c74e/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import { FeatherEye } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherList } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconButton } from "./IconButton";

interface BookmarkCardComponentRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  image?: string;
  collectionBadge?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  viewCount?: React.ReactNode;
  likeCount?: React.ReactNode;
  commentCount?: React.ReactNode;
  authorAvatar?: React.ReactNode;
  authorName?: React.ReactNode;
  timestamp?: React.ReactNode;
  menuActions?: React.ReactNode;
  showPlaceholderIcon?: boolean;
  category?: React.ReactNode;
  className?: string;
}

const BookmarkCardComponentRoot = React.forwardRef<
  HTMLDivElement,
  BookmarkCardComponentRootProps
>(function BookmarkCardComponentRoot(
  {
    image,
    collectionBadge,
    title,
    description,
    viewCount,
    likeCount,
    commentCount,
    authorAvatar,
    authorName,
    timestamp,
    menuActions,
    showPlaceholderIcon = false,
    category,
    className,
    ...otherProps
  }: BookmarkCardComponentRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/a308154b flex cursor-pointer flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-default-background hover:shadow-md",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex h-48 w-full flex-none items-center justify-center bg-neutral-50 relative">
        <div
          className={SubframeUtils.twClassNames(
            "hidden items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            { flex: showPlaceholderIcon }
          )}
        >
          <FeatherList className="text-heading-1 font-heading-1 text-neutral-400" />
        </div>
        {image ? (
          <img
            className="grow shrink-0 basis-0 self-stretch object-cover"
            src={image}
          />
        ) : null}
        <div className="flex items-start absolute top-3 right-3">
          {collectionBadge ? (
            <div className="flex items-start">{collectionBadge}</div>
          ) : null}
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-3 px-4 py-4">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {category ? (
              <span className="text-caption-bold font-caption-bold text-brand-600">
                {category}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-1">
          <div className="flex w-full items-start justify-between">
            {title ? (
              <span className="line-clamp-1 text-heading-2 font-heading-2 text-default-font">
                {title}
              </span>
            ) : null}
          </div>
          {description ? (
            <span className="line-clamp-2 w-full text-body font-body text-subtext-color">
              {description}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FeatherEye className="text-caption font-caption text-subtext-color" />
            {viewCount ? (
              <span className="text-caption font-caption text-subtext-color">
                {viewCount}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <FeatherHeart className="text-caption font-caption text-subtext-color" />
            {likeCount ? (
              <span className="text-caption font-caption text-subtext-color">
                {likeCount}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <FeatherMessageCircle className="text-caption font-caption text-subtext-color" />
            {commentCount ? (
              <span className="text-caption font-caption text-subtext-color">
                {commentCount}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {authorAvatar ? (
              <div className="flex items-center gap-2">{authorAvatar}</div>
            ) : null}
            {authorName ? (
              <span className="text-caption font-caption text-subtext-color">
                {authorName}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {timestamp ? (
              <span className="text-caption font-caption text-subtext-color">
                {timestamp}
              </span>
            ) : null}
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton
                  variant="neutral-tertiary"
                  size="small"
                  icon={<FeatherMoreHorizontal />}
                />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild={true}
                >
                  {menuActions ? (
                    <div className="flex items-start justify-between">
                      {menuActions}
                    </div>
                  ) : null}
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        </div>
      </div>
    </div>
  );
});

export const BookmarkCardComponent = BookmarkCardComponentRoot;
