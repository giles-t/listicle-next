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
  updatingReactions: Set<string>; // Track which reactions are being updated
  startMutation: (targetId: string | null, emoji: string, action: "add" | "remove") => void;
  completeMutation: (targetId: string | null, emoji: string, success: boolean, originalAction: "add" | "remove") => void;
}

const PageReactionsContext = createContext<PageReactionsContextType | null>(null);

export function usePageReactions() {
  const context = useContext(PageReactionsContext);
  if (!context) {
    throw new Error("usePageReactions must be used within PageReactionsProvider");
  }
  return context;
}

// Helper to create mutation keys
function getMutationKey(targetId: string | null, emoji: string): string {
  return targetId === null ? `list:${emoji}` : `item:${targetId}:${emoji}`;
}

interface PageReactionsProviderProps {
  listId: string;
  children: React.ReactNode;
  pollInterval?: number; // in milliseconds, default 5000
  postMutationDelay?: number; // delay after mutation before refreshing, default 2000
}

export function PageReactionsProvider({
  listId,
  children,
  pollInterval = 5000,
  postMutationDelay = 2000,
}: PageReactionsProviderProps) {
  // Server data
  const [aggregateData, setAggregateData] = useState<AggregateData>({
    list: [],
    items: {},
  });
  
  // Optimistic local state (displayed to user, replaced by server data on refresh)
  const [localCounts, setLocalCounts] = useState<Map<string, number>>(new Map());
  const [userReactions, setUserReactions] = useState<UserReactionsData>({
    list: [],
    items: {},
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [updatingReactions, setUpdatingReactions] = useState<Set<string>>(new Set());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const pendingMutationsRef = useRef(0); // Count of in-flight mutations
  const abortControllerRef = useRef<AbortController | null>(null); // To cancel in-flight fetches

  // Combine server aggregate data with local optimistic counts
  const reactions = React.useMemo((): PageReactionsData => {
    return {
      list: aggregateData.list.map(r => {
        const key = getMutationKey(null, r.emoji);
        const localCount = localCounts.get(key);
        return {
          ...r,
          count: localCount !== undefined ? localCount : r.count,
          userHasReacted: userReactions.list.includes(r.emoji),
        };
      }),
      items: Object.entries(aggregateData.items).reduce((acc, [itemId, itemReactions]) => {
        acc[itemId] = itemReactions.map(r => {
          const key = getMutationKey(itemId, r.emoji);
          const localCount = localCounts.get(key);
          return {
            ...r,
            count: localCount !== undefined ? localCount : r.count,
            userHasReacted: (userReactions.items[itemId] || []).includes(r.emoji),
          };
        });
        return acc;
      }, {} as Record<string, ReactionData[]>),
    };
  }, [aggregateData, localCounts, userReactions]);

  // Cancel any in-flight fetch requests
  const cancelInFlightRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Fetch all data and clear local optimistic state
  const fetchAll = useCallback(async (includeUser: boolean = false) => {
    // Cancel any existing request before starting a new one
    cancelInFlightRequests();
    
    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const url = includeUser 
        ? `/api/lists/${listId}/reactions/all?includeUser=true`
        : `/api/lists/${listId}/reactions/all`;
      const response = await fetch(url, { signal: controller.signal });
      
      if (response.ok && isMountedRef.current) {
        const data = await response.json();
        setAggregateData(data.aggregate);
        
        // Clear all local optimistic counts - server is now the source of truth
        setLocalCounts(new Map());
        
        if (data.userReactions) {
          setUserReactions(data.userReactions);
        }
      }
    } catch (error) {
      // Ignore abort errors - they're expected when we cancel requests
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error("Error fetching reactions:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      // Clear the controller ref if it's still ours
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [listId, cancelInFlightRequests]);

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      // Only poll if no mutations are in flight
      if (pendingMutationsRef.current === 0) {
        fetchAll(false);
      }
    }, pollInterval);
  }, [fetchAll, pollInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Schedule a delayed refresh after mutation
  const scheduleRefresh = useCallback(() => {
    // Cancel any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Schedule new refresh after delay
    refreshTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && pendingMutationsRef.current === 0) {
        fetchAll(false).then(() => {
          // Restart polling after refresh
          startPolling();
        });
      }
      refreshTimeoutRef.current = null;
    }, postMutationDelay);
  }, [fetchAll, postMutationDelay, startPolling]);

  // Initial fetch and setup polling
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch (includes user reactions)
    fetchAll(true);

    // Start polling
    startPolling();

    return () => {
      isMountedRef.current = false;
      stopPolling();
      cancelInFlightRequests();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchAll, startPolling, stopPolling, cancelInFlightRequests]);

  // Get current display count for a reaction
  const getDisplayCount = useCallback((targetId: string | null, emoji: string): number => {
    const key = getMutationKey(targetId, emoji);
    const localCount = localCounts.get(key);
    if (localCount !== undefined) return localCount;
    
    if (targetId === null) {
      const reaction = aggregateData.list.find(r => r.emoji === emoji);
      return reaction?.count ?? 0;
    } else {
      const itemReactions = aggregateData.items[targetId] || [];
      const reaction = itemReactions.find(r => r.emoji === emoji);
      return reaction?.count ?? 0;
    }
  }, [aggregateData, localCounts]);

  // Start a mutation - applies optimistic update immediately
  const startMutation = useCallback(
    (targetId: string | null, emoji: string, action: "add" | "remove") => {
      const key = getMutationKey(targetId, emoji);
      const currentCount = getDisplayCount(targetId, emoji);
      const delta = action === "add" ? 1 : -1;
      const newCount = Math.max(0, currentCount + delta);
      
      // Increment pending mutations
      pendingMutationsRef.current += 1;
      
      // Stop polling while mutating
      stopPolling();
      
      // Cancel any in-flight fetch requests (prevents stale data from overwriting optimistic update)
      cancelInFlightRequests();
      
      // Cancel any pending refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      // Track this reaction as updating
      setUpdatingReactions(prev => new Set(prev).add(key));
      
      // Apply optimistic count update
      setLocalCounts(prev => {
        const next = new Map(prev);
        next.set(key, newCount);
        return next;
      });

      // Update user reactions optimistically
      setUserReactions((prev) => {
        if (targetId === null) {
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

      // For new emojis, add to aggregate data structure so it appears in the list
      if (action === "add") {
        setAggregateData((prev) => {
          if (targetId === null) {
            const exists = prev.list.some((r) => r.emoji === emoji);
            if (!exists) {
              return {
                ...prev,
                list: [...prev.list, { emoji, count: 0 }],
              };
            }
          } else {
            const itemReactions = prev.items[targetId] || [];
            const exists = itemReactions.some((r) => r.emoji === emoji);
            if (!exists) {
              return {
                ...prev,
                items: {
                  ...prev.items,
                  [targetId]: [...itemReactions, { emoji, count: 0 }],
                },
              };
            }
          }
          return prev;
        });
      }
    },
    [getDisplayCount, stopPolling, cancelInFlightRequests]
  );

  // Complete a mutation
  const completeMutation = useCallback(
    (targetId: string | null, emoji: string, success: boolean, originalAction: "add" | "remove") => {
      const key = getMutationKey(targetId, emoji);
      
      // Decrement pending mutations
      pendingMutationsRef.current = Math.max(0, pendingMutationsRef.current - 1);
      
      // Remove from updating set
      setUpdatingReactions(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      
      if (!success) {
        // On failure, revert the optimistic update
        setLocalCounts(prev => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
        
        // Revert user reactions
        setUserReactions((prev) => {
          if (targetId === null) {
            if (originalAction === "add") {
              return {
                ...prev,
                list: prev.list.filter((e) => e !== emoji),
              };
            } else {
              return {
                ...prev,
                list: prev.list.includes(emoji) ? prev.list : [...prev.list, emoji],
              };
            }
          } else {
            const itemReactions = prev.items[targetId] || [];
            if (originalAction === "add") {
              return {
                ...prev,
                items: {
                  ...prev.items,
                  [targetId]: itemReactions.filter((e) => e !== emoji),
                },
              };
            } else {
              return {
                ...prev,
                items: {
                  ...prev.items,
                  [targetId]: itemReactions.includes(emoji)
                    ? itemReactions
                    : [...itemReactions, emoji],
                },
              };
            }
          }
        });
      }
      
      // Schedule a refresh after delay (this will clear local counts and get server truth)
      scheduleRefresh();
    },
    [scheduleRefresh]
  );

  const value: PageReactionsContextType = {
    reactions,
    isLoading,
    updatingReactions,
    startMutation,
    completeMutation,
  };

  return (
    <PageReactionsContext.Provider value={value}>
      {children}
    </PageReactionsContext.Provider>
  );
}

