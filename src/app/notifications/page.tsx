"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/ui/components/Avatar";
import { Tabs } from "@/ui/components/Tabs";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherCheckCheck, FeatherEye, FeatherHeart, FeatherBell, FeatherInbox, FeatherBellOff } from "@subframe/core";
import { useAuth } from "@/client/hooks/use-auth";
import { Loader } from "@/ui/components/Loader";
import { SkeletonText } from "@/ui/components/SkeletonText";
import { SkeletonCircle } from "@/ui/components/SkeletonCircle";

type NotificationType = "follow" | "comment" | "reaction_milestone" | "view_milestone";

interface NotificationData {
  id: string;
  type: NotificationType;
  user_id: string;
  actor_id: string | null;
  list_id: string | null;
  comment_id: string | null;
  milestone_count: number | null;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  } | null;
  list?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  comment?: {
    id: string;
    content: string;
  } | null;
}

function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

function NotificationItem({ notification, username }: { notification: NotificationData; username?: string }) {
  const textColor = notification.is_read ? "text-subtext-color" : "text-default-font";

  if (notification.type === "follow" && notification.actor) {
    const profileLink = `/profile/${notification.actor.username}`;
    return (
      <Link href={profileLink} className="w-full">
        <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border bg-default-background px-4 py-4 hover:bg-neutral-50 transition-colors">
          {!notification.is_read && (
            <div className="flex h-2 w-2 flex-none items-start rounded-full bg-brand-primary" />
          )}
          <Avatar size="medium" image={notification.actor.avatar || undefined}>
            {notification.actor.name?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            <span className={`text-body font-body ${textColor}`}>
              <strong>{notification.actor.name}</strong> started following you
            </span>
            <span className="text-caption font-caption text-subtext-color">
              {formatRelativeTime(notification.created_at)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (notification.type === "comment" && notification.actor && notification.list && notification.comment) {
    const listLink = username ? `/profile/${username}/${notification.list.slug}` : "#";
    return (
      <Link href={listLink} className="w-full">
        <div className="flex w-full flex-wrap items-center justify-center gap-4 border-b border-solid border-neutral-border bg-default-background px-4 py-4 hover:bg-neutral-50 transition-colors">
          {!notification.is_read && (
            <div className="flex h-2 w-2 flex-none items-start rounded-full bg-brand-primary" />
          )}
          <Avatar size="medium" image={notification.actor.avatar || undefined}>
            {notification.actor.name?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            <span className={`text-body font-body ${textColor}`}>
              <strong>{notification.actor.name}</strong> commented on your list{" "}
              <strong>{notification.list.title}</strong>
            </span>
            <div className="flex flex-col items-start gap-1 rounded-md bg-neutral-50 px-3 py-2">
              <span className={`text-body font-body ${textColor}`}>
                &quot;{notification.comment.content.length > 150 
                  ? notification.comment.content.slice(0, 150) + "..." 
                  : notification.comment.content}&quot;
              </span>
            </div>
            <span className="text-caption font-caption text-subtext-color">
              {formatRelativeTime(notification.created_at)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (notification.type === "reaction_milestone" && notification.list) {
    const listLink = username ? `/profile/${username}/${notification.list.slug}` : "#";
    return (
      <Link href={listLink} className="w-full">
        <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border bg-default-background px-4 py-4 hover:bg-neutral-50 transition-colors">
          {!notification.is_read && (
            <div className="flex h-2 w-2 flex-none items-start rounded-full bg-brand-primary" />
          )}
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-50">
            <FeatherHeart className="text-body font-body text-brand-primary" />
          </div>
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            <span className={`text-body font-body ${textColor}`}>
              Your list <strong>{notification.list.title}</strong> received{" "}
              {(notification.milestone_count || 0).toLocaleString()} reactions
            </span>
            <span className="text-caption font-caption text-subtext-color">
              {formatRelativeTime(notification.created_at)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (notification.type === "view_milestone" && notification.list) {
    const listLink = username ? `/profile/${username}/${notification.list.slug}` : "#";
    return (
      <Link href={listLink} className="w-full">
        <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border bg-default-background px-4 py-4 hover:bg-neutral-50 transition-colors">
          {!notification.is_read && (
            <div className="flex h-2 w-2 flex-none items-start rounded-full bg-brand-primary" />
          )}
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-success-50">
            <FeatherEye className="text-body font-body text-success-600" />
          </div>
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            <span className={`text-body font-body ${textColor}`}>
              Your list <strong>{notification.list.title}</strong> reached{" "}
              {(notification.milestone_count || 0).toLocaleString()} views
            </span>
            <span className="text-caption font-caption text-subtext-color">
              {formatRelativeTime(notification.created_at)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return null;
}

function NotificationSkeleton() {
  return (
    <div className="flex w-full flex-col items-start">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="flex w-full items-center gap-4 border-b border-solid border-neutral-border bg-default-background px-4 py-4"
        >
          <SkeletonCircle size="default" />
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
            <SkeletonText size="default" className="w-3/4 max-w-md" />
            <SkeletonText size="label" className="w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ variant }: { variant: "all" | "unread" }) {
  if (variant === "unread") {
    return (
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-6 py-12">
        <IconWithBackground
          variant="success"
          size="x-large"
          icon={<FeatherBellOff />}
          square={false}
        />
        <div className="flex flex-col items-center gap-2">
          <span className="text-heading-2 font-heading-2 text-default-font">
            All caught up!
          </span>
          <span className="text-body font-body text-subtext-color text-center">
            You&apos;re all up to date. We&apos;ll notify you when there&apos;s activity on your listicles
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-6 px-6 py-12">
      <IconWithBackground
        variant="brand"
        size="x-large"
        icon={<FeatherInbox />}
        square={false}
      />
      <div className="flex flex-col items-center gap-2">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Nothing to see here
        </span>
        <span className="text-body font-body text-subtext-color text-center">
          When people interact with your listicles, you&apos;ll see it here first
        </span>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Get username from user metadata
  const username = user?.user_metadata?.username;

  const fetchNotifications = useCallback(async (loadMore = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const offset = loadMore ? notifications.length : 0;
      const response = await fetch(
        `/api/notifications?limit=${PAGE_SIZE}&offset=${offset}&unreadOnly=${activeTab === "unread"}`
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in to view notifications");
          return;
        }
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      const newNotifications = data.notifications || [];
      
      if (loadMore) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }
      
      // Check if there are more notifications to load
      setHasMore(data.pagination?.hasMore ?? newNotifications.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [user, activeTab, notifications.length]);

  // Initial fetch and when tab changes
  useEffect(() => {
    setNotifications([]);
    setHasMore(false);
    fetchNotifications(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchNotifications(true);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    if (isMarkingRead) return;

    setIsMarkingRead(true);
    try {
      const response = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      }
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Show sign-in prompt if not authenticated
  if (!user && !isLoading) {
    return (
      <div className="container max-w-none flex h-full w-full flex-col items-center justify-center gap-6 bg-default-background py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <FeatherBell className="h-8 w-8 text-neutral-400" />
        </div>
        <div className="text-center">
          <h2 className="text-heading-3 font-heading-3 text-default-font mb-2">
            Sign in to view notifications
          </h2>
          <p className="text-body font-body text-subtext-color">
            You need to be signed in to see your notifications
          </p>
        </div>
      </div>
    );
  }

  // Filter notifications based on active tab (client-side for "all" tab)
  const filteredNotifications = activeTab === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <div className="container max-w-none flex h-full w-full flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
      <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-4">
        <div className="flex flex-col items-start gap-2">
          <span className="text-heading-1 font-heading-1 text-default-font">
            Notifications
          </span>
          <span className="text-body font-body text-subtext-color">
            Stay updated on your listicles and followers
          </span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingRead}
            className="flex items-center gap-2 rounded-md border border-solid border-neutral-border bg-white px-4 py-2 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {isMarkingRead ? (
              <Loader size="small" />
            ) : (
              <FeatherCheckCheck className="text-body font-body text-default-font" />
            )}
            <span className="text-body-bold font-body-bold text-default-font">
              Mark all as read
            </span>
          </button>
        )}
      </div>
      <Tabs>
        <Tabs.Item active={activeTab === "all"} onClick={() => setActiveTab("all")}>
          All
        </Tabs.Item>
        <Tabs.Item active={activeTab === "unread"} onClick={() => setActiveTab("unread")}>
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </Tabs.Item>
      </Tabs>
      <div className="flex w-full flex-col items-start">
        {isLoading ? (
          <NotificationSkeleton />
        ) : error ? (
          <div className="flex w-full flex-col items-center justify-center py-20 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-50">
              <FeatherBell className="h-8 w-8 text-error-600" />
            </div>
            <div className="text-center">
              <h3 className="text-heading-3 font-heading-3 text-default-font mb-1">
                Something went wrong
              </h3>
              <p className="text-body font-body text-subtext-color mb-4">
                {error}
              </p>
              <button
                onClick={() => fetchNotifications()}
                className="text-body-bold font-body-bold text-brand-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState variant={activeTab} />
        ) : (
          <>
            {filteredNotifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                username={username}
              />
            ))}
            {hasMore && (
              <div className="flex w-full justify-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 rounded-md border border-solid border-neutral-border bg-white px-6 py-2.5 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader size="small" />
                      <span className="text-body-bold font-body-bold text-default-font">
                        Loading...
                      </span>
                    </>
                  ) : (
                    <span className="text-body-bold font-body-bold text-default-font">
                      Show more
                    </span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
