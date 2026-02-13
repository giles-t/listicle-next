"use client";

import React from "react";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherFlag, FeatherLink, FeatherMoreHorizontal, FeatherShare2, toast } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { AddBookmarkButton } from "@/client/components/AddBookmarkButton";

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
    console.log('Report clicked');
    // TODO: Implement report functionality
  };

  return (
    <div className="flex items-center gap-2">
      <AddBookmarkButton
        listId={listId}
        initialBookmarked={initialBookmarked}
        initialCollectionId={initialCollectionId}
        size="medium"
      />
      <IconButton icon={<FeatherShare2 />} onClick={handleShare} />
      <SubframeCore.DropdownMenu.Root>
        <SubframeCore.DropdownMenu.Trigger asChild={true}>
          <IconButton icon={<FeatherMoreHorizontal />} onClick={() => {}} />
        </SubframeCore.DropdownMenu.Trigger>
        <SubframeCore.DropdownMenu.Portal>
          <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild={true}>
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
  );
}

