'use client';

import React from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Button } from '@/ui/components/Button';
import { IconWithBackground } from '@/ui/components/IconWithBackground';
import { Badge } from '@/ui/components/Badge';
import {
  FeatherEye,
  FeatherHeart,
  FeatherMessageCircle,
  FeatherUsers,
  FeatherFileText,
  FeatherPlus,
  FeatherList,
  FeatherSettings,
  FeatherBell,
  FeatherEdit2,
  FeatherArrowRight,
} from '@subframe/core';
import { formatRelativeTime } from '@/shared/utils/date';
import type { UserStats } from '@/server/db/queries/profiles';

interface SerializedListPreview {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image: string | null;
  is_published: boolean;
  created_at: string;
  published_at: string | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
}

interface DashboardClientProps {
  user: User;
  profile: { id: string; username: string; name: string; avatar: string | null } | null;
  stats: UserStats;
  recentLists: SerializedListPreview[];
  unreadNotifications: number;
}

function StatCard({
  icon,
  label,
  value,
  variant = 'brand',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'error';
}) {
  return (
    <div className="flex flex-1 min-w-[140px] items-center gap-3 rounded-lg border border-solid border-neutral-border bg-default-background p-4">
      <IconWithBackground variant={variant} size="medium" icon={icon} />
      <div className="flex flex-col">
        <span className="text-heading-2 font-heading-2 text-default-font">
          {value.toLocaleString()}
        </span>
        <span className="text-caption font-caption text-subtext-color">{label}</span>
      </div>
    </div>
  );
}

export function DashboardClient({
  user,
  profile,
  stats,
  recentLists,
  unreadNotifications,
}: DashboardClientProps) {
  const displayName = profile?.name || user.email?.split('@')[0] || 'there';

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-1 font-heading-1 text-default-font">
            Welcome back, {displayName}
          </h1>
          <p className="text-body font-body text-subtext-color">
            Here&apos;s an overview of your content and engagement.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Link href="/notifications">
            <Button
              variant="neutral-secondary"
              icon={<FeatherBell />}
              size="medium"
            >
              Notifications
              {unreadNotifications > 0 && (
                <Badge variant="error">{unreadNotifications}</Badge>
              )}
            </Button>
          </Link>
          <Link href="/create">
            <Button icon={<FeatherPlus />} size="medium">
              New List
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3">
        <StatCard icon={<FeatherFileText />} label="Published Lists" value={stats.listsCount} variant="brand" />
        <StatCard icon={<FeatherEye />} label="Total Views" value={stats.totalViews} variant="neutral" />
        <StatCard icon={<FeatherHeart />} label="Reactions" value={stats.totalLikes} variant="error" />
        <StatCard icon={<FeatherMessageCircle />} label="Comments" value={stats.totalComments} variant="warning" />
        <StatCard icon={<FeatherUsers />} label="Followers" value={stats.followersCount} variant="success" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/create">
          <Button variant="brand-secondary" icon={<FeatherPlus />} size="small">
            Create List
          </Button>
        </Link>
        <Link href="/me/lists">
          <Button variant="neutral-secondary" icon={<FeatherList />} size="small">
            My Lists
          </Button>
        </Link>
        <Link href="/me/bookmarks">
          <Button variant="neutral-secondary" icon={<FeatherHeart />} size="small">
            Bookmarks
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="neutral-secondary" icon={<FeatherSettings />} size="small">
            Settings
          </Button>
        </Link>
      </div>

      {/* Recent Lists */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-heading-2 font-heading-2 text-default-font">
            Recent Lists
          </h2>
          <Link href="/me/lists">
            <Button variant="neutral-tertiary" iconRight={<FeatherArrowRight />} size="small">
              View all
            </Button>
          </Link>
        </div>

        {recentLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-16 px-8">
            <IconWithBackground
              variant="brand"
              size="x-large"
              icon={<FeatherFileText />}
            />
            <div className="flex flex-col items-center gap-1">
              <span className="text-heading-3 font-heading-3 text-default-font">
                No lists yet
              </span>
              <span className="text-body font-body text-subtext-color text-center max-w-md">
                Create your first listicle to get started. Share your knowledge, recommendations, or rankings with the world.
              </span>
            </div>
            <Link href="/create">
              <Button icon={<FeatherPlus />}>Create your first list</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentLists.map((list) => (
              <div
                key={list.id}
                className="flex flex-col gap-3 rounded-lg border border-solid border-neutral-border bg-default-background p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/@${profile?.username}/${list.slug}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-body-bold font-body-bold text-default-font line-clamp-2 hover:text-brand-700 transition-colors">
                      {list.title}
                    </h3>
                  </Link>
                  <Link href={`/me/list/${list.id}/edit`}>
                    <Button variant="neutral-tertiary" icon={<FeatherEdit2 />} size="small" />
                  </Link>
                </div>
                {list.description && (
                  <p className="text-caption font-caption text-subtext-color line-clamp-2">
                    {list.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-solid border-neutral-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-caption font-caption text-subtext-color">
                      <FeatherEye className="w-3 h-3" />
                      {list.viewsCount}
                    </span>
                    <span className="flex items-center gap-1 text-caption font-caption text-subtext-color">
                      <FeatherHeart className="w-3 h-3" />
                      {list.likesCount}
                    </span>
                    <span className="flex items-center gap-1 text-caption font-caption text-subtext-color">
                      <FeatherMessageCircle className="w-3 h-3" />
                      {list.commentsCount}
                    </span>
                  </div>
                  {list.published_at && (
                    <span className="text-caption font-caption text-subtext-color">
                      {formatRelativeTime(list.published_at)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
