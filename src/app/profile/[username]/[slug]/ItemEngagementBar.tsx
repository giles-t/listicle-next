"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import React, { useState } from "react";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { toast } from "sonner";
import { ReactionBar } from "./ReactionBar";
import { usePageReactions } from "./PageReactionsContext";
import { useAuth } from "@/client/hooks/use-auth";
import { ReactionsDrawer } from "@/client/components/ReactionsDrawer";
import { CommentsDrawer } from "@/client/components/CommentsDrawer";
import { AddBookmarkButton } from "@/client/components/AddBookmarkButton";
import { Eye, Flag, Link, MessageCircle, MoreHorizontal, Share2, Smile } from "lucide-react";

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
    setCommentsCount(prev => prev + 1);
  };

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="neutral-tertiary"
            icon={<Eye />}
            onClick={() => {}}
          >
            {String(viewsCount ?? 0)}
          </Button>
          <Button
            variant="neutral-tertiary"
            icon={<Smile />}
            onClick={() => setReactionsDrawerOpen(true)}
          >
            {String(displayReactionsCount ?? 0)}
          </Button>
          <Button
            variant="neutral-tertiary"
            icon={<MessageCircle />}
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
            icon={<Share2 />}
            onClick={handleShare}
          />
          <DropdownMenuPrimitive.Root>
            <DropdownMenuPrimitive.Trigger asChild={true}>
              <IconButton
                icon={<MoreHorizontal />}
                onClick={() => {}}
              />
            </DropdownMenuPrimitive.Trigger>
            <DropdownMenuPrimitive.Portal>
              <DropdownMenuPrimitive.Content
                side="bottom"
                align="end"
                sideOffset={4}
                asChild={true}
              >
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<Link />} onClick={handleCopyLink}>
                    Copy link
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<Flag />} onClick={handleReport}>
                    Report
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
          </DropdownMenuPrimitive.Root>
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

