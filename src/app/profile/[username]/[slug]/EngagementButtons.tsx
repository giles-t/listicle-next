"use client";

import React, { useState } from "react";
import { Button } from "@/ui/components/Button";
import { FeatherEye, FeatherMessageCircle, FeatherSmile } from "@subframe/core";
import { ReactionsDrawer } from "@/client/components/ReactionsDrawer";
import { CommentsDrawer } from "@/client/components/CommentsDrawer";

interface EngagementButtonsProps {
  listId: string;
  viewsCount: number;
  reactionsCount: number;
  commentsCount: number;
}

export function EngagementButtons({ 
  listId,
  viewsCount, 
  reactionsCount, 
  commentsCount: initialCommentsCount
}: EngagementButtonsProps) {
  const [reactionsDrawerOpen, setReactionsDrawerOpen] = useState(false);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  const handleCommentAdded = () => {
    // Refresh the comments count - could be more sophisticated with a proper fetch
    // For now, we just increment optimistically
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="neutral-tertiary" icon={<FeatherEye />} onClick={() => {}}>
          {String(viewsCount ?? 0)}
        </Button>
        <Button variant="neutral-tertiary" icon={<FeatherSmile />} onClick={() => setReactionsDrawerOpen(true)}>
          {String(reactionsCount ?? 0)}
        </Button>
        <Button variant="neutral-tertiary" icon={<FeatherMessageCircle />} onClick={() => setCommentsDrawerOpen(true)}>
          {String(commentsCount ?? 0)}
        </Button>
      </div>
      <ReactionsDrawer
        listId={listId}
        itemId={null}
        open={reactionsDrawerOpen}
        onOpenChange={setReactionsDrawerOpen}
        title="Reactions"
      />
      <CommentsDrawer
        listId={listId}
        itemId={null}
        open={commentsDrawerOpen}
        onOpenChange={setCommentsDrawerOpen}
        title="Comments"
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
}

