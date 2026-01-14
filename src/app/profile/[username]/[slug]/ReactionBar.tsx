"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button } from "@/ui/components/Button";
import { SkeletonText } from "@/ui/components/SkeletonText";
import { FeatherPlus } from "@subframe/core";
import { EmojiPicker } from "frimousse";
import NumberFlow from "@number-flow/react";
import { usePageReactions } from "./PageReactionsContext";

interface ReactionBarProps {
  listId: string;
  targetId?: string | null; // null for list, string for list items
  userId?: string;
}

// Quick access emojis
const QUICK_EMOJIS = ["😊", "❤️", "👍", "🏆"];

// Helper to create mutation keys (must match context)
function getMutationKey(targetId: string | null, emoji: string): string {
  return targetId === null ? `list:${emoji}` : `item:${targetId}:${emoji}`;
}

export function ReactionBar({ listId, targetId = null, userId }: ReactionBarProps) {
  const { reactions, isLoading: contextLoading, updatingReactions, startMutation, completeMutation } = usePageReactions();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLDivElement>(null);
  
  // Auto-animate for smooth transitions when reactions are added/removed
  const [animationParent] = useAutoAnimate({
    duration: 200,
    easing: "ease-out",
  });

  // Get reactions for this specific target (list or item)
  const targetReactions = useMemo(() => {
    if (targetId === null) {
      return reactions.list;
    }
    return reactions.items[targetId] || [];
  }, [reactions, targetId]);

  // Get user's reactions
  const userReactions = useMemo(() => {
    return targetReactions.filter(r => r.userHasReacted).map(r => r.emoji);
  }, [targetReactions]);

  // Check if a specific reaction is currently updating
  const isReactionUpdating = useCallback((emoji: string) => {
    const key = getMutationKey(targetId, emoji);
    return updatingReactions.has(key);
  }, [targetId, updatingReactions]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
    }

    if (showEmojiPicker) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showEmojiPicker]);

  const handleReactionClick = useCallback(async (emoji: string) => {
    if (!userId) {
      console.log("User must be logged in to react");
      return;
    }

    // Check if this specific reaction is already updating
    if (isReactionUpdating(emoji)) return;

    const isUserReaction = userReactions.includes(emoji);
    const action = isUserReaction ? "remove" : "add";

    // Start mutation - applies optimistic update immediately
    startMutation(targetId, emoji, action);

    try {
      let response: Response;
      
      if (isUserReaction) {
        // Remove reaction
        response = await fetch(
          `/api/lists/${listId}/reactions?emoji=${encodeURIComponent(emoji)}${targetId ? `&targetId=${encodeURIComponent(targetId)}` : ''}`,
          { method: "DELETE" }
        );
      } else {
        // Add reaction
        response = await fetch(`/api/lists/${listId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            emoji,
            targetId: targetId || undefined,
          }),
        });
      }

      // Complete mutation - will revert if failed
      completeMutation(targetId, emoji, response.ok, action);
      
      if (!response.ok) {
        console.error(`Failed to ${action} reaction`);
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Revert on error
      completeMutation(targetId, emoji, false, action);
    }
  }, [userId, userReactions, isReactionUpdating, targetId, listId, startMutation, completeMutation]);

  const handleEmojiSelect = useCallback(({ emoji }: { emoji: string }) => {
    handleReactionClick(emoji);
    setShowEmojiPicker(false);
  }, [handleReactionClick]);

  // Group reactions: quick emojis first, then others
  const quickReactions = useMemo(() => {
    return QUICK_EMOJIS.map((emoji) => {
      const existing = targetReactions.find((r) => r.emoji === emoji);
      return existing || { emoji, count: 0, userHasReacted: false };
    });
  }, [targetReactions]);

  const otherReactions = useMemo(() => {
    return targetReactions.filter((r) => !QUICK_EMOJIS.includes(r.emoji) && r.count > 0);
  }, [targetReactions]);

  if (contextLoading) {
    return (
      <div className="flex w-full items-start rounded-md border border-solid border-neutral-border px-2 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Skeleton buttons for quick reactions */}
          {QUICK_EMOJIS.map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 rounded-md bg-neutral-100 border border-solid border-transparent px-2 py-1 dark:bg-neutral-800"
            >
              <SkeletonText className="h-5 w-5 rounded-full flex-shrink-0" />
              <SkeletonText className="h-3.5 w-3.5 rounded flex-shrink-0" />
            </div>
          ))}
          {/* Skeleton for add button */}
          <div className="flex items-center justify-center rounded-md bg-neutral-100 border border-solid border-transparent w-6 h-6 py-3.5 dark:bg-neutral-800">
            <SkeletonText className="h-3.5 w-3.5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start rounded-md border border-solid border-neutral-border px-2 py-2 relative">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Animated container for reactions only */}
        <div ref={animationParent} className="contents">
          {/* Quick access emoji buttons */}
          {quickReactions.map((reaction) => {
            const isUserReaction = reaction.userHasReacted;
            const showCount = reaction.count > 0;
            const isUpdating = isReactionUpdating(reaction.emoji);

            return (
              <Button
                key={reaction.emoji}
                variant="neutral-tertiary"
                size="small"
                onClick={() => handleReactionClick(reaction.emoji)}
                disabled={!userId}
                className={`py-3.5 transition-colors duration-150 ${
                  isUserReaction 
                    ? "!bg-brand-50 !border !border-solid !border-brand-300 hover:!bg-brand-100 dark:!bg-brand-950 dark:!border-brand-500" 
                    : "!bg-neutral-100 !border !border-solid !border-transparent hover:!bg-neutral-200 dark:!bg-neutral-800 dark:hover:!bg-neutral-700"
                } ${isUpdating ? "opacity-70" : ""}`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-xl">{reaction.emoji}</span>
                  {showCount && (
                    <NumberFlow 
                      value={reaction.count}
                      transformTiming={{ duration: 250, easing: "ease-out" }}
                      className={`text-sm font-medium tabular-nums ${
                        isUserReaction ? "text-brand-700 dark:text-brand-300" : ""
                      }`}
                    />
                  )}
                </span>
              </Button>
            );
          })}

          {/* Other reactions - only show if they have counts */}
          {otherReactions.map((reaction) => {
            const isUserReaction = reaction.userHasReacted;
            const isUpdating = isReactionUpdating(reaction.emoji);

            return (
              <Button
                key={reaction.emoji}
                variant="neutral-tertiary"
                size="small"
                onClick={() => handleReactionClick(reaction.emoji)}
                disabled={!userId}
                className={`py-3.5 transition-colors duration-150 ${
                  isUserReaction 
                    ? "!bg-brand-50 !border !border-solid !border-brand-300 hover:!bg-brand-100 dark:!bg-brand-950 dark:!border-brand-500" 
                    : "!bg-neutral-100 !border !border-solid !border-transparent hover:!bg-neutral-200 dark:!bg-neutral-800 dark:hover:!bg-neutral-700"
                } ${isUpdating ? "opacity-70" : ""}`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-xl">{reaction.emoji}</span>
                  <NumberFlow 
                    value={reaction.count}
                    transformTiming={{ duration: 250, easing: "ease-out" }}
                    className={`text-sm font-medium tabular-nums ${
                      isUserReaction ? "text-brand-700 dark:text-brand-300" : ""
                    }`}
                  />
                </span>
              </Button>
            );
          })}
        </div>

        {/* Add emoji button - OUTSIDE animated container to prevent jumping */}
        <div className="relative" ref={emojiButtonRef}>
          <Button
            className="py-3.5 !bg-neutral-100 !border !border-solid !border-transparent hover:!bg-neutral-200 dark:!bg-neutral-800 dark:hover:!bg-neutral-700"
            variant="neutral-tertiary"
            size="small"
            icon={<FeatherPlus />}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!userId}
          />

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute top-full left-0 mt-2 z-50 shadow-lg rounded-lg border border-neutral-border animate-in fade-in-0 zoom-in-95 duration-150"
            >
              <EmojiPicker.Root 
                className="isolate flex h-[368px] w-fit flex-col bg-white dark:bg-neutral-900 rounded-lg"
                onEmojiSelect={handleEmojiSelect}
              >
                <EmojiPicker.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-neutral-100 px-2.5 py-2 text-sm dark:bg-neutral-800" />
                <EmojiPicker.Viewport className="relative flex-1 outline-hidden">
                  <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                    Loading…
                  </EmojiPicker.Loading>
                  <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                    No emoji found.
                  </EmojiPicker.Empty>
                  <EmojiPicker.List
                    className="select-none pb-1.5"
                    components={{
                      CategoryHeader: ({ category, ...props }) => (
                        <div
                          className="bg-white px-3 pt-3 pb-1.5 font-medium text-neutral-600 text-xs dark:bg-neutral-900 dark:text-neutral-400"
                          {...props}
                        >
                          {category.label}
                        </div>
                      ),
                      Row: ({ children, ...props }) => (
                        <div className="scroll-my-1.5 px-1.5" {...props}>
                          {children}
                        </div>
                      ),
                      Emoji: ({ emoji, ...props }) => (
                        <button
                          className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-neutral-100 dark:data-[active]:bg-neutral-800"
                          {...props}
                        >
                          {emoji.emoji}
                        </button>
                      ),
                    }}
                  />
                </EmojiPicker.Viewport>
              </EmojiPicker.Root>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
