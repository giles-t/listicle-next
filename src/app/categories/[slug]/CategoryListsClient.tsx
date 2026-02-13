"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { ListicleCardComponent as ListicleCard } from "@/ui/components/ListicleCardComponent";
import { AddBookmarkButton } from "@/client/components/AddBookmarkButton";
import {
  FeatherChevronDown,
  FeatherChevronRight,
  FeatherClock,
  FeatherEye,
  FeatherFileText,
  FeatherHeart,
  FeatherTrendingUp,
  FeatherUserPlus,
  FeatherUsers,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { toast } from "@subframe/core";
import { formatNumber } from "@/shared/utils/format";
import { formatDistanceToNow } from "date-fns";

export interface CategoryList {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image: string | null;
  published_at: Date | null;
  view_count: number;
  likesCount: number;
  commentsCount: number;
  author: {
    username: string;
    name: string;
    avatar: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  followerCount: number;
  listCount: number;
  isFollowing: boolean;
}

type SortOption = "trending" | "views" | "likes" | "newest";

interface CategoryListsClientProps {
  category: Category;
  initialLists: CategoryList[];
}

export function CategoryListsClient({
  category: initialCategory,
  initialLists,
}: CategoryListsClientProps) {
  const [category, setCategory] = useState(initialCategory);
  const [lists, setLists] = useState<CategoryList[]>(initialLists);
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialLists.length >= 12);
  const [offset, setOffset] = useState(initialLists.length);

  const handleFollow = async () => {
    setIsFollowingLoading(true);

    // Optimistic update
    const wasFollowing = category.isFollowing;
    setCategory((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      followerCount: wasFollowing
        ? prev.followerCount - 1
        : prev.followerCount + 1,
    }));

    try {
      const response = await fetch(`/api/categories/${category.id}/follow`, {
        method: wasFollowing ? "DELETE" : "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          // Revert optimistic update
          setCategory((prev) => ({
            ...prev,
            isFollowing: wasFollowing,
            followerCount: wasFollowing
              ? prev.followerCount + 1
              : prev.followerCount - 1,
          }));
          toast.error("Please sign in to follow categories");
          return;
        }
        throw new Error(data.error || "Failed to update follow status");
      }

      toast.success(
        wasFollowing ? "Unfollowed category" : "Following category"
      );
    } catch (error) {
      // Revert optimistic update on error
      setCategory((prev) => ({
        ...prev,
        isFollowing: wasFollowing,
        followerCount: wasFollowing
          ? prev.followerCount + 1
          : prev.followerCount - 1,
      }));
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleSortChange = async (newSort: SortOption) => {
    if (newSort === sortBy) return;

    setSortBy(newSort);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/categories/${category.id}/lists?sortBy=${newSort}&limit=12&offset=0`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch lists");
      }

      const data = await response.json();
      setLists(data.lists);
      setHasMore(data.pagination.hasMore);
      setOffset(data.lists.length);
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to load lists");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/categories/${category.id}/lists?sortBy=${sortBy}&limit=12&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch more lists");
      }

      const data = await response.json();
      setLists((prev) => [...prev, ...data.lists]);
      setHasMore(data.pagination.hasMore);
      setOffset((prev) => prev + data.lists.length);
    } catch (error) {
      console.error("Error fetching more lists:", error);
      toast.error("Failed to load more lists");
    } finally {
      setIsLoading(false);
    }
  };

  const sortLabel = {
    trending: "Trending",
    views: "Most Views",
    likes: "Most Likes",
    newest: "Newest",
  }[sortBy];

  return (
    <div className="container max-w-none flex h-full w-full flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
      <div className="flex w-full flex-col items-start gap-6">
        {/* Breadcrumbs */}
        <div className="flex w-full items-center gap-2">
          <Link
            href="/"
            className="text-body font-body text-neutral-700 hover:text-brand-700 hover:underline"
          >
            Home
          </Link>
          <FeatherChevronRight className="text-body font-body text-subtext-color" />
          <Link
            href="/categories"
            className="text-body font-body text-neutral-700 hover:text-brand-700 hover:underline"
          >
            Categories
          </Link>
          <FeatherChevronRight className="text-body font-body text-subtext-color" />
          <span className="text-caption-bold font-caption-bold text-default-font">
            {category.name}
          </span>
        </div>

        {/* Category Header */}
        <div className="flex w-full items-start justify-between mobile:flex-col mobile:flex-nowrap mobile:gap-6">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
            <span className="text-heading-1 font-heading-1 text-default-font">
              {category.name} Lists
            </span>
            {category.description && (
              <span className="text-body font-body text-subtext-color">
                {category.description}
              </span>
            )}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FeatherUsers className="text-body font-body text-subtext-color" />
                <span className="text-body-bold font-body-bold text-default-font">
                  {formatNumber(category.followerCount)}
                </span>
                <span className="text-body font-body text-subtext-color">
                  followers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FeatherFileText className="text-body font-body text-subtext-color" />
                <span className="text-body-bold font-body-bold text-default-font">
                  {formatNumber(category.listCount)}
                </span>
                <span className="text-body font-body text-subtext-color">
                  lists
                </span>
              </div>
            </div>
          </div>
          <Button
            variant={category.isFollowing ? "neutral-secondary" : "brand-secondary"}
            icon={<FeatherUserPlus />}
            loading={isFollowingLoading}
            onClick={handleFollow}
          >
            {category.isFollowing ? "Following" : "Follow Category"}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

      {/* Lists Section */}
      <div className="flex w-full flex-col items-start gap-6">
        <div className="flex w-full items-center justify-between">
          <span className="text-heading-2 font-heading-2 text-default-font">
            Featured Lists
          </span>
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <Button
                variant="neutral-secondary"
                size="medium"
                iconRight={<FeatherChevronDown />}
              >
                Sort by: {sortLabel}
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
                    icon={<FeatherTrendingUp />}
                    onClick={() => handleSortChange("trending")}
                  >
                    Trending
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem
                    icon={<FeatherEye />}
                    onClick={() => handleSortChange("views")}
                  >
                    Most Views
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem
                    icon={<FeatherHeart />}
                    onClick={() => handleSortChange("likes")}
                  >
                    Most Likes
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem
                    icon={<FeatherClock />}
                    onClick={() => handleSortChange("newest")}
                  >
                    Newest
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>

        {/* Lists Grid */}
        {isLoading && lists.length === 0 ? (
          <div className="w-full items-start gap-6 grid grid-cols-2 mobile:grid mobile:grid-cols-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 w-full animate-pulse rounded-md bg-neutral-100"
              />
            ))}
          </div>
        ) : lists.length > 0 ? (
          <div className="w-full items-start gap-6 grid grid-cols-2 mobile:grid mobile:grid-cols-1">
            {lists.map((list) => (
              <Link
                key={list.id}
                href={`/@${list.author.username}/${list.slug}`}
                className="hover:opacity-90 transition-opacity"
              >
                <ListicleCard
                  image={
                    list.cover_image ||
                    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                  }
                  category={category.name.toUpperCase()}
                  title={list.title}
                  description={list.description || ""}
                  author={list.author.name}
                  authorAvatar={list.author.avatar || undefined}
                  views={formatNumber(list.view_count)}
                  likes={formatNumber(list.likesCount)}
                  comments={formatNumber(list.commentsCount)}
                  date={
                    list.published_at
                      ? formatDistanceToNow(new Date(list.published_at), {
                          addSuffix: true,
                        })
                      : "Draft"
                  }
                  bookmarkButton={
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
        ) : (
          <div className="flex w-full flex-col items-center justify-center py-12 gap-4">
            <IconWithBackground
              size="large"
              variant="neutral"
              icon={<FeatherFileText />}
            />
            <h2 className="text-heading-3 font-heading-3 text-default-font">
              No lists found
            </h2>
            <p className="text-body font-body text-subtext-color">
              This category doesn&apos;t have any published lists yet.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex w-full items-center justify-center">
            <Button
              variant="neutral-secondary"
              size="large"
              loading={isLoading}
              onClick={handleLoadMore}
            >
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
