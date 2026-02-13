"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { TextField } from "@/ui/components/TextField";
import { Loader } from "@/ui/components/Loader";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { FeatherPlus, FeatherTrash, FeatherX } from "@subframe/core";
import { toast } from "@subframe/core";
import DeleteCollectionModal from "./DeleteCollectionModal";

export interface Collection {
  id: string;
  name: string;
  bookmarkCount: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  onCollectionsChange: (collections: Collection[]) => void;
}

export default function ManageCollectionsDrawer({
  open,
  onOpenChange,
  collections: initialCollections,
  onCollectionsChange,
}: Props) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use ref to track if we've already fetched for this open state
  const hasFetchedRef = useRef(false);
  
  // Store the callback in a ref to avoid dependency issues
  const onCollectionsChangeRef = useRef(onCollectionsChange);
  onCollectionsChangeRef.current = onCollectionsChange;

  // Sync with external collections when drawer is closed
  useEffect(() => {
    if (!open) {
      setCollections(initialCollections);
      hasFetchedRef.current = false;
    }
  }, [initialCollections, open]);

  // Fetch collections when drawer opens
  useEffect(() => {
    if (open && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      setNewCollectionName("");
      
      const fetchCollections = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/me/collections", {
            credentials: "include",
          });

          if (!res.ok) throw new Error("Failed to fetch collections");

          const data = await res.json();
          const fetchedCollections = data.collections || [];
          setCollections(fetchedCollections);
        } catch (error) {
          toast.error("Failed to load collections");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCollections();
    }
  }, [open]);

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

      const updatedCollections = [...collections, newCollection].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCollections(updatedCollections);
      onCollectionsChangeRef.current(updatedCollections);
      setNewCollectionName("");
      toast.success("Collection created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle opening delete confirmation modal
  const handleDeleteClick = (collection: Collection) => {
    setCollectionToDelete(collection);
    setDeleteModalOpen(true);
  };

  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    if (!collectionToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/me/collections/${collectionToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete collection");
      }

      const updatedCollections = collections.filter(
        (c) => c.id !== collectionToDelete.id
      );
      setCollections(updatedCollections);
      onCollectionsChangeRef.current(updatedCollections);
      setDeleteModalOpen(false);
      setCollectionToDelete(null);
      toast.success("Collection deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete collection");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DrawerLayout open={open} onOpenChange={onOpenChange}>
        <div className="flex h-full w-full min-w-[384px] max-w-[448px] flex-col items-start bg-default-background">
          {/* Header */}
          <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Manage Collections
            </span>
            <IconButton
              icon={<FeatherX />}
              onClick={() => onOpenChange(false)}
            />
          </div>

          {/* Content */}
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-6 py-6 overflow-y-auto">
            {/* Create new collection */}
            <div className="flex w-full flex-col items-start gap-3">
              <span className="text-body-bold font-body-bold text-default-font">
                Create new collection
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

            {/* Divider */}
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

            {/* Collections list */}
            {isLoading ? (
              <div className="flex w-full items-center justify-center py-8">
                <Loader size="medium" />
              </div>
            ) : collections.length === 0 ? (
              <div className="flex w-full flex-col items-center justify-center py-8 text-center">
                <span className="text-body font-body text-subtext-color">
                  No collections yet. Create one above to get started.
                </span>
              </div>
            ) : (
              <div className="flex w-full flex-col items-start">
                {collections.map((collection, index) => (
                  <div
                    key={collection.id}
                    className={`flex w-full items-center justify-between py-3 ${
                      index < collections.length - 1
                        ? "border-b border-solid border-neutral-border"
                        : ""
                    }`}
                  >
                    <div className="flex grow shrink-0 basis-0 flex-col items-start">
                      <span className="text-body-bold font-body-bold text-default-font">
                        {collection.name}
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        {collection.bookmarkCount}{" "}
                        {collection.bookmarkCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <IconButton
                      variant="neutral-tertiary"
                      size="small"
                      icon={<FeatherTrash />}
                      onClick={() => handleDeleteClick(collection)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerLayout>

      {/* Delete Collection Modal */}
      <DeleteCollectionModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        collectionName={collectionToDelete?.name || ""}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
