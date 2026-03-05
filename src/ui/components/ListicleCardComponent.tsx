"use client";

import React from "react";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { cn } from "../utils";
import { Avatar } from "./Avatar";

interface ListicleCardComponentRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  image?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  author?: React.ReactNode;
  views?: React.ReactNode;
  likes?: React.ReactNode;
  comments?: React.ReactNode;
  date?: React.ReactNode;
  bookmarkButton?: React.ReactNode;
  category?: React.ReactNode;
  className?: string;
}

const ListicleCardComponentRoot = React.forwardRef<HTMLDivElement, ListicleCardComponentRootProps>(
  function ListicleCardComponentRoot(
    { image, title, description, author, views, likes, comments, date, bookmarkButton, category, className, ...otherProps },
    ref
  ) {
    return (
      <div
        className={cn(
          "group flex w-full min-w-[320px] cursor-pointer flex-col items-start overflow-hidden rounded-lg border border-solid border-neutral-border bg-default-background transition-all hover:shadow-lg",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex h-56 w-full flex-none items-start relative">
          {image ? <img className="grow shrink-0 basis-0 self-stretch object-cover" src={image} /> : null}
        </div>
        <div className="flex w-full flex-col items-start gap-5 px-6 py-6">
          <div className="flex w-full flex-col items-start gap-3">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center justify-between">
                {category ? <div className="flex items-center justify-between">{category}</div> : null}
              </div>
              {bookmarkButton ? <div className="flex items-center justify-between">{bookmarkButton}</div> : null}
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              {title ? <span className="line-clamp-2 text-heading-2 font-heading-2 text-default-font">{title}</span> : null}
              {description ? <span className="line-clamp-2 text-body font-body text-subtext-color">{description}</span> : null}
            </div>
          </div>
          <div className="flex h-px w-full flex-none items-start bg-neutral-200" />
          <div className="flex w-full items-center gap-3">
            <div className="flex grow shrink-0 basis-0 items-center gap-3">
              <Avatar size="medium" image="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6">TS</Avatar>
              <div className="flex grow shrink-0 basis-0 flex-col items-start justify-center">
                {author ? <span className="text-body-bold font-body-bold text-default-font">{author}</span> : null}
                {date ? <span className="text-caption font-caption text-subtext-color">{date}</span> : null}
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 items-center justify-end gap-5">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-subtext-color" />
                {views ? <span className="text-caption font-caption text-subtext-color">{views}</span> : null}
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-subtext-color" />
                {likes ? <span className="text-caption font-caption text-subtext-color">{likes}</span> : null}
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-subtext-color" />
                {comments ? <span className="text-caption font-caption text-subtext-color">{comments}</span> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export const ListicleCardComponent = ListicleCardComponentRoot;
