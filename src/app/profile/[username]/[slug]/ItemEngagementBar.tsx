"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherBookmark } from "@subframe/core";
import { FeatherEye } from "@subframe/core";
import { FeatherFlag } from "@subframe/core";
import { FeatherLink } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherShare2 } from "@subframe/core";
import { FeatherSmile } from "@subframe/core";
import { toast } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { ReactionBar } from "./ReactionBar";
import { usePageReactions } from "./PageReactionsContext";
import { useAuth } from "@/client/hooks/use-auth";

interface ItemEngagementBarProps {
  listId: string;
  itemId: string;
  viewsCount?: number;
  reactionsCount?: number;
  commentsCount?: number;
  initialBookmarked?: boolean;
}

export function ItemEngagementBar({
  listId,
  itemId,
  viewsCount = 0,
  reactionsCount = 0,
  commentsCount = 0,
  initialBookmarked = false,
}: ItemEngagementBarProps) {
  const { user } = useAuth();
  const { reactions } = usePageReactions();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoadingBookmark, setIsLoadingBookmark] = useState(false);

  // Calculate total reactions count from context
  const itemReactions = reactions.items[itemId] || [];
  const totalReactionsCount = itemReactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactionsCount = totalReactionsCount > 0 ? totalReactionsCount : reactionsCount;

  // Update bookmark state when initialBookmarked prop changes (e.g., after server-side fetch)
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#item-${itemId}`;
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        const url = `${window.location.origin}${window.location.pathname}#item-${itemId}`;
        await navigator.share({
          title: document.title,
          url: url,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please log in to bookmark items');
      return;
    }

    // Optimistically update the UI
    const previousState = isBookmarked;
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    
    try {
      const response = await fetch(`/api/lists/${listId}/items/${itemId}/bookmark`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? 'Item bookmarked' : 'Bookmark removed');
      } else if (response.status === 401) {
        // Revert the state
        setIsBookmarked(previousState);
        toast.error('Please log in to bookmark items');
      } else {
        // Revert the state
        setIsBookmarked(previousState);
        toast.error('Failed to update bookmark');
      }
    } catch (error) {
      // Revert the state
      setIsBookmarked(previousState);
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleReport = () => {
    console.log('Report clicked for item:', itemId);
    // TODO: Implement report functionality
    toast.info('Report feature coming soon!');
  };

  const handleComment = () => {
    // Scroll to comments section or open comment modal
    const commentSection = document.getElementById(`comments-${itemId}`);
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // TODO: Open comment modal or scroll to general comments
      toast.info('Comments feature coming soon!');
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="neutral-tertiary"
            icon={<FeatherEye />}
            onClick={() => {}}
          >
            {viewsCount}
          </Button>
          <Button
            variant="neutral-tertiary"
            icon={<FeatherSmile />}
            onClick={() => {}}
          >
            {displayReactionsCount}
          </Button>
          <Button
            variant="neutral-tertiary"
            icon={<FeatherMessageCircle />}
            onClick={handleComment}
          >
            {commentsCount}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            icon={
              <FeatherBookmark 
                className={isBookmarked ? "[&_path]:fill-current" : ""}
              />
            }
            onClick={handleBookmark}
            variant={isBookmarked ? "brand-tertiary" : "neutral-tertiary"}
            disabled={isLoadingBookmark}
          />
          <IconButton
            icon={<FeatherShare2 />}
            onClick={handleShare}
          />
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <IconButton
                icon={<FeatherMoreHorizontal />}
                onClick={() => {}}
              />
            </SubframeCore.DropdownMenu.Trigger>
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content
                side="bottom"
                align="end"
                sideOffset={4}
                asChild={true}
              >
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<FeatherLink />} onClick={handleCopyLink}>
                    Copy link
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherFlag />} onClick={handleReport}>
                    Report
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
      </div>
      <ReactionBar listId={listId} targetId={itemId} userId={user?.id} />
    </div>
  );
}

