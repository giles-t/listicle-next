"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { useFollowUser } from "@/client/hooks/use-profile";
import { useAuth } from "@/client/hooks/use-auth";

interface FollowButtonProps {
  username: string;
}

export function FollowButton({ username }: FollowButtonProps) {
  const { user: currentUser } = useAuth();
  const { isFollowing, isLoading: followLoading, followUser, unfollowUser } = useFollowUser(username);

  const handleFollowClick = () => {
    if (!currentUser) {
      // Redirect to auth or show login modal
      window.location.href = '/auth';
      return;
    }

    if (isFollowing) {
      unfollowUser();
    } else {
      followUser();
    }
  };

  // Don't show follow button if user is not authenticated or if it's their own profile
  // Note: We can't check if it's own profile server-side, so we check client-side
  if (!currentUser) {
    return (
      <Button
        onClick={handleFollowClick}
        variant="brand-primary"
      >
        Follow
      </Button>
    );
  }

  // TODO: Add logic to check if viewing own profile and hide button
  return (
    <Button
      onClick={handleFollowClick}
      disabled={followLoading}
      variant={isFollowing ? "neutral-secondary" : "brand-primary"}
    >
      {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
    </Button>
  );
} 