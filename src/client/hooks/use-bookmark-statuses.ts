"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "./use-auth";

type BookmarkStatus = { bookmarked: boolean; collectionId: string | null };

const EMPTY_MAP = new Map<string, BookmarkStatus>();

/**
 * Batch-fetch bookmark statuses for a list of list IDs in a single API call.
 * Returns a stable empty map when logged out or while loading.
 */
export function useBookmarkStatuses(
  listIds: string[]
): Map<string, BookmarkStatus> {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Map<string, BookmarkStatus>>(
    EMPTY_MAP
  );
  // Stable key derived from sorted IDs — avoids re-running the effect when
  // the caller passes a new array reference with the same contents.
  const key = useMemo(() => listIds.slice().sort().join(","), [listIds]);
  // Keep a ref to the current listIds so the async callback can read the
  // latest value without adding the array itself as an effect dependency.
  const listIdsRef = useRef(listIds);
  listIdsRef.current = listIds;

  useEffect(() => {
    if (!user || !key) {
      setStatuses((prev) => (prev.size > 0 ? new Map() : prev));
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const ids = listIdsRef.current;
        const res = await fetch("/api/me/bookmarks/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listIds: ids }),
        });

        if (!res.ok || cancelled) return;

        const data: Record<
          string,
          { bookmarked: true; collectionId: string | null }
        > = await res.json();

        if (cancelled) return;

        const map = new Map<string, BookmarkStatus>();
        for (const id of ids) {
          const entry = data[id];
          map.set(id, {
            bookmarked: !!entry,
            collectionId: entry?.collectionId ?? null,
          });
        }
        setStatuses(map);
      } catch {
        // Silently fail
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, key]);

  return statuses;
}
