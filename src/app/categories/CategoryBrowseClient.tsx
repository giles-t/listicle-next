"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { TextField } from "@/ui/components/TextField";
import { ToggleGroup } from "@/ui/components/ToggleGroup";
import { toast } from "@subframe/core";
import {
  FeatherActivity,
  FeatherArrowUpDown,
  FeatherBriefcase,
  FeatherChevronDown,
  FeatherCpu,
  FeatherFileText,
  FeatherFilm,
  FeatherGraduationCap,
  FeatherHeart,
  FeatherLayoutGrid,
  FeatherList,
  FeatherPlaneTakeoff,
  FeatherSearch,
  FeatherShirt,
  FeatherTrophy,
  FeatherUsers,
  FeatherUtensilsCrossed,
  FeatherBook,
  FeatherMusic,
  FeatherCamera,
  FeatherHome,
  FeatherGlobe,
  FeatherCar,
  FeatherGamepad2,
  FeatherPalette,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: "brand" | "success" | "warning" | "error" | "neutral";
  sort_order: number;
  followerCount: number;
  listCount: number;
  isFollowing: boolean;
}

type SortOption = "default" | "name" | "followers" | "lists";
type ViewMode = "grid" | "list";

// Icon mapping from database icon string to React component
const ICON_MAP: Record<string, React.ReactNode> = {
  cpu: <FeatherCpu />,
  plane: <FeatherPlaneTakeoff />,
  utensils: <FeatherUtensilsCrossed />,
  heart: <FeatherHeart />,
  briefcase: <FeatherBriefcase />,
  activity: <FeatherActivity />,
  film: <FeatherFilm />,
  "graduation-cap": <FeatherGraduationCap />,
  trophy: <FeatherTrophy />,
  shirt: <FeatherShirt />,
  book: <FeatherBook />,
  music: <FeatherMusic />,
  camera: <FeatherCamera />,
  home: <FeatherHome />,
  globe: <FeatherGlobe />,
  car: <FeatherCar />,
  gamepad: <FeatherGamepad2 />,
  palette: <FeatherPalette />,
};

function getIconComponent(iconName: string): React.ReactNode {
  return ICON_MAP[iconName] || <FeatherGlobe />;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

interface CategoryRowProps {
  category: Category;
  onFollow: (categoryId: string, isFollowing: boolean) => void;
  isLoading?: boolean;
}

function CategoryRow({ category, onFollow, isLoading }: CategoryRowProps) {
  return (
    <article
      className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-4 py-4 mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-3"
      itemScope
      itemType="https://schema.org/Thing"
    >
      <IconWithBackground
        variant={category.color}
        size="medium"
        icon={getIconComponent(category.icon)}
      />
      <Link
        href={`/categories/${category.slug}`}
        className="flex grow shrink-0 basis-0 flex-col items-start gap-1 hover:opacity-80 transition-opacity"
        itemProp="url"
      >
        <h2
          className="text-heading-3 font-heading-3 text-default-font"
          itemProp="name"
        >
          {category.name}
        </h2>
        <p
          className="text-body font-body text-subtext-color"
          itemProp="description"
        >
          {category.description}
        </p>
      </Link>
      <div className="flex items-center gap-6 mobile:h-auto mobile:w-full mobile:flex-none mobile:flex-row mobile:flex-nowrap mobile:justify-between">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2"
            aria-label={`${formatCount(category.followerCount)} followers`}
          >
            <FeatherUsers className="text-body font-body text-subtext-color" />
            <span className="text-body-bold font-body-bold text-default-font">
              {formatCount(category.followerCount)}
            </span>
          </div>
          <div
            className="flex items-center gap-2"
            aria-label={`${category.listCount} lists`}
          >
            <FeatherFileText className="text-body font-body text-subtext-color" />
            <span className="text-body-bold font-body-bold text-default-font">
              {category.listCount}
            </span>
          </div>
        </div>
        <Button
          variant={category.isFollowing ? "neutral-secondary" : "brand-secondary"}
          size="small"
          loading={isLoading}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            onFollow(category.id, category.isFollowing);
          }}
          aria-label={category.isFollowing ? `Unfollow ${category.name}` : `Follow ${category.name}`}
        >
          {category.isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    </article>
  );
}

