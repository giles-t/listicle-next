"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { List } from "@/ui/components/List";
import { TextField } from "@/ui/components/TextField";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { Loader } from "@/ui/components/Loader";
import { FeatherSearch, FeatherX } from "@subframe/core";
import Link from "next/link";

export type FollowListType = "followers" | "following";

interface FollowUser {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  followed_at: string;
  isFollowing: boolean;
}

interface FollowersDrawerProps {
  username: string;
  type: FollowListType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string | null;
}

export function FollowersDrawer({
  username,
  type,
  open,
  onOpenChange,
  currentUserId,
}: FollowersDrawerProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(new Set());

  // Fetch followers/following when drawer opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    } else {
      // Reset state when drawer closes
      setSearchQuery("");
    }
  }, [open, username, type]);

  async function fetchUsers() {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = type === "followers" ? "followers" : "following";
      const response = await fetch(`/api/profile/${username}/${endpoint}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }

      const data = await response.json();
      setUsers(type === "followers" ? data.followers : data.following);
      setTotal(data.total);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(`Failed to load ${type}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle follow/unfollow
  const handleFollowToggle = useCallback(async (targetUsername: string, isCurrentlyFollowing: boolean) => {
    if (!currentUserId) {
      // Could redirect to login or show a message
      return;
    }

    // Prevent duplicate requests
    if (followingInProgress.has(targetUsername)) {
      return;
    }

    setFollowingInProgress(prev => new Set(prev).add(targetUsername));

    try {
      const method = isCurrentlyFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/profile/${targetUsername}/follow`, {
        method,
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.username === targetUsername
            ? { ...user, isFollowing: !isCurrentlyFollowing }
            : user
        )
      );
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowingInProgress(prev => {
        const next = new Set(prev);
        next.delete(targetUsername);
        return next;
      });
    }
  }, [currentUserId, followingInProgress]);

  // Filter by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase();
    return users.filter(
      user =>
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const title = type === "followers" ? "Followers" : "Following";

  return (
    <DrawerLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full min-w-[320px] max-w-[448px] flex-col items-start bg-default-background">
        {/* Header */}
        <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
          <div className="flex w-full items-center gap-2 px-4 py-4">
            <IconButton
              icon={<FeatherX />}
              onClick={() => onOpenChange(false)}
            />
            <div className="flex grow shrink-0 basis-0 items-center gap-2">
              <span className="text-heading-3 font-heading-3 text-default-font">
                {title}
              </span>
              <span className="text-body font-body text-subtext-color">
                {total.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-2 px-4 pt-2 pb-4">
            <TextField
              className="h-auto w-full flex-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input
                placeholder={`Search ${type}...`}
                value={searchQuery}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(event.target.value)
                }
              />
            </TextField>
          </div>
        </div>

        {/* Content */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start bg-default-background overflow-y-auto">
          {isLoading ? (
            <div className="flex w-full items-center justify-center py-12">
              <Loader size="medium" />
            </div>
          ) : error ? (
            <div className="flex w-full items-center justify-center py-12">
              <span className="text-body font-body text-error-600">{error}</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex w-full items-center justify-center py-12">
              <span className="text-body font-body text-subtext-color">
                {searchQuery
                  ? "No users found"
                  : type === "followers"
                  ? "No followers yet"
                  : "Not following anyone yet"}
              </span>
            </div>
          ) : (
            <List>
              {filteredUsers.map(user => {
                const isCurrentUser = currentUserId === user.id;
                const isInProgress = followingInProgress.has(user.username);

                return (
                  <List.ListItem
                    key={user.id}
                    leftSlot={
                      <Link href={`/profile/${user.username}`}>
                        <Avatar size="medium" image={user.avatar || undefined}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Link>
                    }
                    rightSlot={
                      !isCurrentUser && currentUserId ? (
                        <Button
                          variant={user.isFollowing ? "neutral-secondary" : "brand-primary"}
                          size="small"
                          loading={isInProgress}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleFollowToggle(user.username, user.isFollowing);
                          }}
                        >
                          {user.isFollowing ? "Following" : "Follow"}
                        </Button>
                      ) : null
                    }
                  >
                    <Link
                      href={`/profile/${user.username}`}
                      className="flex flex-col w-full"
                    >
                      <span className="w-full text-body-bold font-body-bold text-default-font">
                        {user.name}
                      </span>
                      <span className="w-full text-caption font-caption text-subtext-color">
                        @{user.username}
                      </span>
                    </Link>
                  </List.ListItem>
                );
              })}
            </List>
          )}
        </div>
      </div>
    </DrawerLayout>
  );
}

export default FollowersDrawer;
