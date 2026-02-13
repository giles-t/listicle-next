"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/ui/components/Button";
import { ListicleCardComponent as ListicleCard } from "@/ui/components/ListicleCardComponent";
import { SearchListComponent } from "@/ui/components/SearchListComponent";
import { Badge } from "@/ui/components/Badge";
import { FeatherFilter } from "@subframe/core";
import { formatNumber } from "@/shared/utils/format";
import { formatDistanceToNow } from "date-fns";
import { FilterSidebar, type CategoryOption, type SortOption, type TimeFilter, type FeaturedFilter, type ForYouFilter } from "./FilterSidebar";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { AddBookmarkButton } from "@/client/components/AddBookmarkButton";

interface ListItem {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image: string | null;
  published_at: string | null;
  view_count: number;
  likesCount: number;
  commentsCount: number;
  category: {
    name: string;
    slug: string;
  } | null;
  author: {
    username: string;
    name: string;
    avatar: string | null;
  };
}

interface FilteredListFeedProps {
  initialLists: ListItem[];
  categories: CategoryOption[];
}

export function FilteredListFeed({ initialLists, categories }: FilteredListFeedProps) {
  const [lists, setLists] = useState<ListItem[]>(initialLists);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialLists.length >= 10);
  const [offset, setOffset] = useState(initialLists.length);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeFilter>("all");
  const [selectedSort, setSelectedSort] = useState<SortOption>("trending");
  const [selectedFeatured, setSelectedFeatured] = useState<FeaturedFilter>("all");
  const [selectedForYou, setSelectedForYou] = useState<ForYouFilter>(null);
  
  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Temporary filter state for mobile drawer (applied on "Apply" button)
  const [tempCategory, setTempCategory] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<TimeFilter>("all");
  const [tempSort, setTempSort] = useState<SortOption>("trending");
  const [tempFeatured, setTempFeatured] = useState<FeaturedFilter>("all");
  const [tempForYou, setTempForYou] = useState<ForYouFilter>(null);

  const fetchLists = useCallback(async (
    category: string | null,
    time: TimeFilter,
    sort: SortOption,
    featured: FeaturedFilter,
    forYou: ForYouFilter,
    currentOffset: number = 0,
    append: boolean = false
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy: sort,
        time: time,
        limit: "10",
        offset: currentOffset.toString(),
      });
      
      if (category) {
        params.set("category", category);
      }
      
      if (featured !== "all") {
        params.set("featured", featured);
      }
      
      if (forYou) {
        params.set("forYou", forYou);
      }

      const response = await fetch(`/api/feed?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      
      if (append) {
        setLists(prev => [...prev, ...data.lists]);
      } else {
        setLists(data.lists);
      }
      setHasMore(data.hasMore);
      setOffset(currentOffset + data.lists.length);
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when desktop filters change
  const handleCategoryChange = useCallback((slug: string | null) => {
    setSelectedCategory(slug);
    setOffset(0);
    fetchLists(slug, selectedTime, selectedSort, selectedFeatured, selectedForYou, 0, false);
  }, [selectedTime, selectedSort, selectedFeatured, selectedForYou, fetchLists]);

  const handleTimeChange = useCallback((time: TimeFilter) => {
    setSelectedTime(time);
    setOffset(0);
    fetchLists(selectedCategory, time, selectedSort, selectedFeatured, selectedForYou, 0, false);
  }, [selectedCategory, selectedSort, selectedFeatured, selectedForYou, fetchLists]);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSelectedSort(sort);
    setOffset(0);
    fetchLists(selectedCategory, selectedTime, sort, selectedFeatured, selectedForYou, 0, false);
  }, [selectedCategory, selectedTime, selectedFeatured, selectedForYou, fetchLists]);

  const handleFeaturedChange = useCallback((featured: FeaturedFilter) => {
    setSelectedFeatured(featured);
    setOffset(0);
    fetchLists(selectedCategory, selectedTime, selectedSort, featured, selectedForYou, 0, false);
  }, [selectedCategory, selectedTime, selectedSort, selectedForYou, fetchLists]);

  const handleForYouChange = useCallback((forYou: ForYouFilter) => {
    setSelectedForYou(forYou);
    setOffset(0);
    fetchLists(selectedCategory, selectedTime, selectedSort, selectedFeatured, forYou, 0, false);
  }, [selectedCategory, selectedTime, selectedSort, selectedFeatured, fetchLists]);

  // Mobile drawer handlers
  const handleOpenDrawer = useCallback(() => {
    // Sync temp state with current state when opening
    setTempCategory(selectedCategory);
    setTempTime(selectedTime);
    setTempSort(selectedSort);
    setTempFeatured(selectedFeatured);
    setTempForYou(selectedForYou);
    setDrawerOpen(true);
  }, [selectedCategory, selectedTime, selectedSort, selectedFeatured, selectedForYou]);

  const handleClearAll = useCallback(() => {
    setTempCategory(null);
    setTempTime("all");
    setTempSort("trending");
    setTempFeatured("all");
    setTempForYou(null);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setSelectedCategory(tempCategory);
    setSelectedTime(tempTime);
    setSelectedSort(tempSort);
    setSelectedFeatured(tempFeatured);
    setSelectedForYou(tempForYou);
    setOffset(0);
    fetchLists(tempCategory, tempTime, tempSort, tempFeatured, tempForYou, 0, false);
    setDrawerOpen(false);
  }, [tempCategory, tempTime, tempSort, tempFeatured, tempForYou, fetchLists]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchLists(selectedCategory, selectedTime, selectedSort, selectedFeatured, selectedForYou, offset, true);
    }
  }, [isLoading, hasMore, selectedCategory, selectedTime, selectedSort, selectedFeatured, selectedForYou, offset, fetchLists]);

  return (
    <>
      <div className="container max-w-none flex h-full w-full items-start gap-8 bg-default-background py-12 mobile:flex-col mobile:flex-nowrap mobile:gap-8">
        {/* Desktop Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          selectedTime={selectedTime}
          onTimeChange={handleTimeChange}
          selectedSort={selectedSort}
          onSortChange={handleSortChange}
          selectedFeatured={selectedFeatured}
          onFeaturedChange={handleFeaturedChange}
          selectedForYou={selectedForYou}
          onForYouChange={handleForYouChange}
        />
        
        {/* Main Content */}
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-8">
          <div className="flex w-full flex-col items-start justify-center gap-1">
            <span className="w-full text-heading-1 font-heading-1 text-default-font">
              Trending Lists
            </span>
            <span className="text-body font-body text-subtext-color">
              Discover popular lists crafted by our community
            </span>
          </div>
          
          {lists.length > 0 ? (
            <>
              {/* Desktop: SearchListComponent */}
              <div className="flex w-full flex-col items-start gap-8 mobile:hidden">
                {lists.map((list) => (
                  <Link
                    key={list.id}
                    href={`/@${list.author.username}/${list.slug}`}
                    className="w-full hover:opacity-95 transition-opacity"
                  >
                    <SearchListComponent
                      image={list.cover_image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"}
                      categories={<Badge>{list.category?.name.toUpperCase() || "UNCATEGORIZED"}</Badge>}
                      title={list.title}
                      description={list.description || ""}
                      authorName={list.author.name}
                      viewCount={formatNumber(list.view_count)}
                      likeCount={formatNumber(list.likesCount)}
                      commentCount={formatNumber(list.commentsCount)}
                      publishDate={list.published_at ? formatDistanceToNow(new Date(list.published_at), { addSuffix: true }) : ""}
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
              {/* Mobile: ListicleCard */}
              <div className="hidden w-full flex-col items-start gap-6 mobile:flex">
                {lists.map((list) => (
                  <Link
                    key={list.id}
                    href={`/@${list.author.username}/${list.slug}`}
                    className="w-full hover:opacity-95 transition-opacity"
                  >
                    <ListicleCard
                      image={list.cover_image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"}
                      category={list.category?.name.toUpperCase() || "UNCATEGORIZED"}
                      title={list.title}
                      description={list.description || ""}
                      author={list.author.name}
                      views={formatNumber(list.view_count)}
                      likes={formatNumber(list.likesCount)}
                      comments={formatNumber(list.commentsCount)}
                      date={list.published_at ? formatDistanceToNow(new Date(list.published_at), { addSuffix: true }) : ""}
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
            <div className="flex w-full flex-col items-center justify-center py-12 gap-4">
              <h2 className="text-heading-3 font-heading-3 text-default-font">
                No lists found
              </h2>
              <p className="text-body font-body text-subtext-color">
                Try adjusting your filters
              </p>
            </div>
          )}
          
          {hasMore && lists.length > 0 && (
            <div className="flex w-full items-center justify-center">
              <Button
                variant="neutral-secondary"
                size="large"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Filter Button */}
      <div className="hidden items-start fixed bottom-6 right-6 mobile:flex z-50">
        <Button
          size="large"
          icon={<FeatherFilter />}
          onClick={handleOpenDrawer}
        >
          Filters
        </Button>
      </div>
      
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        categories={categories}
        selectedCategory={tempCategory}
        onCategoryChange={setTempCategory}
        selectedTime={tempTime}
        onTimeChange={setTempTime}
        selectedSort={tempSort}
        onSortChange={setTempSort}
        selectedFeatured={tempFeatured}
        onFeaturedChange={setTempFeatured}
        selectedForYou={tempForYou}
        onForYouChange={setTempForYou}
        onClearAll={handleClearAll}
        onApply={handleApplyFilters}
      />
    </>
  );
}
