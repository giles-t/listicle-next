"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { useFollowUser } from "@/client/hooks/use-profile";
import { useAuth } from "@/client/hooks/use-auth";

interface FollowButtonProps {
  username: string;
  profileUserId: string;
}

export function FollowButton({ username, profileUserId }: FollowButtonProps) {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { isFollowing, isLoading: followLoading, isInitialLoading, followUser, unfollowUser } = useFollowUser(username);

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

  // Don't render anything while auth is loading to prevent flash
  if (authLoading) {
    return null;
  }

  // Don't show follow button if viewing own profile
  if (currentUser?.id === profileUserId) {
    return null;
  }

  // Show follow button for non-authenticated users (will redirect to auth on click)
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

  // Wait for initial follow status to load for authenticated users
  if (isInitialLoading) {
    return (
      <Button
        disabled
        variant="neutral-secondary"
      >
        ...
      </Button>
    );
  }

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