interface CategoryCardProps {
  category: Category;
  onFollow: (categoryId: string, isFollowing: boolean) => void;
  isLoading?: boolean;
}

function CategoryCard({ category, onFollow, isLoading }: CategoryCardProps) {
  return (
    <article
      className="flex min-w-[280px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-lg border border-solid border-neutral-border bg-default-background p-6 shadow-sm hover:shadow-md transition-shadow"
      itemScope
      itemType="https://schema.org/Thing"
    >
      <div className="flex w-full items-start justify-between">
        <IconWithBackground
          variant={category.color}
          size="medium"
          icon={getIconComponent(category.icon)}
        />
        <Button
          variant={category.isFollowing ? "neutral-secondary" : "brand-secondary"}
          size="small"
          loading={isLoading}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            onFollow(category.id, category.isFollowing);
          }}
          aria-label={category.isFollowing ? `Unfollow ${category.name}` : `Follow ${category.name}`}
        >
          {category.isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
      <Link
        href={`/categories/${category.slug}`}
        className="flex flex-col items-start gap-1"
        itemProp="url"
      >
        <h2
          className="text-heading-3 font-heading-3 text-default-font"
          itemProp="name"
        >
          {category.name}
        </h2>
        <p
          className="text-body font-body text-subtext-color line-clamp-2"
          itemProp="description"
        >
          {category.description}
        </p>
      </Link>
      <div className="flex items-center gap-6">
        <div
          className="flex items-center gap-2"
          aria-label={`${formatCount(category.followerCount)} followers`}
        >
          <FeatherUsers className="text-body font-body text-subtext-color" />
          <span className="text-body-bold font-body-bold text-default-font">
            {formatCount(category.followerCount)}
          </span>
        </div>
        <div
          className="flex items-center gap-2"
          aria-label={`${category.listCount} lists`}
        >
          <FeatherFileText className="text-body font-body text-subtext-color" />
          <span className="text-body-bold font-body-bold text-default-font">
            {category.listCount}
          </span>
        </div>
      </div>
    </article>
  );
}

interface CategoryBrowseClientProps {
  categories: Category[];
}

