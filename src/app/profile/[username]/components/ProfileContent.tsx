"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SearchListComponent } from "@/ui/components/SearchListComponent";
import { ListicleCardComponent } from "@/ui/components/ListicleCardComponent";
import { AddBookmarkComponent } from "@/ui/components/AddBookmarkComponent";
import { FeatherArrowUpDown, FeatherChevronDown, FeatherChevronLeft, FeatherChevronRight, FeatherBookmark, FeatherVerified, FeatherUsers, FeatherUserPlus } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { formatDistanceToNow } from "date-fns";
import { formatNumber } from "@/shared/utils/format";
import { FollowButton } from "./FollowButton";
import { SocialLinks } from "./SocialLinks";
import { FollowStats } from "./FollowStats";
import { EmptyListsState } from "./EmptyListsState";
import { AddBookmarkButton } from "@/client/components/AddBookmarkButton";

type SortOption = "recent" | "popular" | "oldest";

interface UserListPreview {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image: string | null;
  is_published: boolean;
  created_at: string;
  published_at: string | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
}

interface ProfileData {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  github: string | null;
  created_at: string;
}

interface UserStats {
  listsCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followersCount: number;
  followingCount: number;
}

interface ProfileContentProps {
  profile: ProfileData;
  stats: UserStats;
  initialLists: UserListPreview[];
  initialTotal: number;
  currentUserId?: string | null;
}

const SORT_LABELS: Record<SortOption, string> = {
  recent: "Recent",
  popular: "Popular",
  oldest: "Oldest",
};

