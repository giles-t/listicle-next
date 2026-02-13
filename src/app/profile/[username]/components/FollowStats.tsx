"use client";

import React, { useState } from "react";
import { FeatherUsers, FeatherUserPlus } from "@subframe/core";
import { formatNumber } from "@/shared/utils/format";
import { FollowersDrawer, FollowListType } from "@/client/components/FollowersDrawer";

interface FollowStatsProps {
  username: string;
  followersCount: number;
  followingCount: number;
  currentUserId?: string | null;
}

export function FollowStats({
  username,
  followersCount,
  followingCount,
  currentUserId,
}: FollowStatsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<FollowListType>("followers");

  const openDrawer = (type: FollowListType) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() => openDrawer("followers")}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          <FeatherUsers className="text-body font-body text-subtext-color" />
          <span className="text-body-bold font-body-bold text-default-font">
            {formatNumber(followersCount)}
          </span>
          <span className="text-body font-body text-subtext-color">
            followers
          </span>
        </button>
        <button
          onClick={() => openDrawer("following")}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          <FeatherUserPlus className="text-body font-body text-subtext-color" />
          <span className="text-body-bold font-body-bold text-default-font">
            {formatNumber(followingCount)}
          </span>
          <span className="text-body font-body text-subtext-color">
            following
          </span>
        </button>
      </div>

      <FollowersDrawer
        username={username}
        type={drawerType}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        currentUserId={currentUserId}
      />
    </>
  );
}
