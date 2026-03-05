"use client";

import React from "react";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { cn } from "../utils";
import { Avatar } from "./Avatar";

interface ListicleListComponentRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  image?: string;
  category?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  author?: React.ReactNode;
  views?: React.ReactNode;
  likes?: React.ReactNode;
  comments?: React.ReactNode;
  date?: React.ReactNode;
  bookmarkButton?: React.ReactNode;
  className?: string;
}

const ListicleListComponentRoot = React.forwardRef<HTMLDivElement, ListicleListComponentRootProps>(
  function ListicleListComponentRoot(
    { image, category, title, description, author, views, likes, comments, date, bookmarkButton, className, ...otherProps },
    ref
  ) {
    return (
      <div
        className={cn("group flex w-full cursor-pointer items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 hover:shadow-md", className)}
        ref={ref}
        {...otherProps}
      >
        <div className="flex h-24 w-32 flex-none items-start">
          {image ? <img className="grow shrink-0 basis-0 self-stretch rounded-md object-cover" src={image} /> : null}
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
          <div className="flex w-full flex-col items-start gap-1">
            <div className="flex w-full items-center gap-2">
              {category ? <span className="text-caption-bold font-caption-bold text-brand-600 uppercase tracking-wider">{category}</span> : null}
            </div>
            <div className="flex w-full flex-col items-start gap-1">
              {title ? <span className="line-clamp-2 text-heading-2 font-heading-2 text-default-font">{title}</span> : null}
              {description ? <span className="line-clamp-3 text-body font-body text-subtext-color">{description}</span> : null}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <Avatar size="x-small" image="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6">TS</Avatar>
            {author ? <span className="text-caption font-caption text-subtext-color">{author}</span> : null}
            <div className="flex h-3 w-px flex-none flex-col items-center bg-neutral-200" />
            {date ? <span className="text-caption font-caption text-subtext-color">{date}</span> : null}
          </div>
          <div className="flex w-full items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-subtext-color" />
                {views ? <span className="text-caption font-caption text-subtext-color">{views}</span> : null}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-error-600" />
                {likes ? <span className="text-caption font-caption text-subtext-color">{likes}</span> : null}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 text-subtext-color" />
                {comments ? <span className="text-caption font-caption text-subtext-color">{comments}</span> : null}
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-end justify-center">
              {bookmarkButton ? <div className="flex flex-col items-end justify-center">{bookmarkButton}</div> : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export const ListicleListComponent = ListicleListComponentRoot;
