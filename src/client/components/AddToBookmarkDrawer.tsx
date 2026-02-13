"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { RadioCardGroup } from "@/ui/components/RadioCardGroup";
import { TextField } from "@/ui/components/TextField";
import { Loader } from "@/ui/components/Loader";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { FeatherPlus, FeatherTrash, FeatherX } from "@subframe/core";
import { toast } from "@subframe/core";

export interface Collection {
  id: string;
  name: string;
  bookmarkCount: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Whether the item is already bookmarked */
  isBookmarked: boolean;
  /** Current collection ID if bookmarked */
  currentCollectionId?: string | null;
  /** Called when user saves (add or update bookmark) */
  onSave: (collectionId: string | null, collectionName: string | null) => void;
  /** Called when user deletes bookmark (only shown if isBookmarked) */
  onDelete?: () => void;
  /** Whether save/delete is in progress */
  isLoading?: boolean;
}

export default function AddToBookmarkDrawer({
  open,
  onOpenChange,
  isBookmarked,
  currentCollectionId = null,
  onSave,
  onDelete,
  isLoading = false,
}: Props) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(currentCollectionId);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    setIsLoadingCollections(true);
    try {
      const res = await fetch("/api/me/collections", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch collections");

      const data = await res.json();
      setCollections(data.collections || []);
    } catch (error) {
      toast.error("Failed to load collections");
    } finally {
      setIsLoadingCollections(false);
    }
  }, []);

  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setSelectedCollectionId(currentCollectionId);
      setNewCollectionName("");
      fetchCollections();
    }
  }, [open, currentCollectionId, fetchCollections]);

  // Handle creating a new collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/me/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create collection");
      }

      const data = await res.json();
      const newCollection = {
        ...data.collection,
        bookmarkCount: 0,
      };

      setCollections((prev) => [...prev, newCollection].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCollectionId(newCollection.id);
      setNewCollectionName("");
      toast.success("Collection created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle save
  const handleSave = () => {
    const selectedCollection = collections.find((c) => c.id === selectedCollectionId);
    const collectionName = selectedCollection?.name || null;
    onSave(selectedCollectionId, collectionName);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const hasChanges = !isBookmarked || selectedCollectionId !== currentCollectionId;
  const title = isBookmarked ? "Edit Bookmark" : "Add to Collection";

  return (
    <DrawerLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full min-w-[384px] max-w-[448px] flex-col items-start bg-default-background">
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4">
          <span className="text-heading-2 font-heading-2 text-default-font">
            {title}
          </span>
          <IconButton
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        {/* Content */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 overflow-hidden px-6 py-6">
          {isLoadingCollections ? (
            <div className="flex w-full items-center justify-center py-8">
              <Loader size="medium" />
            </div>
          ) : (
            <RadioCardGroup
              className="w-full grow shrink-0 basis-0 overflow-y-auto"
              value={selectedCollectionId || "uncategorized"}
              onValueChange={(value: string) => {
                setSelectedCollectionId(value === "uncategorized" ? null : value);
              }}
            >
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-3">
                {/* Uncategorized option */}
                <RadioCardGroup.RadioCard hideRadio={true} value="uncategorized">
                  <div className="flex w-full items-center gap-2">
                    <div className="flex grow shrink-0 basis-0 items-start">
                      <div className="flex grow shrink-0 basis-0 flex-col items-start">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Uncategorized
                        </span>
                        <span className="text-caption font-caption text-subtext-color">
                          No collection
                        </span>
                      </div>
                    </div>
                    {/* Show "Current" only if bookmarked and currently in uncategorized */}
                    {isBookmarked && !currentCollectionId && (
                      <Badge variant="neutral">Current</Badge>
                    )}
                    {/* Show "Selected" if uncategorized is selected and it's not the current */}
                    {!selectedCollectionId && (isBookmarked ? currentCollectionId !== null : true) && (
                      <Badge variant="success">Selected</Badge>
                    )}
                  </div>
                </RadioCardGroup.RadioCard>

                {/* User's collections */}
                {collections.map((collection) => (
                  <RadioCardGroup.RadioCard
                    key={collection.id}
                    hideRadio={true}
                    value={collection.id}
                  >
                    <div className="flex w-full items-center gap-2">
                      <div className="flex grow shrink-0 basis-0 items-start">
                        <div className="flex grow shrink-0 basis-0 flex-col items-start">
                          <span className="text-body-bold font-body-bold text-default-font">
                            {collection.name}
                          </span>
                          <span className="text-caption font-caption text-subtext-color">
                            {collection.bookmarkCount} {collection.bookmarkCount === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                      {/* Show "Current" only if bookmarked and this is the current collection */}
                      {isBookmarked && currentCollectionId === collection.id && (
                        <Badge variant="neutral">Current</Badge>
                      )}
                      {/* Show "Selected" if this collection is selected and it's not the current */}
                      {selectedCollectionId === collection.id && currentCollectionId !== collection.id && (
                        <Badge variant="success">Selected</Badge>
                      )}
                    </div>
                  </RadioCardGroup.RadioCard>
                ))}
              </div>
            </RadioCardGroup>
          )}

          {/* Divider */}
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

          {/* Create new collection */}
          <div className="flex w-full flex-col items-start gap-3">
            <span className="text-body-bold font-body-bold text-default-font">
              Or create new collection
            </span>
            <div className="flex w-full items-center gap-2">
              <TextField
                className="h-auto grow shrink-0 basis-0"
                label=""
                helpText=""
                icon={<FeatherPlus />}
                iconRight={null}
              >
                <TextField.Input
                  placeholder="Enter collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCollectionName.trim()) {
                      handleCreateCollection();
                    }
                  }}
                />
              </TextField>
              <Button
                variant="neutral-primary"
                size="medium"
                icon={<FeatherPlus />}
                iconRight={null}
                onClick={handleCreateCollection}
                loading={isCreating}
                disabled={!newCollectionName.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Delete bookmark option (only if already bookmarked) */}
          {isBookmarked && onDelete && (
            <>
              <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
              <div className="flex w-full flex-col items-start gap-2 px-2 py-2">
                <Button
                  className="h-8 w-full flex-none"
                  variant="destructive-secondary"
                  size="medium"
                  icon={<FeatherTrash />}
                  iconRight={null}
                  onClick={handleDelete}
                  loading={isDeleting}
                  disabled={isLoading}
                >
                  Delete Bookmark
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex w-full items-center justify-end gap-2 border-t border-solid border-neutral-border px-6 py-4">
          <Button
            variant="neutral-tertiary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={isLoading}
            disabled={!hasChanges || isLoading}
          >
            {isBookmarked ? "Save Changes" : "Save Bookmark"}
          </Button>
        </div>
      </div>
    </DrawerLayout>
  );
}
