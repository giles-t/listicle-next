import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/ui/components/Avatar";
import { FeatherVerified } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherUserPlus } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherTwitter } from "@subframe/core";
import { FeatherInstagram } from "@subframe/core";
import { FeatherLinkedin } from "@subframe/core";
import { FeatherYoutube } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { FeatherGlobe } from "@subframe/core";
import { ListicleCard } from "@/ui/components/ListicleCard";
import { getUserByUsername, getUserStats, getUserRecentLists } from "@/server/db/queries/profiles";
import { formatNumber } from "@/shared/utils/format";
import { formatDistanceToNow } from "date-fns";
import { FollowButton } from "./components/FollowButton";
import { SocialLinks } from "./components/SocialLinks";
import { EmptyListsState } from "./components/EmptyListsState";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Fetch all data server-side for SEO
  const user = await getUserByUsername(username);
  
  if (!user) {
    notFound();
  }

  const [stats, recentLists] = await Promise.all([
    getUserStats(user.id),
    getUserRecentLists(user.id, 6),
  ]);

  const profile = {
    id: user.id,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    website: user.website,
    twitter: user.twitter,
    linkedin: user.linkedin,
    instagram: user.instagram,
    youtube: user.youtube,
    github: user.github,
    created_at: user.created_at.toISOString(),
  };

  return (
    <div className="container max-w-none flex h-full w-full flex-col items-center gap-6 bg-default-background py-12 overflow-auto">
      <div className="flex w-full max-w-[768px] flex-col items-start gap-12">
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-start justify-between">
            <Avatar
              size="x-large"
              image={profile.avatar || undefined}
            >
              {profile.name.charAt(0).toUpperCase()}
            </Avatar>
            <FollowButton username={username} />
          </div>
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-heading-2 font-heading-2 text-default-font">
                {profile.name}
              </span>
              {/* TODO: Add verification logic */}
              <FeatherVerified className="text-heading-3 font-heading-3 text-brand-700" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-caption font-caption text-default-font">
                @{profile.username}
              </span>
              {profile.location && (
                <>
                  <span className="text-caption font-caption text-default-font">
                    •
                  </span>
                  <span className="text-caption font-caption text-default-font">
                    {profile.location}
                  </span>
                </>
              )}
              <span className="text-caption font-caption text-default-font">
                •
              </span>
              <span className="text-caption font-caption text-default-font">
                Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FeatherUsers className="text-body font-body text-subtext-color" />
                <span className="text-body-bold font-body-bold text-default-font">
                  {formatNumber(stats.followersCount)}
                </span>
                <span className="text-body font-body text-subtext-color">
                  followers
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FeatherUserPlus className="text-body font-body text-subtext-color" />
                <span className="text-body-bold font-body-bold text-default-font">
                  {formatNumber(stats.followingCount)}
                </span>
                <span className="text-body font-body text-subtext-color">
                  following
                </span>
              </div>
            </div>
          </div>
          {profile.bio && (
            <span className="text-body font-body text-default-font">
              {profile.bio}
            </span>
          )}
          <SocialLinks
            twitter={profile.twitter}
            instagram={profile.instagram}
            linkedin={profile.linkedin}
            youtube={profile.youtube}
            github={profile.github}
            website={profile.website}
          />
        </div>
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between">
            <span className="text-heading-3 font-heading-3 text-default-font">
              Recent Lists ({stats.listsCount})
            </span>
            {stats.listsCount > recentLists.length && (
              <Link 
                href={`/@${username}/lists`}
                className="text-brand-700 hover:text-brand-800 text-body font-body-bold transition-colors"
              >
                View all
              </Link>
            )}
          </div>
          {recentLists.length > 0 ? (
            <div className="flex w-full flex-wrap items-start gap-4">
              {recentLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/@${username}/${list.slug}`}
                  className="w-full hover:opacity-90 transition-opacity"
                >
                  <ListicleCard
                    image={list.cover_image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"}
                    category="List" // TODO: Add category support
                    title={list.title}
                    description={list.description || ""}
                    author={profile.name}
                    authorAvatar={profile.avatar || undefined}
                    views={formatNumber(list.viewsCount)}
                    likes={formatNumber(list.likesCount)}
                    comments={formatNumber(list.commentsCount)}
                    date={list.published_at ? formatDistanceToNow(new Date(list.published_at), { addSuffix: true }) : "Draft"}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyListsState 
              profileName={profile.name}
              username={username}
            />
          )}
        </div>
      </div>
    </div>
  );
} 