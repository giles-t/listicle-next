"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import React from "react";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { toast } from "sonner";
import { AddBookmarkButton } from "@/client/components/AddBookmarkButton";
import { Flag, Link, MoreHorizontal, Share2 } from "lucide-react";

interface ListActionsProps {
  listId: string;
  initialBookmarked?: boolean;
  initialCollectionId?: string | null;
}

export function ListActions({ listId, initialBookmarked, initialCollectionId }: ListActionsProps) {
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleReport = () => {
    toast.info('Report feature coming soon!');
  };

  return (
    <div className="flex items-center gap-2">
      <AddBookmarkButton
        listId={listId}
        initialBookmarked={initialBookmarked}
        initialCollectionId={initialCollectionId}
        size="medium"
      />
      <IconButton icon={<Share2 />} onClick={handleShare} />
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild={true}>
          <IconButton icon={<MoreHorizontal />} onClick={() => {}} />
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content side="bottom" align="end" sideOffset={4} asChild={true}>
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
  );
}

