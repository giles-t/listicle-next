"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { TextArea } from "@/ui/components/TextArea";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { Loader } from "@/ui/components/Loader";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import {
  FeatherHeart,
  FeatherList,
  FeatherMessageSquare,
  FeatherMoreHorizontal,
  FeatherSend,
  FeatherX,
  FeatherTrash2,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { toast } from "@subframe/core";
import Link from "next/link";
import { useAuth } from "@/client/hooks/use-auth";

interface CommentUser {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  user: CommentUser;
  replies?: Comment[];
  isAuthor?: boolean;
}

interface ListContext {
  id: string;
  title: string;
  slug: string;
  user_id: string;
}

interface ItemContext {
  id: string;
  title: string;
  content: string;
  sort_order: number;
}

interface CommentsDrawerProps {
  listId: string;
  itemId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onCommentAdded?: () => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function CommentItem({
  comment,
  listId,
  currentUserId,
  listOwnerId,
  onReply,
  onDelete,
  isReply = false,
  topLevelParentId,
}: {
  comment: Comment;
  listId: string;
  currentUserId?: string;
  listOwnerId?: string;
  onReply: (commentId: string, username: string) => void;
  onDelete: (commentId: string) => void;
  isReply?: boolean;
  topLevelParentId?: string; // The top-level comment ID for nested replies
}) {
  const canDelete = currentUserId && 
    (comment.user.id === currentUserId || listOwnerId === currentUserId);

  return (
    <div className={`flex w-full items-start gap-3 ${isReply ? "border-l-2 border-solid border-neutral-100 pl-4" : ""}`}>
      <Link href={`/profile/${comment.user.username}`}>
        <Avatar
          size="small"
          image={comment.user.avatar || undefined}
        >
          {comment.user.name.charAt(0).toUpperCase()}
        </Avatar>
      </Link>
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${comment.user.username}`}>
              <span className="text-body-bold font-body-bold text-default-font hover:underline">
                {comment.user.name}
              </span>
            </Link>
            {comment.isAuthor && (
              <Badge variant="brand">Author</Badge>
            )}
            <span className="text-caption font-caption text-subtext-color">
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          {canDelete && (
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton
                  size="small"
                  icon={<FeatherMoreHorizontal />}
                  onClick={() => {}}
                />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem 
                      icon={<FeatherTrash2 />} 
                      onClick={() => onDelete(comment.id)}
                    >
                      Delete
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          )}
        </div>
        <span className="text-body font-body text-default-font whitespace-pre-wrap">
          {comment.content}
        </span>
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={() => {
              // For replies, use the top-level parent to keep nesting flat
              const parentId = isReply && topLevelParentId ? topLevelParentId : comment.id;
              onReply(parentId, comment.user.username);
            }}
            className="flex items-center gap-1 hover:opacity-70 transition-opacity"
          >
            <span className="text-caption-bold font-caption-bold text-subtext-color">
              Reply
            </span>
          </button>
        </div>
        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="flex w-full flex-col items-start gap-3 mt-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                listId={listId}
                currentUserId={currentUserId}
                listOwnerId={listOwnerId}
                onReply={onReply}
                onDelete={onDelete}
                isReply={true}
                topLevelParentId={comment.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentsDrawer({
  listId,
  itemId = null,
  open,
  onOpenChange,
  title = "Comments",
  onCommentAdded,
}: CommentsDrawerProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [listContext, setListContext] = useState<ListContext | null>(null);
  const [itemContext, setItemContext] = useState<ItemContext | null>(null);

  // Define fetchComments before it's used in useEffect
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`/api/lists/${listId}/comments`, window.location.origin);
      if (itemId) {
        url.searchParams.set("itemId", itemId);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data.comments);
      setTotalCount(data.total);
      setListContext(data.context?.list || null);
      setItemContext(data.context?.item || null);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [listId, itemId]);

  // Fetch comments when drawer opens
  useEffect(() => {
    if (open) {
      fetchComments();
    } else {
      // Reset state when drawer closes
      setNewComment("");
      setReplyingTo(null);
    }
  }, [open, fetchComments]);

  const handlePostComment = async () => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch(`/api/lists/${listId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
          itemId: itemId || null,
          parentId: replyingTo,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Handle moderation rejection specifically
        if (response.status === 422) {
          toast.error(data.error || "Your comment could not be posted due to content policy.");
          return;
        }
        throw new Error(data.error || "Failed to post comment");
      }

      // Clear input and refresh comments
      setNewComment("");
      setReplyingTo(null);
      await fetchComments();
      toast.success(replyingTo ? "Reply posted" : "Comment posted");
      
      // Notify parent component
      onCommentAdded?.();
    } catch (err: any) {
      console.error("Error posting comment:", err);
      toast.error(err.message || "Failed to post comment");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/lists/${listId}/comments?commentId=${commentId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete comment");
      }

      await fetchComments();
      toast.success("Comment deleted");
      onCommentAdded?.();
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      toast.error(err.message || "Failed to delete comment");
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo(commentId);
    setNewComment(`@${username} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };

  return (
    <DrawerLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full min-w-[384px] flex-col items-start bg-default-background mobile:min-w-full">
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-6">
          <div className="flex items-center gap-2">
            <FeatherMessageSquare className="text-heading-3 font-heading-3 text-default-font" />
            <span className="text-heading-3 font-heading-3 text-default-font">
              {title}
            </span>
            <Badge variant="neutral">{totalCount}</Badge>
          </div>
          <IconButton
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        {/* Context Card */}
        {(listContext || itemContext) && (
          <div className="flex w-full flex-col items-start gap-4 px-6 pt-6">
            <div className="flex w-full flex-col items-start gap-3 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4">
              <div className="flex w-full items-center gap-2">
                <FeatherList className="text-body font-body text-subtext-color" />
                <span className="line-clamp-1 text-caption-bold font-caption-bold text-subtext-color">
                  {listContext?.title}
                </span>
              </div>
              {itemContext && (
                <span className="text-body-bold font-body-bold text-default-font">
                  {itemContext.sort_order + 1}. {itemContext.title}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-6 py-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex w-full items-center justify-center py-12">
              <Loader size="medium" />
            </div>
          ) : error ? (
            <div className="flex w-full items-center justify-center py-12">
              <span className="text-body font-body text-error-600">{error}</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center py-12 gap-2">
              <FeatherMessageSquare className="text-subtext-color h-8 w-8" />
              <span className="text-body font-body text-subtext-color">
                No comments yet
              </span>
              <span className="text-caption font-caption text-subtext-color">
                Be the first to comment!
              </span>
            </div>
          ) : (
            <div className="flex w-full flex-col items-start gap-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  listId={listId}
                  currentUserId={user?.id}
                  listOwnerId={listContext?.user_id}
                  onReply={handleReply}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="flex w-full flex-col items-start gap-4 border-t border-solid border-neutral-border bg-default-background px-6 py-6">
          {replyingTo && (
            <div className="flex w-full items-center justify-between bg-neutral-50 px-3 py-2 rounded-md">
              <span className="text-caption font-caption text-subtext-color">
                Replying to comment
              </span>
              <button
                onClick={cancelReply}
                className="text-caption font-caption text-subtext-color hover:text-default-font"
              >
                Cancel
              </button>
            </div>
          )}
          <TextArea className="h-auto w-full flex-none" label="" helpText="">
            <TextArea.Input
              placeholder={user ? "Add a comment..." : "Log in to comment"}
              value={newComment}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewComment(event.target.value)
              }
              disabled={!user}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handlePostComment();
                }
              }}
            />
          </TextArea>
          <div className="flex w-full flex-col items-end justify-between">
            <Button
              variant="brand-primary"
              size="medium"
              icon={<FeatherSend />}
              onClick={handlePostComment}
              loading={isPosting}
              disabled={!user || !newComment.trim()}
            >
              {replyingTo ? "Post Reply" : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
    </DrawerLayout>
  );
}

export default CommentsDrawer;
