"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { FilterChip } from "@/ui/components/FilterChip";
import { TextField } from "@/ui/components/TextField";
import { Dialog } from "@/ui/components/Dialog";
import { FeatherHash } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";

type Category = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategories: Category[];
  onConfirm: (categories: Category[]) => void;
  loading?: boolean;
};

const POPULAR_CATEGORIES: Category[] = [
  { id: "technology", name: "Technology" },
  { id: "finance", name: "Finance" },
  { id: "crypto", name: "Crypto" },
  { id: "health", name: "Health" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "education", name: "Education" },
  { id: "travel", name: "Travel" },
  { id: "food", name: "Food" },
  { id: "entertainment", name: "Entertainment" },
  { id: "sports", name: "Sports" },
  { id: "business", name: "Business" },
  { id: "science", name: "Science" },
];

const MAX_CATEGORIES = 3;

function ChangeListCategoriesModal({ open, onOpenChange, initialCategories, onConfirm, loading = false }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset selected categories when modal opens
  useEffect(() => {
    if (open) {
      setSelectedCategories(initialCategories);
      setSearchQuery("");
    }
  }, [open, initialCategories]);

  const filteredCategories = POPULAR_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedCategories.some(selected => selected.name.toLowerCase() === category.name.toLowerCase())
  );

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories(prev => {
      const isSelected = prev.some(selected => selected.name.toLowerCase() === category.name.toLowerCase());
      
      if (isSelected) {
        // Remove category
        return prev.filter(selected => selected.name.toLowerCase() !== category.name.toLowerCase());
      } else {
        // Add category if under limit
        if (prev.length < MAX_CATEGORIES) {
          return [...prev, category];
        }
        return prev;
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedCategories);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content onInteractOutside={(event) => event.preventDefault()}>
        <div className="flex h-full w-144 flex-col items-start bg-default-background mobile:h-full mobile:w-full">
        <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-6 py-6">
          <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
            Change categories
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-4 px-6 py-6">
          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label=""
            helpText=""
            icon={<FeatherSearch />}
          >
            <TextField.Input
              placeholder="Search categories"
              value={searchQuery}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
            />
          </TextField>
          
          {selectedCategories.length > 0 && (
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="text-caption-bold font-caption-bold text-subtext-color">
                  Selected
                </span>
                <Badge variant="neutral">{selectedCategories.length}/{MAX_CATEGORIES}</Badge>
              </div>
              <div className="flex w-full flex-wrap items-start gap-2">
                {selectedCategories.map(category => (
                  <FilterChip
                    key={category.id}
                    selected={true}
                    icon={<FeatherHash />}
                    image=""
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category.name}
                  </FilterChip>
                ))}
              </div>
            </div>
          )}
          
          {selectedCategories.length > 0 && (
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          )}
          
          <div className="flex w-full flex-col items-start gap-2">
            <span className="text-caption-bold font-caption-bold text-subtext-color">
              {searchQuery ? "Search results" : "Popular categories"}
            </span>
            <div className="flex w-full flex-wrap items-start gap-2">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <FilterChip
                    key={category.id}
                    selected={false}
                    icon={<FeatherHash />}
                    image=""
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category.name}
                  </FilterChip>
                ))
              ) : searchQuery ? (
                <span className="text-body font-body text-subtext-color">
                  No categories found matching "{searchQuery}"
                </span>
              ) : (
                <span className="text-body font-body text-subtext-color">
                  All popular categories are already selected
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-2 border-t border-solid border-neutral-border px-6 py-6">
          <Button
            variant="neutral-tertiary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            Save changes
          </Button>
        </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

export default ChangeListCategoriesModal;
