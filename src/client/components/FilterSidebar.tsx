"use client";

import React from "react";
import { Accordion } from "@/ui/components/Accordion";

export type SortOption = "trending" | "views" | "likes" | "newest";
export type TimeFilter = "today" | "week" | "month" | "all";
export type FeaturedFilter = "all" | "editors-pick";
export type ForYouFilter = "recommended" | "following" | null;

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface FilterSidebarProps {
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

export function FilterSidebar({
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
}: FilterSidebarProps) {
  return (
    <div className="flex w-64 flex-none flex-col items-start gap-4 mobile:hidden">
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between">
          <span className="text-heading-3 font-heading-3 text-default-font">
            Filters
          </span>
        </div>
        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
      </div>
      
      {/* Featured */}
      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 py-2">
            <span className="grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
              Featured
            </span>
            <Accordion.Chevron />
          </div>
        }
        defaultOpen={true}
      >
        <div className="flex w-full flex-col items-start gap-2 pt-3">
          {featuredOptions.map((option) => (
            <div
              key={option.value}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors ${
                selectedFeatured === option.value
                  ? "bg-brand-50"
                  : "bg-neutral-50 hover:bg-neutral-100"
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
      </Accordion>
      
      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
      
      {/* For You */}
      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 py-2">
            <span className="grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
              For You
            </span>
            <Accordion.Chevron />
          </div>
        }
        defaultOpen={true}
      >
        <div className="flex w-full flex-col items-start gap-2 pt-3">
          {forYouOptions.map((option) => (
            <div
              key={option.value}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors ${
                selectedForYou === option.value
                  ? "bg-brand-50"
                  : "bg-neutral-50 hover:bg-neutral-100"
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
      </Accordion>
      
      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
      
      {/* Categories */}
      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 py-2">
            <span className="grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
              Categories
            </span>
            <Accordion.Chevron />
          </div>
        }
      >
        <div className="flex max-h-[256px] w-full flex-col items-start gap-2 pt-3 overflow-y-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors ${
                selectedCategory === category.slug
                  ? "bg-brand-50"
                  : "bg-neutral-50 hover:bg-neutral-100"
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
      </Accordion>
      
      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
      
      {/* Time Posted */}
      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 py-2">
            <span className="grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
              Time Posted
            </span>
            <Accordion.Chevron />
          </div>
        }
      >
        <div className="flex w-full flex-col items-start gap-2 pt-3">
          {timeOptions.map((option) => (
            <div
              key={option.value}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors ${
                selectedTime === option.value
                  ? "bg-brand-50"
                  : "bg-neutral-50 hover:bg-neutral-100"
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
      </Accordion>
      
      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
      
      {/* Sort By */}
      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 py-2">
            <span className="grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
              Sort By
            </span>
            <Accordion.Chevron />
          </div>
        }
      >
        <div className="flex w-full flex-col items-start gap-2 pt-3">
          {sortOptions.map((option) => (
            <div
              key={option.value}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors ${
                selectedSort === option.value
                  ? "bg-brand-50"
                  : "bg-neutral-50 hover:bg-neutral-100"
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
      </Accordion>
    </div>
  );
}
