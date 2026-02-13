"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import type { CategoryOption, SortOption, TimeFilter, FeaturedFilter, ForYouFilter } from "./FilterSidebar";

interface MobileFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryOption[];
  selectedCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  selectedTime: TimeFilter;
  onTimeChange: (time: TimeFilter) => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedFeatured: FeaturedFilter;
  onFeaturedChange: (featured: FeaturedFilter) => void;
  selectedForYou: ForYouFilter;
  onForYouChange: (forYou: ForYouFilter) => void;
  onClearAll: () => void;
  onApply: () => void;
}

const featuredOptions: { value: FeaturedFilter; label: string }[] = [
  { value: "all", label: "All Lists" },
  { value: "editors-pick", label: "Editor's Pick" },
];

const forYouOptions: { value: ForYouFilter; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "following", label: "Following" },
];

const timeOptions: { value: TimeFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "views", label: "Most Views" },
  { value: "likes", label: "Most Likes" },
  { value: "newest", label: "Newest" },
];

export function MobileFilterDrawer({
  open,
  onOpenChange,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedTime,
  onTimeChange,
  selectedSort,
  onSortChange,
  selectedFeatured,
  onFeaturedChange,
  selectedForYou,
  onForYouChange,
  onClearAll,
  onApply,
}: MobileFilterDrawerProps) {
  return (
    <DrawerLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full max-w-[576px] flex-col items-start bg-default-background">
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4">
          <span className="text-heading-2 font-heading-2 text-default-font">
            Filters
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="neutral-tertiary"
              size="small"
              onClick={onClearAll}
            >
              Clear all
            </Button>
            <Button size="small" onClick={onApply}>
              Apply
            </Button>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-6 py-6 overflow-y-auto">
          {/* Featured */}
          <div className="flex w-full flex-col items-start gap-3">
            <span className="text-body-bold font-body-bold text-default-font">
              Featured
            </span>
            <div className="flex w-full flex-col items-start gap-2">
              {featuredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 ${
                    selectedFeatured === option.value
                      ? "bg-brand-50"
                      : ""
                  }`}
                  onClick={() => onFeaturedChange(option.value)}
                >
                  <span
                    className={`grow shrink-0 basis-0 ${
                      selectedFeatured === option.value
                        ? "text-body-bold font-body-bold text-brand-primary"
                        : "text-body font-body text-default-font"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          
          {/* For You */}
          <div className="flex w-full flex-col items-start gap-3">
            <span className="text-body-bold font-body-bold text-default-font">
              For You
            </span>
            <div className="flex w-full flex-col items-start gap-2">
              {forYouOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 ${
                    selectedForYou === option.value
                      ? "bg-brand-50"
                      : ""
                  }`}
                  onClick={() => onForYouChange(selectedForYou === option.value ? null : option.value)}
                >
                  <span
                    className={`grow shrink-0 basis-0 ${
                      selectedForYou === option.value
                        ? "text-body-bold font-body-bold text-brand-primary"
                        : "text-body font-body text-default-font"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          
          {/* Categories */}
          <div className="flex w-full flex-col items-start gap-3">
            <span className="text-body-bold font-body-bold text-default-font">
              Categories
            </span>
            <div className="flex max-h-[240px] w-full flex-col items-start gap-2 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 ${
                    selectedCategory === category.slug
                      ? "bg-brand-50"
                      : ""
                  }`}
                  onClick={() =>
                    onCategoryChange(
                      selectedCategory === category.slug ? null : category.slug
                    )
                  }
                >
                  <span
                    className={`grow shrink-0 basis-0 ${
                      selectedCategory === category.slug
                        ? "text-body-bold font-body-bold text-brand-primary"
                        : "text-body font-body text-default-font"
                    }`}
                  >
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          
          {/* Time Posted */}
          <div className="flex w-full flex-col items-start gap-3">
            <span className="text-body-bold font-body-bold text-default-font">
              Time Posted
            </span>
            <div className="flex w-full flex-col items-start gap-2">
              {timeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 ${
                    selectedTime === option.value
                      ? "bg-brand-50"
                      : ""
                  }`}
                  onClick={() => onTimeChange(option.value)}
                >
                  <span
                    className={`grow shrink-0 basis-0 ${
                      selectedTime === option.value
                        ? "text-body-bold font-body-bold text-brand-primary"
                        : "text-body font-body text-default-font"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          
          {/* Sort By */}
          <div className="flex w-full flex-col items-start gap-3">
            <span className="text-body-bold font-body-bold text-default-font">
              Sort By
            </span>
            <div className="flex w-full flex-col items-start gap-2">
              {sortOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 ${
                    selectedSort === option.value
                      ? "bg-brand-50"
                      : ""
                  }`}
                  onClick={() => onSortChange(option.value)}
                >
                  <span
                    className={`grow shrink-0 basis-0 ${
                      selectedSort === option.value
                        ? "text-body-bold font-body-bold text-brand-primary"
                        : "text-body font-body text-default-font"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DrawerLayout>
  );
}
