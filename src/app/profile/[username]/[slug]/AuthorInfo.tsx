"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { format } from "date-fns";
import { useFollowUser } from "@/client/hooks/use-profile";
import { useAuth } from "@/client/hooks/use-auth";

interface AuthorInfoProps {
  username: string;
  authorUserId: string;
  authorName: string;
  authorAvatar: string | null;
  itemsCount: number;
  publishedAt: Date | null;
}

export function AuthorInfo({ username, authorUserId, authorName, authorAvatar, itemsCount, publishedAt }: AuthorInfoProps) {
  const [mounted, setMounted] = useState(false);
  const { user: currentUser, loading: authLoading } = useAuth();
  const { isFollowing, isLoading: followLoading, isInitialLoading, followUser, unfollowUser } = useFollowUser(username);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFollowClick = () => {
    if (!currentUser) {
      window.location.href = '/auth';
      return;
    }

    if (isFollowing) {
      unfollowUser();
    } else {
      followUser();
    }
  };

  const profileUrl = `/profile/${username}`;

  const isOwnProfile = currentUser?.id === authorUserId;

  const getFollowButton = () => {
    if (!mounted) {
      return null;
    }

    if (isOwnProfile) {
      return null;
    }

    if (authLoading) {
      return (
        <Button variant="brand-secondary" size="small" disabled>
          ...
        </Button>
      );
    }

    if (!currentUser) {
      return (
        <Button variant="brand-secondary" size="small" onClick={handleFollowClick}>
          Follow
        </Button>
      );
    }

    if (isInitialLoading) {
      return (
        <Button variant="brand-secondary" size="small" disabled>
          ...
        </Button>
      );
    }

    return (
      <Button
        variant={isFollowing ? "neutral-secondary" : "brand-secondary"}
        size="small"
        onClick={handleFollowClick}
        disabled={followLoading}
      >
        {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
      </Button>
    );
  };

  const followButton = getFollowButton();

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href={profileUrl} className="hover:opacity-80 transition-opacity">
          <Avatar image={authorAvatar || undefined}>
            {authorName.charAt(0).toUpperCase()}
          </Avatar>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={profileUrl} className="text-body-bold font-body-bold text-default-font hover:underline">
            {authorName}
          </Link>
          {followButton}
          <span className="text-body font-body text-subtext-color">•</span>
          <span className="text-body font-body text-subtext-color">
            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
          </span>
          {publishedAt && (
            <>
              <span className="text-body font-body text-subtext-color">•</span>
              <time 
                dateTime={publishedAt.toISOString()}
                className="text-body font-body text-subtext-color"
              >
                {format(new Date(publishedAt), 'MMM d, yyyy')}
              </time>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

