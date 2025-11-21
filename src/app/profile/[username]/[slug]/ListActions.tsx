"use client";

import React, { useState, useEffect } from "react";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherBookmark, FeatherFlag, FeatherLink, FeatherMoreHorizontal, FeatherShare2, toast } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

interface ListActionsProps {
  listId: string;
}

export function ListActions({ listId }: ListActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch initial bookmark status
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const response = await fetch(`/api/lists/${listId}/bookmark`);
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.bookmarked);
        }
      } catch (error) {
        console.error('Error fetching bookmark status:', error);
      }
    };

    fetchBookmarkStatus();
  }, [listId]);

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

  const handleBookmark = async () => {
    // Optimistically update the UI
    const previousState = isBookmarked;
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    
    try {
      const response = await fetch(`/api/lists/${listId}/bookmark`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Show success toast
        toast.success(data.bookmarked ? 'List bookmarked' : 'Bookmark removed');
      } else if (response.status === 401) {
        // Revert the state
        setIsBookmarked(previousState);
        toast.error('Please log in to bookmark lists');
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
    console.log('Report clicked');
    // TODO: Implement report functionality
  };

  return (
    <div className="flex items-center gap-2">
      <IconButton 
        icon={
          <FeatherBookmark 
            className={isBookmarked ? "[&_path]:fill-current" : ""}
          />
        } 
        onClick={handleBookmark}
        variant={isBookmarked ? "brand-tertiary" : "neutral-tertiary"}
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

