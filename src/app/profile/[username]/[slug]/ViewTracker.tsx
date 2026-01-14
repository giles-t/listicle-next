"use client";

import { useEffect, useRef, useCallback } from "react";

interface ViewTrackerProps {
  listId: string;
  itemIds: string[];
}

/**
 * ViewTracker component uses Intersection Observer to track when list items
 * enter the viewport and batches the view tracking API calls.
 */
export function ViewTracker({ listId, itemIds }: ViewTrackerProps) {
  const viewedItemsRef = useRef<Set<string>>(new Set());
  const pendingItemsRef = useRef<Set<string>>(new Set());
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Flush pending items to the API
  const flushPendingViews = useCallback(async () => {
    if (pendingItemsRef.current.size === 0) return;

    const itemsToTrack = Array.from(pendingItemsRef.current);
    pendingItemsRef.current.clear();

    try {
      await fetch("/api/views/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, itemIds: itemsToTrack }),
      });
    } catch (error) {
      console.error("[ViewTracker] Error tracking item views:", error);
    }
  }, [listId]);

  // Schedule a flush with debounce
  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    flushTimeoutRef.current = setTimeout(() => {
      flushPendingViews();
      flushTimeoutRef.current = null;
    }, 500); // 500ms debounce
  }, [flushPendingViews]);

  // Handle item entering viewport
  const handleItemVisible = useCallback(
    (itemId: string) => {
      // Skip if already tracked this session
      if (viewedItemsRef.current.has(itemId)) return;

      // Mark as viewed
      viewedItemsRef.current.add(itemId);
      pendingItemsRef.current.add(itemId);

      // Schedule batch API call
      scheduleFlush();
    },
    [scheduleFlush]
  );

  // Set up Intersection Observer
  useEffect(() => {
    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute("data-item-id");
            if (itemId) {
              handleItemVisible(itemId);
            }
          }
        });
      },
      {
        // Trigger when at least 50% of the item is visible
        threshold: 0.5,
        // Start observing a bit before the item enters viewport
        rootMargin: "100px 0px",
      }
    );

    // Observe all list items
    itemIds.forEach((itemId) => {
      const element = document.querySelector(`[data-item-id="${itemId}"]`);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      // Cleanup observer
      observerRef.current?.disconnect();
      
      // Flush any pending views on unmount
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      if (pendingItemsRef.current.size > 0) {
        // Fire final flush synchronously (best effort)
        const itemsToTrack = Array.from(pendingItemsRef.current);
        if (itemsToTrack.length > 0) {
          // Use sendBeacon for reliable delivery on page unload
          const data = JSON.stringify({ listId, itemIds: itemsToTrack });
          navigator.sendBeacon?.("/api/views/items", new Blob([data], { type: "application/json" }));
        }
      }
    };
  }, [itemIds, listId, handleItemVisible]);

  // This component doesn't render anything
  return null;
}

/**
 * ListViewTracker tracks the list page view on mount
 */
export function ListViewTracker({ listId }: { listId: string }) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    // Track the list view
    fetch(`/api/views/list/${listId}`, {
      method: "POST",
    }).catch((error) => {
      console.error("[ListViewTracker] Error tracking list view:", error);
    });
  }, [listId]);

  return null;
}
