"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "@subframe/core";
import { AddBookmarkComponent } from "@/ui/components/AddBookmarkComponent";
import AddToBookmarkDrawer from "@/client/components/AddToBookmarkDrawer";
import { useAuth } from "@/client/hooks/use-auth";

interface AddBookmarkButtonProps {
  listId: string;
  listItemId?: string;
  size?: "small" | "medium" | "large";
  initialBookmarked?: boolean;
  initialCollectionId?: string | null;
  onBookmarkChange?: (bookmarked: boolean, collectionId?: string | null) => void;
  className?: string;
}

export function AddBookmarkButton({
  listId,
  listItemId,
  size = "medium",
  initialBookmarked,
  initialCollectionId,
  onBookmarkChange,
  className,
}: AddBookmarkButtonProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked ?? false);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(initialCollectionId ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasFetchedStatus, setHasFetchedStatus] = useState(
    initialBookmarked !== undefined
  );

  // Fetch bookmark status if not provided via props
  const fetchBookmarkStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      const url = `/api/lists/${listId}${listItemId ? `/items/${listItemId}` : ""}/bookmark`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
        setCurrentCollectionId(data.collectionId ?? null);
      }
    } catch (error) {
      console.error("Error fetching bookmark status:", error);
    } finally {
      setHasFetchedStatus(true);
    }
  }, [listId, listItemId, user]);

  // Fetch initial status if not provided
  useEffect(() => {
    if (initialBookmarked === undefined && user && !hasFetchedStatus) {
      fetchBookmarkStatus();
    }
  }, [initialBookmarked, user, hasFetchedStatus, fetchBookmarkStatus]);

  // Sync with props if they change
  useEffect(() => {
    if (initialBookmarked !== undefined) {
      setIsBookmarked(initialBookmarked);
      setCurrentCollectionId(initialCollectionId ?? null);
    }
  }, [initialBookmarked, initialCollectionId]);

  const handleClick = () => {
    if (!user) {
      toast.error("Please log in to bookmark");
      return;
    }
    // Always open drawer whether bookmarked or not
    setDrawerOpen(true);
  };

  const handleSave = async (collectionId: string | null, collectionName: string | null) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/lists/${listId}${listItemId ? `/items/${listItemId}` : ""}/bookmark`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectionId }),
        }
      );

      if (response.ok) {
        setIsBookmarked(true);
        setCurrentCollectionId(collectionId);
        setDrawerOpen(false);
        
        const displayName = collectionName || "Uncategorized";
        if (isBookmarked) {
          toast.success(`Moved to ${displayName}`);
        } else {
          toast.success(`Saved to ${displayName}`);
        }
        onBookmarkChange?.(true, collectionId);
      } else if (response.status === 401) {
        toast.error("Please log in to bookmark");
      } else {
        toast.error("Failed to save bookmark");
      }
    } catch (error) {
      console.error("Error saving bookmark:", error);
      toast.error("Failed to save bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/lists/${listId}${listItemId ? `/items/${listItemId}` : ""}/bookmark`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setIsBookmarked(false);
        setCurrentCollectionId(null);
        setDrawerOpen(false);
        toast.success("Bookmark removed");
        onBookmarkChange?.(false);
      } else {
        toast.error("Failed to remove bookmark");
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Failed to remove bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AddBookmarkComponent
        size={size}
        active={isBookmarked}
        loading={isLoading}
        disabled={isLoading}
        onClick={handleClick}
        className={className}
      />
      
      <AddToBookmarkDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        isBookmarked={isBookmarked}
        currentCollectionId={currentCollectionId}
        onSave={handleSave}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </>
  );
}
