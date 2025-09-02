"use client";
/*
 * Documentation:
 * Listicle Card — https://app.subframe.com/7b590a12c74e/library?component=Listicle+Card_e6966413-1272-4413-850f-ee9d9327e226
 * Icon Button — https://app.subframe.com/7b590a12c74e/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Avatar — https://app.subframe.com/7b590a12c74e/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Icon with background — https://app.subframe.com/7b590a12c74e/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { FeatherBookmark } from "@subframe/core";
import { IconButton } from "./IconButton";
import { Avatar } from "./Avatar";
import { FeatherEye } from "@subframe/core";
import { IconWithBackground } from "./IconWithBackground";
import { FeatherHeart } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";

interface ListicleCardRootProps
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
  className?: string;
}

const ListicleCardRoot = React.forwardRef<
  HTMLDivElement,
  ListicleCardRootProps
>(function ListicleCardRoot(
  {
    image,
    category,
    title,
    description,
    author,
    views,
    likes,
    comments,
    date,
    className,
    ...otherProps
  }: ListicleCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full min-w-[320px] flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-default-background shadow-sm",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {image ? (
        <img className="h-48 w-full flex-none object-cover" src={image} />
      ) : null}
      <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between">
            {category ? (
              <span className="text-caption-bold font-caption-bold text-brand-700">
                {category}
              </span>
            ) : null}
            <IconButton size="small" icon={<FeatherBookmark />} />
          </div>
          <div className="flex w-full flex-col items-start gap-1">
            {title ? (
              <span className="text-heading-3 font-heading-3 text-default-font">
                {title}
              </span>
            ) : null}
            {description ? (
              <span className="line-clamp-2 text-body font-body text-subtext-color">
                {description}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar
                size="small"
                image="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"
              >
                TS
              </Avatar>
              <div className="flex flex-col items-start">
                {author ? (
                  <span className="text-body-bold font-body-bold text-default-font">
                    {author}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-between">
            {date ? (
              <span className="text-caption font-caption text-subtext-color">
                {date}
              </span>
            ) : null}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <IconWithBackground icon={<FeatherEye />} />
                {views ? (
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    {views}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <IconWithBackground variant="error" icon={<FeatherHeart />} />
                {likes ? (
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    {likes}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <IconWithBackground
                  variant="neutral"
                  icon={<FeatherMessageCircle />}
                />
                {comments ? (
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    {comments}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const ListicleCard = ListicleCardRoot;
