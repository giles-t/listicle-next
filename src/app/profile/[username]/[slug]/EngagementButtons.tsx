
"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { FeatherEye, FeatherMessageCircle, FeatherSmile } from "@subframe/core";

interface EngagementButtonsProps {
  viewsCount: number;
  reactionsCount: number;
  commentsCount: number;
}

export function EngagementButtons({ 
  viewsCount, 
  reactionsCount, 
  commentsCount
}: EngagementButtonsProps) {
  const handleComment = () => {
    console.log('Comment clicked');
    // TODO: Scroll to comments section
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="neutral-tertiary" icon={<FeatherEye />} onClick={() => {}}>
        {String(viewsCount ?? 0)}
      </Button>
      <Button variant="neutral-tertiary" icon={<FeatherSmile />} onClick={() => {}}>
        {String(reactionsCount ?? 0)}
      </Button>
      <Button variant="neutral-tertiary" icon={<FeatherMessageCircle />} onClick={handleComment}>
        {String(commentsCount ?? 0)}
      </Button>
    </div>
  );
}

