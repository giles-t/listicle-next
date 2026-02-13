"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/7b590a12c74e/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Bookmark List Component — https://app.subframe.com/7b590a12c74e/library?component=Bookmark+List+Component_64c934c0-3a77-4c0e-ab7c-9e90bffc19eb
 */

import React from "react";
import { FeatherEye } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";

interface BookmarkListComponentRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  image?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  collectionBadge?: React.ReactNode;
  viewCount?: React.ReactNode;
  likeCount?: React.ReactNode;
  commentCount?: React.ReactNode;
  authorName?: React.ReactNode;
  timeAgo?: React.ReactNode;
  menu?: React.ReactNode;
  category?: React.ReactNode;
  className?: string;
}

const BookmarkListComponentRoot = React.forwardRef<
  HTMLDivElement,
  BookmarkListComponentRootProps
>(function BookmarkListComponentRoot(
  {
    image,
    title,
    description,
    collectionBadge,
    viewCount,
    likeCount,
    commentCount,
    authorName,
    timeAgo,
    menu,
    category,
    className,
    ...otherProps
  }: BookmarkListComponentRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/64c934c0 flex w-full cursor-pointer items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 hover:shadow-md",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {image ? (
        <img
          className="h-24 w-32 flex-none rounded-md object-cover"
          src={image}
        />
      ) : null}
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
        <div className="flex w-full items-start gap-12">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            {title ? (
              <span className="line-clamp-1 text-heading-2 font-heading-2 text-default-font">
                {title}
              </span>
            ) : null}
            {description ? (
              <span className="line-clamp-2 text-body font-body text-subtext-color">
                {description}
              </span>
            ) : null}
          </div>
          {collectionBadge ? (
            <div className="flex items-start gap-12">{collectionBadge}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {category ? (
              <span className="text-caption-bold font-caption-bold text-brand-600">
                {category}
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
        </div>
        <div className="flex w-full items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar
              size="small"
              image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
            >
              A
            </Avatar>
            {authorName ? (
              <span className="text-caption font-caption text-subtext-color">
                {authorName}
              </span>
            ) : null}
          </div>
          <div className="flex h-4 w-px flex-none items-start bg-neutral-border" />
          {timeAgo ? (
            <span className="text-caption font-caption text-subtext-color">
              {timeAgo}
            </span>
          ) : null}
          <div className="flex grow shrink-0 basis-0 items-center justify-end gap-3">
            {menu ? (
              <div className="flex items-center justify-end gap-3">{menu}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});

export const BookmarkListComponent = BookmarkListComponentRoot;
