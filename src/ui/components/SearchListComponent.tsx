"use client";

import React from "react";
import { Eye, Heart, MessageSquare } from "lucide-react";
import { cn } from "../utils";
import { Avatar } from "./Avatar";

interface SearchListComponentRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  image?: string; title?: React.ReactNode; authorName?: React.ReactNode; publishDate?: React.ReactNode;
  description?: React.ReactNode; categories?: React.ReactNode; viewCount?: React.ReactNode;
  likeCount?: React.ReactNode; commentCount?: React.ReactNode; bookmark?: React.ReactNode; className?: string;
}

const SearchListComponentRoot = React.forwardRef<HTMLDivElement, SearchListComponentRootProps>(
  function SearchListComponentRoot(
    { image, title, authorName, publishDate, description, categories, viewCount, likeCount, commentCount, bookmark, className, ...otherProps },
    ref
  ) {
    return (
      <div className={cn("group flex w-full cursor-pointer items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 hover:shadow-md", className)} ref={ref} {...otherProps}>
        {image ? <img className="h-32 w-48 flex-none rounded-sm object-cover" src={image} /> : null}
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-3 self-stretch">
          <div className="flex w-full flex-col items-start gap-2">
            {title ? <span className="text-heading-2 font-heading-2 text-default-font">{title}</span> : null}
            <div className="flex items-center gap-2">
              <Avatar size="x-small" image="https://images.unsplash.com/photo-1494790108377-be9c29b29330">S</Avatar>
              {authorName ? <span className="text-caption font-caption text-subtext-color">{authorName}</span> : null}
              <span className="text-caption font-caption text-subtext-color">•</span>
              {publishDate ? <span className="text-caption font-caption text-subtext-color">{publishDate}</span> : null}
            </div>
          </div>
          {description ? <span className="line-clamp-2 w-full text-body font-body text-subtext-color">{description}</span> : null}
          <div className="flex w-full grow shrink-0 basis-0 items-end justify-between">
            <div className="flex items-center justify-between">
              {categories ? <div className="flex items-center gap-2">{categories}</div> : null}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-subtext-color" />
                {viewCount ? <span className="text-caption font-caption text-subtext-color">{viewCount}</span> : null}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-subtext-color" />
                {likeCount ? <span className="text-caption font-caption text-subtext-color">{likeCount}</span> : null}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-subtext-color" />
                {commentCount ? <span className="text-caption font-caption text-subtext-color">{commentCount}</span> : null}
              </div>
              {bookmark ? <div className="flex items-center gap-4">{bookmark}</div> : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export const SearchListComponent = SearchListComponentRoot;
