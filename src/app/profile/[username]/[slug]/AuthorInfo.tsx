"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { LinkButton } from "@/ui/components/LinkButton";
import { formatDistanceToNow } from "date-fns";

interface AuthorInfoProps {
  authorName: string;
  authorAvatar: string | null;
  readTime: number;
  publishedAt: Date | null;
}

export function AuthorInfo({ authorName, authorAvatar, readTime, publishedAt }: AuthorInfoProps) {
  const handleFollow = () => {
    console.log('Follow clicked');
    // TODO: Implement follow functionality
  };

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar image={authorAvatar || undefined}>
          {authorName.charAt(0).toUpperCase()}
        </Avatar>
        <div className="flex items-center gap-2">
          <span className="text-body-bold font-body-bold text-default-font">
            {authorName}
          </span>
          <LinkButton onClick={handleFollow}>
            Follow
          </LinkButton>
          <span className="text-body font-body text-subtext-color">•</span>
          <span className="text-body font-body text-subtext-color">
            {readTime} min read
          </span>
          {publishedAt && (
            <>
              <span className="text-body font-body text-subtext-color">•</span>
              <time 
                dateTime={publishedAt.toISOString()}
                className="text-body font-body text-subtext-color"
              >
                {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
              </time>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

