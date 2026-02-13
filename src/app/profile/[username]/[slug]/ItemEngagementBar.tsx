"use client";

import React, { useState } from "react";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
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
import { ReactionsDrawer } from "@/client/components/ReactionsDrawer";
import { CommentsDrawer } from "@/client/components/CommentsDrawer";
import { AddBookmarkButton } from "@/client/components/AddBookmarkButton";

interface ItemEngagementBarProps {
  listId: string;
  itemId: string;
  viewsCount?: number;
  reactionsCount?: number;
  commentsCount?: number;
  initialBookmarked?: boolean;
  initialCollectionId?: string | null;
}

export function ItemEngagementBar({
  listId,
  itemId,
  viewsCount = 0,
  reactionsCount = 0,
  commentsCount: initialCommentsCount = 0,
  initialBookmarked = false,
  initialCollectionId,
}: ItemEngagementBarProps) {
  const { user } = useAuth();
  const { reactions } = usePageReactions();
  const [reactionsDrawerOpen, setReactionsDrawerOpen] = useState(false);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  // Calculate total reactions count from context
  const itemReactions = reactions.items[itemId] || [];
  const totalReactionsCount = itemReactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactionsCount = totalReactionsCount > 0 ? totalReactionsCount : reactionsCount;

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

  const handleReport = () => {
    console.log('Report clicked for item:', itemId);
    // TODO: Implement report functionality
    toast.info('Report feature coming soon!');
  };

  const handleComment = () => {
    setCommentsDrawerOpen(true);
  };

  const handleCommentAdded = () => {
    // Could refresh comment count here if needed
  };

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="neutral-tertiary"
            icon={<FeatherEye />}
            onClick={() => {}}
          >
            {String(viewsCount ?? 0)}
          </Button>
          <Button
            variant="neutral-tertiary"
            icon={<FeatherSmile />}
            onClick={() => setReactionsDrawerOpen(true)}
          >
            {String(displayReactionsCount ?? 0)}
          </Button>
          <Button
            variant="neutral-tertiary"
            icon={<FeatherMessageCircle />}
            onClick={handleComment}
          >
            {String(commentsCount ?? 0)}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <AddBookmarkButton
            listId={listId}
            listItemId={itemId}
            initialBookmarked={initialBookmarked}
            initialCollectionId={initialCollectionId}
            size="medium"
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
      <ReactionsDrawer
        listId={listId}
        itemId={itemId}
        open={reactionsDrawerOpen}
        onOpenChange={setReactionsDrawerOpen}
        title="Item Reactions"
      />
      <CommentsDrawer
        listId={listId}
        itemId={itemId}
        open={commentsDrawerOpen}
        onOpenChange={setCommentsDrawerOpen}
        title="Item Comments"
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
}