export function CategoryBrowseClient({ categories: initialCategories }: CategoryBrowseClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Client-side filtering and sorting
  const filteredAndSortedCategories = useMemo(() => {
    let result = [...categories];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          (cat.description?.toLowerCase().includes(query) ?? false)
      );
    }

    // Sort
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "followers":
        result.sort((a, b) => b.followerCount - a.followerCount);
        break;
      case "lists":
        result.sort((a, b) => b.listCount - a.listCount);
        break;
      case "default":
      default:
        result.sort((a, b) => a.sort_order - b.sort_order);
        break;
    }

    return result;
  }, [categories, searchQuery, sortBy]);

  const handleFollow = async (categoryId: string, isCurrentlyFollowing: boolean) => {
    // Optimistic update
    setFollowingIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(categoryId);
      return newSet;
    });

    // Update local state optimistically
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              isFollowing: !isCurrentlyFollowing,
              followerCount: isCurrentlyFollowing
                ? cat.followerCount - 1
                : cat.followerCount + 1,
            }
          : cat
      )
    );

    try {
      const response = await fetch(`/api/categories/${categoryId}/follow`, {
        method: isCurrentlyFollowing ? "DELETE" : "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          // Revert optimistic update
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === categoryId
                ? {
                    ...cat,
                    isFollowing: isCurrentlyFollowing,
                    followerCount: isCurrentlyFollowing
                      ? cat.followerCount + 1
                      : cat.followerCount - 1,
                  }
                : cat
            )
          );
          toast.error("Please sign in to follow categories");
          return;
        }
        throw new Error(data.error || "Failed to update follow status");
      }

      toast.success(
        isCurrentlyFollowing ? "Unfollowed category" : "Following category"
      );
    } catch (error) {
      // Revert optimistic update on error
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                isFollowing: isCurrentlyFollowing,
                followerCount: isCurrentlyFollowing
                  ? cat.followerCount + 1
                  : cat.followerCount - 1,
              }
            : cat
        )
      );
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow status");
    } finally {
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    }
  };

  const sortLabel = {
    default: "Default",
    name: "Name",
    followers: "Followers",
    lists: "Lists",
  }[sortBy];

  return (
    <div className="container max-w-none flex h-full w-full flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
      {/* Header */}
      <header className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-4">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-heading-1 font-heading-1 text-default-font">
            All Categories
          </h1>
          <p className="text-body font-body text-subtext-color">
            Explore topics and discover lists across all categories
          </p>
        </div>
        <TextField
          variant="outline"
          label=""
          helpText=""
          icon={<FeatherSearch />}
        >
          <TextField.Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(event.target.value);
            }}
            aria-label="Search categories"
          />
        </TextField>
      </header>

      {/* Toolbar */}
      <nav
        className="flex w-full flex-wrap items-center gap-2 border-b border-solid border-neutral-border py-2"
        aria-label="Category filters"
      >
        <span className="grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
          {filteredAndSortedCategories.length} {filteredAndSortedCategories.length === 1 ? "category" : "categories"}
        </span>
        <SubframeCore.DropdownMenu.Root>
          <SubframeCore.DropdownMenu.Trigger asChild={true}>
            <Button
              variant="neutral-secondary"
              icon={<FeatherArrowUpDown />}
              iconRight={<FeatherChevronDown />}
              aria-label={`Sort by: ${sortLabel}`}
            >
              Sort by: {sortLabel}
            </Button>
          </SubframeCore.DropdownMenu.Trigger>
          <SubframeCore.DropdownMenu.Portal>
            <SubframeCore.DropdownMenu.Content
              side="bottom"
              align="start"
              sideOffset={4}
              asChild={true}
            >
              <DropdownMenu>
                <DropdownMenu.DropdownItem
                  icon={null}
                  onClick={() => setSortBy("default")}
                >
                  Default
                </DropdownMenu.DropdownItem>
                <DropdownMenu.DropdownItem
                  icon={null}
                  onClick={() => setSortBy("name")}
                >
                  By name
                </DropdownMenu.DropdownItem>
                <DropdownMenu.DropdownItem
                  icon={null}
                  onClick={() => setSortBy("followers")}
                >
                  By followers
                </DropdownMenu.DropdownItem>
                <DropdownMenu.DropdownItem
                  icon={null}
                  onClick={() => setSortBy("lists")}
                >
                  By lists
                </DropdownMenu.DropdownItem>
              </DropdownMenu>
            </SubframeCore.DropdownMenu.Content>
          </SubframeCore.DropdownMenu.Portal>
        </SubframeCore.DropdownMenu.Root>
        <ToggleGroup
          value={viewMode}
          onValueChange={(value: string) => {
            if (value === "grid" || value === "list") {
              setViewMode(value);
            }
          }}
        >
          <ToggleGroup.Item
            className="h-7 w-auto flex-none"
            icon={<FeatherLayoutGrid />}
            value="grid"
            aria-label="Grid view"
          />
          <ToggleGroup.Item
            className="h-7 w-auto flex-none"
            icon={<FeatherList />}
            value="list"
            aria-label="List view"
          />
        </ToggleGroup>
      </nav>

      {/* Categories */}
      {viewMode === "list" ? (
        <section
          className="flex w-full flex-col items-start"
          aria-label="Categories list"
        >
          {filteredAndSortedCategories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onFollow={handleFollow}
              isLoading={followingIds.has(category.id)}
            />
          ))}
        </section>
      ) : (
        <section
          className="flex w-full flex-wrap items-start gap-4"
          aria-label="Categories grid"
        >
          {filteredAndSortedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onFollow={handleFollow}
              isLoading={followingIds.has(category.id)}
            />
          ))}
        </section>
      )}

      {/* Empty state */}
      {filteredAndSortedCategories.length === 0 && (
        <div
          className="flex w-full flex-col items-center justify-center py-12 gap-4"
          role="status"
          aria-live="polite"
        >
          <FeatherSearch className="h-12 w-12 text-subtext-color" />
          <h2 className="text-heading-3 font-heading-3 text-default-font">
            No categories found
          </h2>
          <p className="text-body font-body text-subtext-color">
            Try adjusting your search query
          </p>
        </div>
      )}
    </div>
  );
}