export function ProfileContent({
  profile,
  stats,
  initialLists,
  initialTotal,
  currentUserId,
}: ProfileContentProps) {
  const [lists, setLists] = useState<UserListPreview[]>(initialLists);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("recent");
  const [isLoading, setIsLoading] = useState(false);
  const perPage = 10;
  const totalPages = Math.ceil(total / perPage);

  const fetchLists = useCallback(async (newPage: number, newSort: SortOption) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/profile/${profile.username}/lists?page=${newPage}&perPage=${perPage}&sort=${newSort}`
      );
      if (response.ok) {
        const data = await response.json();
        setLists(data.lists);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile.username, perPage]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
    fetchLists(1, newSort);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchLists(newPage, sort);
    // Scroll to top of lists section
    document.getElementById("lists-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (page >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(page - 2, page - 1, page, page + 1, page + 2);
      }
    }
    return pages;
  };

  const startItem = (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, total);

  return (
    <div className="flex w-full max-w-[768px] flex-col items-start gap-12">
      {/* Profile Header */}
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-start justify-between">
          <Avatar
            size="x-large"
            image={profile.avatar || undefined}
          >
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>
          <FollowButton username={profile.username} profileUserId={profile.id} />
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              {profile.name}
            </span>
            {/* TODO: Add verification logic */}
            <FeatherVerified className="text-heading-3 font-heading-3 text-default-font" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption font-caption text-default-font">
              @{profile.username}
            </span>
            {profile.location && (
              <>
                <span className="text-caption font-caption text-default-font">
                  •
                </span>
                <span className="text-caption font-caption text-default-font">
                  {profile.location}
                </span>
              </>
            )}
          </div>
          <FollowStats
            username={profile.username}
            followersCount={stats.followersCount}
            followingCount={stats.followingCount}
            currentUserId={currentUserId}
          />
        </div>
        {profile.bio && (
          <span className="text-body font-body text-default-font">
            {profile.bio}
          </span>
        )}
        <SocialLinks
          twitter={profile.twitter}
          instagram={profile.instagram}
          linkedin={profile.linkedin}
          youtube={profile.youtube}
          github={profile.github}
          website={profile.website}
        />
      </div>

      {/* Lists Section */}
      <div id="lists-section" className="flex w-full flex-col items-start gap-6">
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border pb-4">
          <span className="text-heading-2 font-heading-2 text-default-font">
            All Lists
          </span>
          <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2">
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <Button
                  variant="neutral-secondary"
                  icon={<FeatherArrowUpDown />}
                  iconRight={<FeatherChevronDown />}
                  disabled={isLoading}
                >
                  {SORT_LABELS[sort]}
                </Button>
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem
                      icon={null}
                      onClick={() => handleSortChange("recent")}
                    >
                      Recent
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={null}
                      onClick={() => handleSortChange("popular")}
                    >
                      Popular
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={null}
                      onClick={() => handleSortChange("oldest")}
                    >
                      Oldest
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        </div>

        {lists.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className={`flex w-full flex-col items-start gap-4 mobile:hidden ${isLoading ? "opacity-50" : ""}`}>
              {lists.map((list) => (
                <Link key={list.id} href={`/@${profile.username}/${list.slug}`} className="w-full">
                  <SearchListComponent
                    image={list.cover_image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"}
                    title={list.title}
                    authorName={profile.name}
                    publishDate={list.published_at ? formatDistanceToNow(new Date(list.published_at), { addSuffix: true }) : "Draft"}
                    description={list.description || ""}
                    categories={
                      <Badge variant="neutral" icon={null}>
                        List
                      </Badge>
                    }
                    viewCount={formatNumber(list.viewsCount)}
                    likeCount={formatNumber(list.likesCount)}
                    commentCount={formatNumber(list.commentsCount)}
                    bookmark={
                      <div onClick={(e) => e.preventDefault()}>
                        <AddBookmarkButton
                          listId={list.id}
                          size="small"
                        />
                      </div>
                    }
                  />
                </Link>
              ))}
            </div>

            {/* Mobile View */}
            <div className={`hidden w-full flex-col items-start gap-4 mobile:flex ${isLoading ? "opacity-50" : ""}`}>
              {lists.map((list) => (
                <Link key={list.id} href={`/@${profile.username}/${list.slug}`} className="w-full">
                  <ListicleCardComponent
                    image={list.cover_image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"}
                    title={list.title}
                    description={list.description || ""}
                    author={profile.name}
                    views={formatNumber(list.viewsCount)}
                    likes={formatNumber(list.likesCount)}
                    comments={formatNumber(list.commentsCount)}
                    date={list.published_at ? formatDistanceToNow(new Date(list.published_at), { addSuffix: true }) : "Draft"}
                    bookmarkButton={
                      <div onClick={(e) => e.preventDefault()}>
                        <AddBookmarkButton
                          listId={list.id}
                          size="small"
                        />
                      </div>
                    }
                    category={
                      <Badge variant="neutral" icon={null}>
                        LIST
                      </Badge>
                    }
                  />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex w-full items-center justify-between border-t border-solid border-neutral-border pt-4">
                <span className="text-body font-body text-subtext-color">
                  Showing {startItem}-{endItem} of {total} lists
                </span>
                <div className="flex items-center gap-2">
                  <IconButton
                    variant="neutral-secondary"
                    size="small"
                    icon={<FeatherChevronLeft />}
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isLoading}
                  />
                  <div className="flex items-center gap-1 mobile:hidden">
                    {getPageNumbers().map((pageNum, idx) => (
                      <div
                        key={idx}
                        className={`flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-md ${
                          pageNum === page ? "bg-brand-primary" : "hover:bg-neutral-100"
                        }`}
                        onClick={() => typeof pageNum === "number" && handlePageChange(pageNum)}
                      >
                        <span
                          className={`text-body font-body ${
                            pageNum === page ? "font-body-bold text-white" : "text-default-font"
                          }`}
                        >
                          {pageNum}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="hidden text-body font-body text-default-font mobile:inline">
                    Page {page} of {totalPages}
                  </span>
                  <IconButton
                    variant="neutral-secondary"
                    size="small"
                    icon={<FeatherChevronRight />}
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages || isLoading}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyListsState
            profileName={profile.name}
            username={profile.username}
          />
        )}
      </div>
    </div>
  );
}
