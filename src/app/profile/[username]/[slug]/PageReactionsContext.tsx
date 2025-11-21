"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

export interface ReactionData {
  emoji: string;
  count: number;
  userHasReacted: boolean;
}

interface PageReactionsData {
  list: ReactionData[];
  items: Record<string, ReactionData[]>;
}

interface UserReactionsData {
  list: string[];
  items: Record<string, string[]>;
}

interface AggregateReactionData {
  emoji: string;
  count: number;
}

interface AggregateData {
  list: AggregateReactionData[];
  items: Record<string, AggregateReactionData[]>;
}

interface PageReactionsContextType {
  reactions: PageReactionsData;
  isLoading: boolean;
  resetPollInterval: () => void;
  optimisticUpdate: (
    targetId: string | null,
    emoji: string,
    action: "add" | "remove"
  ) => void;
}

const PageReactionsContext = createContext<PageReactionsContextType | null>(null);

export function usePageReactions() {
  const context = useContext(PageReactionsContext);
  if (!context) {
    throw new Error("usePageReactions must be used within PageReactionsProvider");
  }
  return context;
}

interface PageReactionsProviderProps {
  listId: string;
  children: React.ReactNode;
  pollInterval?: number; // in milliseconds, default 5000
}

export function PageReactionsProvider({
  listId,
  children,
  pollInterval = 5000,
}: PageReactionsProviderProps) {
  // Separate state for aggregate (counts) and user reactions
  const [aggregateData, setAggregateData] = useState<AggregateData>({
    list: [],
    items: {},
  });
  const [userReactions, setUserReactions] = useState<UserReactionsData>({
    list: [],
    items: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const hasLoadedUserReactions = useRef(false);

  // Combine aggregate + user reactions into final reaction data
  const reactions = React.useMemo((): PageReactionsData => {
    return {
      list: aggregateData.list.map(r => ({
        ...r,
        userHasReacted: userReactions.list.includes(r.emoji),
      })),
      items: Object.entries(aggregateData.items).reduce((acc, [itemId, itemReactions]) => {
        acc[itemId] = itemReactions.map(r => ({
          ...r,
          userHasReacted: (userReactions.items[itemId] || []).includes(r.emoji),
        }));
        return acc;
      }, {} as Record<string, ReactionData[]>),
    };
  }, [aggregateData, userReactions]);

  // Initial fetch: Get both aggregate + user reactions
  const fetchInitial = useCallback(async () => {
    try {
      const response = await fetch(`/api/lists/${listId}/reactions/all?includeUser=true`);
      if (response.ok && isMountedRef.current) {
        const data = await response.json();
        setAggregateData(data.aggregate);
        if (data.userReactions) {
          setUserReactions(data.userReactions);
          hasLoadedUserReactions.current = true;
        }
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [listId]);

  // Polling: Only fetch aggregate data (no DB query for user reactions!)
  const fetchAggregate = useCallback(async () => {
    try {
      const response = await fetch(`/api/lists/${listId}/reactions/all`);
      if (response.ok && isMountedRef.current) {
        const data = await response.json();
        setAggregateData(data.aggregate);
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  }, [listId]);

  // Reset the polling interval (e.g., after a write operation)
  const resetPollInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchAggregate, pollInterval);
    }
  }, [fetchAggregate, pollInterval]);

  // Initial fetch and setup polling
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch (includes user reactions)
    fetchInitial();

    // Setup polling interval (only fetches aggregate)
    intervalRef.current = setInterval(fetchAggregate, pollInterval);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchInitial, fetchAggregate, pollInterval]);

  // Optimistic update for immediate feedback (client-side only!)
  const optimisticUpdate = useCallback(
    (targetId: string | null, emoji: string, action: "add" | "remove") => {
      // Update user reactions (client-side state)
      setUserReactions((prev) => {
        if (targetId === null) {
          // Update list reactions
          if (action === "add") {
            return {
              ...prev,
              list: prev.list.includes(emoji) ? prev.list : [...prev.list, emoji],
            };
          } else {
            return {
              ...prev,
              list: prev.list.filter((e) => e !== emoji),
            };
          }
        } else {
          // Update item reactions
          const itemReactions = prev.items[targetId] || [];
          if (action === "add") {
            return {
              ...prev,
              items: {
                ...prev.items,
                [targetId]: itemReactions.includes(emoji)
                  ? itemReactions
                  : [...itemReactions, emoji],
              },
            };
          } else {
            return {
              ...prev,
              items: {
                ...prev.items,
                [targetId]: itemReactions.filter((e) => e !== emoji),
              },
            };
          }
        }
      });

      // Optimistically update aggregate counts too
      setAggregateData((prev) => {
        if (targetId === null) {
          // Update list reactions
          const existingReaction = prev.list.find((r) => r.emoji === emoji);
          
          if (action === "add") {
            if (existingReaction) {
              return {
                ...prev,
                list: prev.list.map((r) =>
                  r.emoji === emoji ? { ...r, count: r.count + 1 } : r
                ),
              };
            } else {
              return {
                ...prev,
                list: [...prev.list, { emoji, count: 1 }],
              };
            }
          } else {
            // Remove
            return {
              ...prev,
              list: prev.list
                .map((r) =>
                  r.emoji === emoji ? { ...r, count: r.count - 1 } : r
                )
                .filter((r) => r.count > 0),
            };
          }
        } else {
          // Update item reactions
          const itemReactions = prev.items[targetId] || [];
          const existingReaction = itemReactions.find((r) => r.emoji === emoji);

          if (action === "add") {
            if (existingReaction) {
              return {
                ...prev,
                items: {
                  ...prev.items,
                  [targetId]: itemReactions.map((r) =>
                    r.emoji === emoji ? { ...r, count: r.count + 1 } : r
                  ),
                },
              };
            } else {
              return {
                ...prev,
                items: {
                  ...prev.items,
                  [targetId]: [...itemReactions, { emoji, count: 1 }],
                },
              };
            }
          } else {
            // Remove
            return {
              ...prev,
              items: {
                ...prev.items,
                [targetId]: itemReactions
                  .map((r) =>
                    r.emoji === emoji ? { ...r, count: r.count - 1 } : r
                  )
                  .filter((r) => r.count > 0),
              },
            };
          }
        }
      });
    },
    []
  );

  const value: PageReactionsContextType = {
    reactions,
    isLoading,
    resetPollInterval,
    optimisticUpdate,
  };

  return (
    <PageReactionsContext.Provider value={value}>
      {children}
    </PageReactionsContext.Provider>
  );
}

