"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { ListicleCardComponent } from "@/ui/components/ListicleCardComponent";
import { SearchListComponent } from "@/ui/components/SearchListComponent";
import { Tabs } from "@/ui/components/Tabs";
import { TextField } from "@/ui/components/TextField";
import { AddBookmarkButton } from "@/client/components/AddBookmarkButton";
import { useFollowUser } from "@/client/hooks/use-profile";
import { useAuth } from "@/client/hooks/use-auth";
import { formatNumber } from "@/shared/utils/format";
import { formatDistanceToNow } from "date-fns";
import {
  FeatherArrowDown,
  FeatherBarChart2,
  FeatherChevronDown,
  FeatherClock,
  FeatherList,
  FeatherPlusCircle,
  FeatherRefreshCcw,
  FeatherSearch,
  FeatherTrendingUp,
  FeatherUserPlus,
  FeatherUsers,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { toast } from "@subframe/core";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SearchListItem {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image: string | null;
  published_at: string | null;
  view_count: number;
  likesCount: number;
  commentsCount: number;
  itemCount: number;
  category: {
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
}

interface SearchUserItem {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  followerCount: number;
  listCount: number;
  isFollowing: boolean;
}

type SearchTab = "lists" | "users";
type SortOption = "relevance" | "newest" | "popular";
type DateFilter = "any" | "day" | "week" | "month" | "year";
type ListLengthFilter = "any" | "short" | "medium" | "long";

interface SearchClientProps {
  categories: Category[];
  initialQuery?: string;
}

// User card with follow functionality
function UserCard({
  user,
  currentUserId,
}: {
  user: SearchUserItem;
  currentUserId: string | null;
}) {
  const { isFollowing, isLoading, followUser, unfollowUser } = useFollowUser(
    user.username
  );
  const [localIsFollowing, setLocalIsFollowing] = useState(user.isFollowing);

  // Sync with hook's isFollowing state once loaded
  useEffect(() => {
    if (isFollowing !== undefined) {
      setLocalIsFollowing(isFollowing);
    }
  }, [isFollowing]);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      window.location.href = "/auth";
      return;
    }

    if (localIsFollowing) {
      unfollowUser();
      setLocalIsFollowing(false);
    } else {
      followUser();
      setLocalIsFollowing(true);
    }
  };

  const isOwnProfile = currentUserId === user.id;

  return (
    <Link
      href={`/@${user.username}`}
      className="flex w-full items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <Avatar size="x-large" image={user.avatar || undefined}>
        {user.name.charAt(0).toUpperCase()}
      </Avatar>
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
        <div className="flex w-full flex-col items-start gap-1">
          <span className="text-heading-2 font-heading-2 text-default-font">
            {user.name}
          </span>
          <span className="text-body font-body text-subtext-color">
            @{user.username}
          </span>
        </div>
        {user.bio && (
          <span className="text-body font-body text-default-font line-clamp-2">
            {user.bio}
          </span>
        )}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FeatherUsers className="text-body font-body text-subtext-color" />
            <span className="text-body-bold font-body-bold text-default-font">
              {formatNumber(user.followerCount)}
            </span>
            <span className="text-body font-body text-subtext-color">
              followers
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FeatherList className="text-body font-body text-subtext-color" />
            <span className="text-body-bold font-body-bold text-default-font">
              {formatNumber(user.listCount)}
            </span>
            <span className="text-body font-body text-subtext-color">lists</span>
          </div>
        </div>
      </div>
      {!isOwnProfile && (
        <Button
          variant={localIsFollowing ? "brand-primary" : "brand-secondary"}
          icon={localIsFollowing ? undefined : <FeatherUserPlus />}
          loading={isLoading}
          onClick={handleFollowClick}
        >
          {localIsFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </Link>
  );
}

export function SearchClient({ categories, initialQuery = "" }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || initialQuery
  );
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>(
    (searchParams.get("type") as SearchTab) || "lists"
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sortBy") as SortOption) || "relevance"
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>(
    (searchParams.get("date") as DateFilter) || "any"
  );
  const [categoryFilter, setCategoryFilter] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [listLengthFilter, setListLengthFilter] = useState<ListLengthFilter>(
    (searchParams.get("listLength") as ListLengthFilter) || "any"
  );

  // Results state
  const [lists, setLists] = useState<SearchListItem[]>([]);
  const [users, setUsers] = useState<SearchUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  
  // Track if user has initiated a search (has query or filters applied)
  // For lists: query or any filter
  // For users: query only (no filters)
  const hasActiveSearch = activeTab === "lists"
    ? Boolean(debouncedQuery || categoryFilter || dateFilter !== "any" || listLengthFilter !== "any")
    : Boolean(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (activeTab !== "lists") params.set("type", activeTab);
    if (sortBy !== "relevance") params.set("sortBy", sortBy);
    if (dateFilter !== "any") params.set("date", dateFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (listLengthFilter !== "any") params.set("listLength", listLengthFilter);

    const queryString = params.toString();
    router.replace(`/search${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [
    debouncedQuery,
    activeTab,
    sortBy,
    dateFilter,
    categoryFilter,
    listLengthFilter,
    router,
  ]);

  // Fetch results
  const fetchResults = useCallback(
    async (append = false) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          type: activeTab,
          sortBy,
          limit: "10",
          offset: append ? offset.toString() : "0",
        });

        if (debouncedQuery) params.set("q", debouncedQuery);
        if (dateFilter !== "any") params.set("date", dateFilter);
        if (categoryFilter) params.set("category", categoryFilter);
        if (listLengthFilter !== "any")
          params.set("listLength", listLengthFilter);

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Search API error:", response.status, errorText);
          throw new Error("Failed to search");
        }

        const data = await response.json();

        if (activeTab === "lists") {
          if (append) {
            setLists((prev) => [...prev, ...data.lists]);
          } else {
            setLists(data.lists);
          }
        } else {
          if (append) {
            setUsers((prev) => [...prev, ...data.users]);
          } else {
            setUsers(data.users);
          }
        }

        setHasMore(data.hasMore);
        setOffset(
          append
            ? offset + (activeTab === "lists" ? data.lists.length : data.users.length)
            : activeTab === "lists"
            ? data.lists.length
            : data.users.length
        );
      } catch (error) {
        console.error("Error searching:", error);
        toast.error("Failed to search");
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeTab,
      sortBy,
      debouncedQuery,
      dateFilter,
      categoryFilter,
      listLengthFilter,
      offset,
    ]
  );

  // Fetch on filter change - only when there's an active search
  useEffect(() => {
    // For lists: require query or filters
    // For users: require query (no filters available)
    const shouldFetch = activeTab === "lists" 
      ? (debouncedQuery || categoryFilter || dateFilter !== "any" || listLengthFilter !== "any")
      : Boolean(debouncedQuery);
    
    if (shouldFetch) {
      fetchResults(false);
    } else {
      // Reset results when search is cleared
      setLists([]);
      setUsers([]);
      setHasMore(false);
      setOffset(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, activeTab, sortBy, dateFilter, categoryFilter, listLengthFilter]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchResults(true);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setCategoryFilter(null);
    setDateFilter("any");
    setListLengthFilter("any");
    setSortBy("relevance");
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    setOffset(0);
    // Reset filters when switching tabs
    if (tab === "users") {
      setCategoryFilter(null);
      setDateFilter("any");
      setListLengthFilter("any");
    }
  };

  const sortLabel = useMemo(() => {
    return {
      relevance: "Relevance",
      newest: "Newest first",
      popular: "Most popular",
    }[sortBy];
  }, [sortBy]);

  const dateLabel = useMemo(() => {
    return {
      any: "Any time",
      day: "Past 24 hours",
      week: "Past week",
      month: "Past month",
      year: "Past year",
    }[dateFilter];
  }, [dateFilter]);

  const listLengthLabel = useMemo(() => {
    return {
      any: "Any length",
      short: "Short (< 10 items)",
      medium: "Medium (10-20 items)",
      long: "Long (> 20 items)",
    }[listLengthFilter];
  }, [listLengthFilter]);

  const selectedCategory = useMemo(() => {
    if (!categoryFilter) return null;
    return categories.find((c) => c.slug === categoryFilter);
  }, [categoryFilter, categories]);

  // Dynamic copy based on active tab
  const headerTitle = activeTab === "lists" 
    ? "Discover Amazing Listicles" 
    : "Find Creators to Follow";
  
  const headerSubtitle = activeTab === "lists"
    ? "Search through thousands of curated lists on any topic"
    : "Discover talented creators and follow their curated collections";
  
  const searchPlaceholder = activeTab === "lists"
    ? "Search for listicles..."
    : "Search for users...";

  return (
    <div className="container max-w-none flex h-full w-full flex-col items-start gap-8 bg-default-background py-8">
      <div className="flex w-full flex-col items-start gap-6">
        {/* Search Header and Tabs */}
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full flex-col items-center gap-6 bg-default-background px-6 py-12">
            <div className="flex w-full max-w-[576px] flex-col items-center gap-2">
              <span className="text-heading-2 font-heading-2 text-default-font">
                {headerTitle}
              </span>
              <span className="text-body font-body text-subtext-color text-center">
                {headerSubtitle}
              </span>
            </div>
            <TextField
              className="h-auto w-full max-w-[576px] flex-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </TextField>
          </div>
          <Tabs>
            <Tabs.Item
              active={activeTab === "lists"}
              onClick={() => handleTabChange("lists")}
            >
              Lists
            </Tabs.Item>
            <Tabs.Item
              active={activeTab === "users"}
              onClick={() => handleTabChange("users")}
            >
              Users
            </Tabs.Item>
          </Tabs>
        </div>

        {/* Initial Empty State - shown when no search query or filters */}
        {!hasActiveSearch ? (
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-6 py-12">
            <div className="flex flex-col items-center gap-4">
              <IconWithBackground
                variant="brand"
                size="large"
                icon={activeTab === "lists" ? <FeatherList /> : <FeatherUsers />}
              />
              <div className="flex flex-col items-center gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  {activeTab === "lists"
                    ? "Start Exploring Amazing Listicles"
                    : "Discover Creators"}
                </span>
                <span className="text-body font-body text-subtext-color text-center">
                  {activeTab === "lists"
                    ? "Discover trending lists, curated collections, and expert picks from our community."
                    : "Find and follow creators who share amazing lists."}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Link href="/">
                <Button icon={<FeatherTrendingUp />}>
                  Browse Popular Lists
                </Button>
              </Link>
              {activeTab === "lists" && (
                <Link href="/create">
                  <Button
                    variant="neutral-tertiary"
                    icon={<FeatherPlusCircle />}
                  >
                    Create Your First List
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-start gap-4">
              {/* Filter Bar */}
              <div className="flex w-full flex-wrap items-center justify-between border-b border-solid border-neutral-border pb-4 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
                {activeTab === "lists" ? (
                  <>
                    <div className="flex items-center gap-2 mobile:h-auto mobile:w-full mobile:flex-none mobile:flex-row mobile:flex-wrap mobile:gap-2">
                      {/* Category Filter */}
                      <SubframeCore.DropdownMenu.Root>
                        <SubframeCore.DropdownMenu.Trigger asChild>
                          <Button
                            variant="neutral-secondary"
                            iconRight={<FeatherChevronDown />}
                          >
                            {selectedCategory?.name || "Category"}
                          </Button>
                        </SubframeCore.DropdownMenu.Trigger>
                        <SubframeCore.DropdownMenu.Portal>
                          <SubframeCore.DropdownMenu.Content
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            asChild
                          >
                            <DropdownMenu className="max-h-64 overflow-auto">
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setCategoryFilter(null)}
                              >
                                All Categories
                              </DropdownMenu.DropdownItem>
                              {categories.map((cat) => (
                                <DropdownMenu.DropdownItem
                                  key={cat.id}
                                  icon={null}
                                  onClick={() => setCategoryFilter(cat.slug)}
                                >
                                  {cat.name}
                                </DropdownMenu.DropdownItem>
                              ))}
                            </DropdownMenu>
                          </SubframeCore.DropdownMenu.Content>
                        </SubframeCore.DropdownMenu.Portal>
                      </SubframeCore.DropdownMenu.Root>

                      {/* Date Filter */}
                      <SubframeCore.DropdownMenu.Root>
                        <SubframeCore.DropdownMenu.Trigger asChild>
                          <Button
                            variant="neutral-secondary"
                            iconRight={<FeatherChevronDown />}
                          >
                            {dateLabel}
                          </Button>
                        </SubframeCore.DropdownMenu.Trigger>
                        <SubframeCore.DropdownMenu.Portal>
                          <SubframeCore.DropdownMenu.Content
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            asChild
                          >
                            <DropdownMenu>
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setDateFilter("any")}
                              >
                                Any time
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setDateFilter("day")}
                              >
                                Past 24 hours
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setDateFilter("week")}
                              >
                                Past week
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setDateFilter("month")}
                              >
                                Past month
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setDateFilter("year")}
                              >
                                Past year
                              </DropdownMenu.DropdownItem>
                            </DropdownMenu>
                          </SubframeCore.DropdownMenu.Content>
                        </SubframeCore.DropdownMenu.Portal>
                      </SubframeCore.DropdownMenu.Root>

                      {/* List Length Filter */}
                      <SubframeCore.DropdownMenu.Root>
                        <SubframeCore.DropdownMenu.Trigger asChild>
                          <Button
                            variant="neutral-secondary"
                            iconRight={<FeatherChevronDown />}
                          >
                            {listLengthLabel}
                          </Button>
                        </SubframeCore.DropdownMenu.Trigger>
                        <SubframeCore.DropdownMenu.Portal>
                          <SubframeCore.DropdownMenu.Content
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            asChild
                          >
                            <DropdownMenu>
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setListLengthFilter("any")}
                              >
                                Any length
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setListLengthFilter("short")}
                              >
                                Short (&lt; 10 items)
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setListLengthFilter("medium")}
                              >
                                Medium (10-20 items)
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                icon={null}
                                onClick={() => setListLengthFilter("long")}
                              >
                                Long (&gt; 20 items)
                              </DropdownMenu.DropdownItem>
                            </DropdownMenu>
                          </SubframeCore.DropdownMenu.Content>
                        </SubframeCore.DropdownMenu.Portal>
                      </SubframeCore.DropdownMenu.Root>

                      <div className="flex h-4 w-px flex-none items-start bg-neutral-border mobile:hidden" />

                      <Button
                        variant="neutral-tertiary"
                        icon={<FeatherRefreshCcw />}
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mobile:h-auto mobile:w-full mobile:flex-none mobile:flex-row mobile:flex-nowrap mobile:justify-between">
                      <span className="text-body font-body text-subtext-color mobile:hidden">
                        Sort by:
                      </span>
                      <SubframeCore.DropdownMenu.Root>
                        <SubframeCore.DropdownMenu.Trigger asChild>
                          <Button
                            variant="neutral-tertiary"
                            icon={<FeatherBarChart2 />}
                            iconRight={<FeatherChevronDown />}
                          >
                            {sortLabel}
                          </Button>
                        </SubframeCore.DropdownMenu.Trigger>
                        <SubframeCore.DropdownMenu.Portal>
                          <SubframeCore.DropdownMenu.Content
                            side="bottom"
                            align="end"
                            sideOffset={4}
                            asChild
                          >
                            <DropdownMenu>
                              <DropdownMenu.DropdownItem
                                icon={<FeatherBarChart2 />}
                                onClick={() => setSortBy("relevance")}
                              >
                                Relevance
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                icon={<FeatherClock />}
                                onClick={() => setSortBy("newest")}
                              >
                                Newest first
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                icon={<FeatherTrendingUp />}
                                onClick={() => setSortBy("popular")}
                              >
                                Most popular
                              </DropdownMenu.DropdownItem>
                            </DropdownMenu>
                          </SubframeCore.DropdownMenu.Content>
                        </SubframeCore.DropdownMenu.Portal>
                      </SubframeCore.DropdownMenu.Root>
                    </div>
                  </>
                ) : (
                  /* Users tab - only sort by */
                  <div className="flex w-full items-center justify-end gap-2">
                    <span className="text-body font-body text-subtext-color mobile:hidden">
                      Sort by:
                    </span>
                    <SubframeCore.DropdownMenu.Root>
                      <SubframeCore.DropdownMenu.Trigger asChild>
                        <Button
                          variant="neutral-tertiary"
                          icon={<FeatherBarChart2 />}
                          iconRight={<FeatherChevronDown />}
                        >
                          {sortLabel}
                        </Button>
                      </SubframeCore.DropdownMenu.Trigger>
                      <SubframeCore.DropdownMenu.Portal>
                        <SubframeCore.DropdownMenu.Content
                          side="bottom"
                          align="end"
                          sideOffset={4}
                          asChild
                        >
                          <DropdownMenu>
                            <DropdownMenu.DropdownItem
                              icon={<FeatherBarChart2 />}
                              onClick={() => setSortBy("relevance")}
                            >
                              Relevance
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownItem
                              icon={<FeatherTrendingUp />}
                              onClick={() => setSortBy("popular")}
                            >
                              Most followers
                            </DropdownMenu.DropdownItem>
                          </DropdownMenu>
                        </SubframeCore.DropdownMenu.Content>
                      </SubframeCore.DropdownMenu.Portal>
                    </SubframeCore.DropdownMenu.Root>
                  </div>
                )}
              </div>

            {/* Results */}
            {activeTab === "lists" ? (
              <>
                {isLoading && lists.length === 0 ? (
                  <div className="w-full flex flex-col gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-32 w-full animate-pulse rounded-md bg-neutral-100"
                      />
                    ))}
                  </div>
                ) : lists.length > 0 ? (
                  <>
                    {/* Desktop: List view */}
                    <div className="flex w-full flex-col items-start gap-2 mobile:hidden">
                      {lists.map((list) => (
                        <Link
                          key={list.id}
                          href={`/@${list.author.username}/${list.slug}`}
                          className="w-full"
                        >
                          <SearchListComponent
                            image={
                              list.cover_image ||
                              "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                            }
                            title={list.title}
                            authorName={list.author.name}
                            publishDate={
                              list.published_at
                                ? formatDistanceToNow(
                                    new Date(list.published_at),
                                    { addSuffix: false }
                                  )
                                : ""
                            }
                            description={list.description || ""}
                            categories={
                              list.category ? (
                                <Badge variant="neutral">
                                  {list.category.name}
                                </Badge>
                              ) : null
                            }
                            viewCount={formatNumber(list.view_count)}
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
                    {/* Mobile: Card view */}
                    <div className="hidden w-full flex-col items-start gap-4 mobile:flex">
                      {lists.map((list) => (
                        <Link
                          key={list.id}
                          href={`/@${list.author.username}/${list.slug}`}
                          className="w-full hover:opacity-90 transition-opacity"
                        >
                          <ListicleCardComponent
                            image={
                              list.cover_image ||
                              "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                            }
                            category={
                              list.category ? (
                                <Badge variant="neutral">
                                  {list.category.name}
                                </Badge>
                              ) : null
                            }
                            title={list.title}
                            description={list.description || ""}
                            author={list.author.name}
                            views={formatNumber(list.view_count)}
                            likes={formatNumber(list.likesCount)}
                            comments={formatNumber(list.commentsCount)}
                            date={
                              list.published_at
                                ? formatDistanceToNow(
                                    new Date(list.published_at),
                                    { addSuffix: true }
                                  )
                                : ""
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
                  </>
                ) : (
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-6 py-12">
                    <div className="flex flex-col items-center gap-4">
                      <IconWithBackground
                        variant="neutral"
                        size="large"
                        icon={<FeatherSearch />}
                      />
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-heading-3 font-heading-3 text-default-font">
                          No lists found
                        </span>
                        <span className="text-body font-body text-subtext-color text-center">
                          {debouncedQuery
                            ? `No results for "${debouncedQuery}". Try adjusting your filters or search terms.`
                            : "No lists match your current filters. Try adjusting your filters."}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="neutral-secondary"
                      icon={<FeatherRefreshCcw />}
                      onClick={handleReset}
                    >
                      Reset filters
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                {isLoading && users.length === 0 ? (
                  <div className="w-full flex flex-col gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-32 w-full animate-pulse rounded-md bg-neutral-100"
                      />
                    ))}
                  </div>
                ) : users.length > 0 ? (
                  <div className="flex w-full flex-col items-start gap-4">
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        currentUserId={currentUser?.id || null}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-6 py-12">
                    <div className="flex flex-col items-center gap-4">
                      <IconWithBackground
                        variant="neutral"
                        size="large"
                        icon={<FeatherSearch />}
                      />
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-heading-3 font-heading-3 text-default-font">
                          No users found
                        </span>
                        <span className="text-body font-body text-subtext-color text-center">
                          {debouncedQuery
                            ? `No results for "${debouncedQuery}". Try a different search term.`
                            : "No users match your search. Try a different term."}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="neutral-secondary"
                      icon={<FeatherRefreshCcw />}
                      onClick={handleReset}
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Load More */}
            {hasMore && (activeTab === "lists" ? lists.length > 0 : users.length > 0) && (
              <div className="flex w-full items-center justify-center pt-8">
                <Button
                  variant="neutral-secondary"
                  size="large"
                  iconRight={<FeatherArrowDown />}
                  loading={isLoading}
                  onClick={handleLoadMore}
                >
                  Load more results
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
