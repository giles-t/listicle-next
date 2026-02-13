"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { IconButton } from "@/ui/components/IconButton";
import { List } from "@/ui/components/List";
import { TextField } from "@/ui/components/TextField";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { FeatherSearch, FeatherX } from "@subframe/core";
import { Loader } from "@/ui/components/Loader";
import Link from "next/link";

interface ReactionUser {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
}

interface ReactionWithUser {
  id: string;
  emoji: string;
  created_at: string;
  user: ReactionUser;
}

interface ReactionsDrawerProps {
  listId: string;
  itemId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function ReactionsDrawer({
  listId,
  itemId = null,
  open,
  onOpenChange,
  title = "Reactions",
}: ReactionsDrawerProps) {
  const [reactions, setReactions] = useState<ReactionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch reactions when drawer opens
  useEffect(() => {
    if (open) {
      fetchReactions();
    } else {
      // Reset state when drawer closes
      setSearchQuery("");
    }
  }, [open, listId, itemId]);

  async function fetchReactions() {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`/api/lists/${listId}/reactions/users`, window.location.origin);
      if (itemId) {
        url.searchParams.set("itemId", itemId);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch reactions");
      }

      const data = await response.json();
      setReactions(data.reactions);
    } catch (err) {
      console.error("Error fetching reactions:", err);
      setError("Failed to load reactions");
    } finally {
      setIsLoading(false);
    }
  }

  // Group reactions by user (a user may have multiple reactions)
  const groupedByUser = useMemo(() => {
    const userMap = new Map<string, { user: ReactionUser; emojis: string[] }>();

    for (const reaction of reactions) {
      const existing = userMap.get(reaction.user.id);
      if (existing) {
        existing.emojis.push(reaction.emoji);
      } else {
        userMap.set(reaction.user.id, {
          user: reaction.user,
          emojis: [reaction.emoji],
        });
      }
    }

    return Array.from(userMap.values());
  }, [reactions]);

  // Filter by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedByUser;
    }

    const query = searchQuery.toLowerCase();
    return groupedByUser.filter(
      ({ user }) =>
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }, [groupedByUser, searchQuery]);

  const totalReactions = reactions.length;

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
                {totalReactions}
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
                placeholder="Search reactions..."
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
                {searchQuery ? "No users found" : "No reactions yet"}
              </span>
            </div>
          ) : (
            <List>
              {filteredUsers.map(({ user, emojis }) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="w-full"
                >
                  <List.ListItem
                    leftSlot={
                      <Avatar
                        size="medium"
                        image={user.avatar || undefined}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    rightSlot={
                      <div className="flex items-center gap-1">
                        {emojis.map((emoji, index) => (
                          <span
                            key={index}
                            className="text-body font-body text-default-font"
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    }
                  >
                    <span className="w-full text-body-bold font-body-bold text-default-font">
                      {user.name}
                    </span>
                    <span className="w-full text-caption font-caption text-subtext-color">
                      @{user.username}
                    </span>
                  </List.ListItem>
                </Link>
              ))}
            </List>
          )}
        </div>
      </div>
    </DrawerLayout>
  );
}

export default ReactionsDrawer;
